import { env } from "cloudflare:workers";
import { getDatabase } from "@/lib/db";
import { readInventory } from "@/lib/inventory";
import { stockCatalog } from "@/lib/catalog";
function admin(request: Request) {
  const email = request.headers.get("oai-authenticated-user-email")?.trim().toLowerCase();
  const owner = (env as { ADMIN_EMAIL?: string }).ADMIN_EMAIL?.trim().toLowerCase();
  return email && owner && email === owner ? email : null;
}
export async function GET(request: Request) {
  if (!admin(request)) return Response.json({ error: "Not authorized." }, { status: 403 });
  const history = await getDatabase().prepare("SELECT sku, delta, reason, actor, created_at FROM inventory_adjustments ORDER BY created_at DESC, rowid DESC LIMIT 100").all();
  return Response.json({ items: await readInventory(), history: history.results }, { headers: { "cache-control": "no-store" } });
}
export async function POST(request: Request) {
  const actor = admin(request);
  if (!actor) return Response.json({ error: "Not authorized." }, { status: 403 });
  const body = await request.json().catch(() => null) as { id?: string; sku?: string; delta?: number; reason?: string } | null;
  if (!body || typeof body.id !== "string" || !/^[0-9a-f-]{36}$/i.test(body.id) || !stockCatalog.some((item) => item.sku === body.sku) || !Number.isSafeInteger(body.delta) || !body.delta || Math.abs(body.delta) > 100000 || typeof body.reason !== "string" || !body.reason.trim() || body.reason.length > 300) {
    return Response.json({ error: "Choose a product, enter a whole-number adjustment and a reason." }, { status: 400 });
  }
  try {
    await getDatabase().prepare("INSERT INTO inventory_adjustments (id, sku, delta, reason, actor) VALUES (?, ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING")
      .bind(body.id, body.sku, body.delta, body.reason.trim(), actor).run();
    return Response.json({ saved: true, items: await readInventory() });
  } catch (error) {
    if (String(error).includes("insufficient_stock")) return Response.json({ error: "This would reduce stock below the quantity reserved for checkout. Refresh and try a smaller adjustment." }, { status: 409 });
    return Response.json({ error: "Stock could not be saved. Retry the same adjustment." }, { status: 503 });
  }
}
