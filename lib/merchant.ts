import { cents, products, stockSku, variantsForProduct } from "./catalog";

export const merchantServiceAccount = "azzura-merchant-sync@azzura-merchant-integration.iam.gserviceaccount.com";
export type MerchantConfig = {
  GOOGLE_MERCHANT_ACCOUNT_ID?: string;
  GOOGLE_MERCHANT_DATA_SOURCE_ID?: string;
  GOOGLE_MERCHANT_PRIVATE_KEY?: string;
  MERCHANT_SYNC_TOKEN?: string;
};

export function merchantProducts(stock: Array<{ sku: string; available: number }>) {
  const quantities = new Map(stock.map((row) => [row.sku, row.available]));
  return products.flatMap((product) => {
    const colours = variantsForProduct(product.id);
    return (colours.length ? colours : [undefined]).map((colour) => ({
      offerId: stockSku(product.id, colour?.id),
      contentLanguage: "en",
      feedLabel: "CA",
      productAttributes: {
        title: colour ? `${product.name} — ${colour.label}` : product.name,
        description: `${product.name} from Azzura's ${product.collection} collection.${colour ? ` Colour: ${colour.label}.` : ""}`,
        link: `https://ozzyazzura.ca/products/${product.id}${colour ? `?colour=${colour.id}` : ""}`,
        imageLink: `https://ozzyazzura.ca${colour?.image ?? product.image}`,
        availability: (quantities.get(stockSku(product.id, colour?.id)) ?? 0) > 0 ? "IN_STOCK" : "OUT_OF_STOCK",
        condition: "NEW",
        price: { amountMicros: String(cents(product.price) * 10000), currencyCode: "CAD" },
        ...(colour ? { color: colour.label, itemGroupId: String(product.id) } : {}),
      },
    }));
  });
}

export async function authorizedMerchantRequest(request: Request, config: MerchantConfig) {
  const expected = config.MERCHANT_SYNC_TOKEN;
  const provided = request.headers.get("authorization")?.replace(/^Bearer /, "");
  if (!expected || expected.length < 32 || !provided) return false;
  const digest = async (value: string) => new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)));
  const [left, right] = await Promise.all([digest(expected), digest(provided)]);
  let difference = 0;
  for (let i = 0; i < left.length; i++) difference |= left[i] ^ right[i];
  return difference === 0;
}

export function merchantConfigured(config: MerchantConfig) {
  return /^\d+$/.test(config.GOOGLE_MERCHANT_ACCOUNT_ID ?? "") &&
    /^\d+$/.test(config.GOOGLE_MERCHANT_DATA_SOURCE_ID ?? "") && Boolean(config.GOOGLE_MERCHANT_PRIVATE_KEY);
}

function base64url(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

export async function merchantAccessToken(privateKey: string, fetcher: typeof fetch = fetch) {
  const encode = (value: object) => base64url(new TextEncoder().encode(JSON.stringify(value)));
  const now = Math.floor(Date.now() / 1000);
  const assertion = `${encode({ alg: "RS256", typ: "JWT" })}.${encode({
    iss: merchantServiceAccount, scope: "https://www.googleapis.com/auth/content",
    aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600,
  })}`;
  const pem = privateKey.replace(/\\n/g, "\n").replace(/-----[^-]+-----/g, "").replace(/\s/g, "");
  const key = await crypto.subtle.importKey("pkcs8", Uint8Array.from(atob(pem), (char) => char.charCodeAt(0)),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(assertion));
  const response = await fetcher("https://oauth2.googleapis.com/token", {
    method: "POST", signal: AbortSignal.timeout(15000),
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${assertion}.${base64url(new Uint8Array(signature))}` }),
  });
  if (!response.ok) throw new Error("Google authentication failed.");
  const result = await response.json() as { access_token?: string };
  if (!result.access_token) throw new Error("Google authentication failed.");
  return result.access_token;
}

export async function syncMerchantProducts(config: MerchantConfig, items: ReturnType<typeof merchantProducts>, fetcher: typeof fetch = fetch) {
  if (!merchantConfigured(config)) throw new Error("Merchant sync is not configured.");
  const token = await merchantAccessToken(config.GOOGLE_MERCHANT_PRIVATE_KEY!, fetcher);
  const source = `accounts/${config.GOOGLE_MERCHANT_ACCOUNT_ID}/dataSources/${config.GOOGLE_MERCHANT_DATA_SOURCE_ID}`;
  const url = `https://merchantapi.googleapis.com/products/v1/accounts/${config.GOOGLE_MERCHANT_ACCOUNT_ID}/productInputs:insert?dataSource=${encodeURIComponent(source)}`;
  const results: Array<{ offerId: string; ok: boolean; status: number }> = [];
  // Bounded concurrency; repeat requests replace the same stable offer IDs.
  for (let offset = 0; offset < items.length; offset += 5) {
    results.push(...await Promise.all(items.slice(offset, offset + 5).map(async (item) => {
      try {
        const response = await fetcher(url, { method: "POST", signal: AbortSignal.timeout(15000),
          headers: { authorization: `Bearer ${token}`, "content-type": "application/json" }, body: JSON.stringify(item) });
        await response.body?.cancel();
        return { offerId: item.offerId, ok: response.ok, status: response.status };
      } catch { return { offerId: item.offerId, ok: false, status: 0 }; }
    })));
  }
  return results;
}
