import { env } from "cloudflare:workers";
import { readInventory } from "@/lib/inventory";
import { authorizedMerchantRequest, merchantConfigured, merchantProducts, syncMerchantProducts, type MerchantConfig } from "@/lib/merchant";

export async function POST(request: Request) {
  const config = env as MerchantConfig;
  if (!await authorizedMerchantRequest(request, config)) return Response.json({ error: "Not authorized." }, { status: 401 });
  if (!merchantConfigured(config)) return Response.json({ error: "Merchant sync is not configured." }, { status: 503 });
  try {
    const results = await syncMerchantProducts(config, merchantProducts(await readInventory()));
    const failed = results.filter((result) => !result.ok).length;
    return Response.json({ submitted: results.length - failed, failed, results }, { status: failed ? 502 : 200, headers: { "cache-control": "no-store" } });
  } catch {
    return Response.json({ error: "Sync could not complete. Check inventory and Google service-account configuration." }, { status: 503 });
  }
}
