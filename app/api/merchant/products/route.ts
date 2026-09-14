import { env } from "cloudflare:workers";
import { readInventory } from "@/lib/inventory";
import { authorizedMerchantRequest, merchantProducts, type MerchantConfig } from "@/lib/merchant";

export async function GET(request: Request) {
  if (!await authorizedMerchantRequest(request, env as MerchantConfig)) return Response.json({ error: "Not authorized." }, { status: 401 });
  try {
    return Response.json({ products: merchantProducts(await readInventory()) }, { headers: { "cache-control": "no-store" } });
  } catch {
    return Response.json({ error: "Inventory is unavailable." }, { status: 503 });
  }
}
