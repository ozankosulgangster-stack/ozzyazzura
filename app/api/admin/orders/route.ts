import { env } from "cloudflare:workers";
import { getDatabase } from "@/lib/db";
import { trackingUrl } from "@/lib/shipping";

const statuses = ["pending", "paid", "preparing", "shipped", "delivered", "cancelled", "refunded"];

function authorized(request: Request) {
  const email = request.headers.get("oai-authenticated-user-email")?.trim().toLowerCase();
  const adminEmail = (env as { ADMIN_EMAIL?: string }).ADMIN_EMAIL?.trim().toLowerCase();
  return Boolean(email && adminEmail && email === adminEmail);
}

export async function GET(request: Request) {
  if (!authorized(request)) return Response.json({ error: "Not authorized." }, { status: 403 });
  const result = await getDatabase().prepare(`SELECT order_number, email, status, total_cents,
    tracking_carrier, tracking_number, tracking_url, created_at, updated_at
    FROM orders ORDER BY created_at DESC LIMIT 100`).all();
  return Response.json(result.results);
}

export async function PATCH(request: Request) {
  if (!authorized(request)) return Response.json({ error: "Not authorized." }, { status: 403 });
  const body = await request.json().catch(() => null) as { orderNumber?: string; status?: string; carrier?: string; trackingNumber?: string } | null;
  const orderNumber = body?.orderNumber?.trim().toUpperCase();
  const status = body?.status?.trim().toLowerCase();
  const carrier = body?.carrier?.trim().slice(0, 60) || null;
  const trackingNumber = body?.trackingNumber?.trim().slice(0, 120) || null;
  if (!orderNumber || !status || !statuses.includes(status)) return Response.json({ error: "Order and valid status are required." }, { status: 400 });

  const result = await getDatabase().prepare(`UPDATE orders SET status = ?, tracking_carrier = ?,
    tracking_number = ?, tracking_url = ?, updated_at = CURRENT_TIMESTAMP WHERE order_number = ?`)
    .bind(status, carrier, trackingNumber, trackingUrl(carrier, trackingNumber), orderNumber).run();
  if (!result.meta.changes) return Response.json({ error: "Order not found." }, { status: 404 });
  return Response.json({ saved: true, trackingUrl: trackingUrl(carrier, trackingNumber) });
}
