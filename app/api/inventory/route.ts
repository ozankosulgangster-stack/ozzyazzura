import { readInventory } from "@/lib/inventory";
export async function GET() {
  try {
    return Response.json((await readInventory()).map(({ sku, available }) => ({ sku, available })), { headers: { "cache-control": "no-store" } });
  } catch {
    return Response.json({ error: "Stock availability could not be loaded." }, { status: 503 });
  }
}
