import { getDatabase } from "@/lib/db";

type TrackedOrder = {
  order_number: string;
  status: string;
  total_cents: number;
  currency: string;
  tracking_carrier: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  created_at: string;
  updated_at: string;
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const orderNumber = url.searchParams.get("order")?.trim().toUpperCase();
  const email = url.searchParams.get("email")?.trim().toLowerCase();
  if (!orderNumber || !email) return Response.json({ error: "Order number and email are required." }, { status: 400 });

  const order = await getDatabase().prepare(`SELECT order_number, status, total_cents, currency,
    tracking_carrier, tracking_number, tracking_url, created_at, updated_at
    FROM orders WHERE order_number = ? AND lower(email) = ?`).bind(orderNumber, email).first<TrackedOrder>();
  if (!order) return Response.json({ error: "We could not find an order matching those details." }, { status: 404 });
  return Response.json(order);
}
