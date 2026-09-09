import { env } from "cloudflare:workers";
import { getDatabase } from "@/lib/db";

type StripeSession = {
  id: string;
  customer?: string | null;
  payment_intent?: string | null;
  customer_details?: { email?: string | null; name?: string | null; address?: { line1?: string | null; line2?: string | null; city?: string | null; state?: string | null; postal_code?: string | null; country?: string | null } | null } | null;
  metadata?: { order_id?: string; order_number?: string } | null;
};

export async function POST(request: Request) {
  const webhookSecret = (env as { STRIPE_WEBHOOK_SECRET?: string }).STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) return new Response("Webhook is not configured.", { status: 503 });

  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature || !(await verifyStripeSignature(payload, signature, webhookSecret))) {
    return new Response("Invalid signature.", { status: 400 });
  }

  const event = JSON.parse(payload) as { id: string; type: string; data: { object: StripeSession } };
  const session = event.data.object;
  const orderId = session.metadata?.order_id;
  if (!orderId) return new Response("ok");

  const db = getDatabase();
  if (event.type === "checkout.session.completed") {
    const email = session.customer_details?.email?.trim().toLowerCase() || null;
    const address = session.customer_details?.address;
    await db.prepare(`UPDATE orders SET status = 'paid', email = COALESCE(?, email),
      stripe_payment_intent_id = ?, shipping_country = COALESCE(?, shipping_country),
      shipping_province = COALESCE(?, shipping_province), shipping_postal_code = COALESCE(?, shipping_postal_code),
      updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
      .bind(email, session.payment_intent ?? null, address?.country ?? null, address?.state ?? null, address?.postal_code ?? null, orderId).run();

    const order = await db.prepare("SELECT customer_auth_user_id, email FROM orders WHERE id = ?")
      .bind(orderId).first<{ customer_auth_user_id: string | null; email: string }>();
    if (order?.customer_auth_user_id) {
      await db.prepare(`INSERT INTO customers (auth_user_id, email, full_name, stripe_customer_id,
        address_line1, address_line2, city, province, postal_code, country)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(auth_user_id) DO UPDATE SET
        email = excluded.email, stripe_customer_id = COALESCE(excluded.stripe_customer_id, customers.stripe_customer_id),
        full_name = COALESCE(customers.full_name, excluded.full_name),
        address_line1 = COALESCE(customers.address_line1, excluded.address_line1),
        address_line2 = COALESCE(customers.address_line2, excluded.address_line2),
        city = COALESCE(customers.city, excluded.city), province = COALESCE(customers.province, excluded.province),
        postal_code = COALESCE(customers.postal_code, excluded.postal_code),
        country = COALESCE(customers.country, excluded.country),
        updated_at = CURRENT_TIMESTAMP`)
        .bind(order.customer_auth_user_id, email || order.email, session.customer_details?.name ?? null, session.customer ?? null,
          address?.line1 ?? null, address?.line2 ?? null, address?.city ?? null, address?.state ?? null,
          address?.postal_code ?? null, address?.country ?? "CA").run();
    }
  } else if (event.type === "checkout.session.expired") {
    await db.prepare("UPDATE orders SET status = 'expired', updated_at = CURRENT_TIMESTAMP WHERE id = ?")
      .bind(orderId).run();
  }

  return new Response("ok");
}

async function verifyStripeSignature(payload: string, header: string, secret: string) {
  const parts = header.split(",").map((part) => part.split("="));
  const timestamp = parts.find(([key]) => key === "t")?.[1];
  const signatures = parts.filter(([key]) => key === "v1").map(([, value]) => value);
  if (!timestamp || signatures.length === 0 || Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;

  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${timestamp}.${payload}`));
  const expected = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  return signatures.some((signature) => constantTimeEqual(signature, expected));
}

function constantTimeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let result = 0;
  for (let index = 0; index < left.length; index += 1) result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return result === 0;
}
