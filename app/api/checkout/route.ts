import { env } from "cloudflare:workers";
import { cents, productById } from "@/lib/catalog";
import { getDatabase } from "@/lib/db";
import { calculateShipping } from "@/lib/shipping";

type CheckoutBody = {
  email?: string;
  items?: Array<{ id?: number; quantity?: number }>;
  shipping?: { country?: string; province?: string; postalCode?: string };
};

export async function POST(request: Request) {
  const secretKey = (env as { STRIPE_SECRET_KEY?: string }).STRIPE_SECRET_KEY;
  if (!secretKey) {
    return Response.json({ error: "Secure checkout is not yet activated. Please contact Azzura." }, { status: 503 });
  }

  const body = await request.json().catch(() => null) as CheckoutBody | null;
  const email = body?.email?.trim().toLowerCase();
  const country = body?.shipping?.country?.trim().toUpperCase();
  const province = body?.shipping?.province?.trim() || null;
  const postalCode = body?.shipping?.postalCode?.trim();
  const allowedCountries = ["CA", "US", "GB", "IT", "FR", "DE", "ES", "AU", "JP"];
  if (!email || !email.includes("@") || !country || !allowedCountries.includes(country) || !postalCode || !Array.isArray(body?.items) || body.items.length === 0) {
    return Response.json({ error: "Email, shipping destination, and bag contents are required." }, { status: 400 });
  }

  const items = body.items.map((line) => {
    const product = productById(Number(line.id));
    const quantity = Number(line.quantity);
    return product && Number.isInteger(quantity) && quantity > 0 && quantity <= 10 ? { product, quantity } : null;
  });
  if (items.some((item) => !item) || items.length > 30) {
    return Response.json({ error: "One or more bag items are invalid." }, { status: 400 });
  }

  const validItems = items.filter((item): item is NonNullable<typeof item> => Boolean(item));
  const subtotalCents = validItems.reduce((sum, item) => sum + cents(item.product.price) * item.quantity, 0);
  const quote = calculateShipping(country, subtotalCents);
  const totalCents = subtotalCents + quote.amountCents;
  const orderId = crypto.randomUUID();
  const orderNumber = `AZ-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`;
  const authUserId = request.headers.get("oai-authenticated-user-id");
  const authenticatedEmail = request.headers.get("oai-authenticated-user-email")?.trim().toLowerCase();
  const orderEmail = authenticatedEmail || email;
  const db = getDatabase();

  const statements = [
    db.prepare(`INSERT INTO orders (
      id, order_number, customer_auth_user_id, email, status, subtotal_cents, shipping_cents,
      total_cents, currency, shipping_country, shipping_province, shipping_postal_code
    ) VALUES (?, ?, ?, ?, 'pending', ?, ?, ?, 'cad', ?, ?, ?)`)
      .bind(orderId, orderNumber, authUserId, orderEmail, subtotalCents, quote.amountCents, totalCents, country, province, postalCode),
    ...validItems.map(({ product, quantity }) => db.prepare(`INSERT INTO order_items (
      order_id, product_id, product_name, unit_price_cents, quantity
    ) VALUES (?, ?, ?, ?, ?)`)
      .bind(orderId, product.id, product.name, cents(product.price), quantity)),
  ];
  await db.batch(statements);

  const params = new URLSearchParams();
  params.set("mode", "payment");
  params.set("payment_method_types[0]", "card");
  params.set("customer_creation", "always");
  params.set("customer_email", orderEmail);
  params.set("billing_address_collection", "required");
  params.set("shipping_address_collection[allowed_countries][0]", country);
  params.set("metadata[order_id]", orderId);
  params.set("metadata[order_number]", orderNumber);
  params.set("success_url", `${new URL(request.url).origin}/checkout/success?order=${encodeURIComponent(orderNumber)}&session_id={CHECKOUT_SESSION_ID}`);
  params.set("cancel_url", `${new URL(request.url).origin}/checkout/cancel?order=${encodeURIComponent(orderNumber)}`);

  validItems.forEach(({ product, quantity }, index) => {
    params.set(`line_items[${index}][price_data][currency]`, "cad");
    params.set(`line_items[${index}][price_data][product_data][name]`, product.name);
    params.set(`line_items[${index}][price_data][unit_amount]`, String(cents(product.price)));
    params.set(`line_items[${index}][quantity]`, String(quantity));
  });
  if (quote.amountCents > 0) {
    const index = validItems.length;
    params.set(`line_items[${index}][price_data][currency]`, "cad");
    params.set(`line_items[${index}][price_data][product_data][name]`, quote.label);
    params.set(`line_items[${index}][price_data][unit_amount]`, String(quote.amountCents));
    params.set(`line_items[${index}][quantity]`, "1");
  }

  const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: { authorization: `Bearer ${secretKey}`, "content-type": "application/x-www-form-urlencoded" },
    body: params,
  });
  const stripeSession = await stripeResponse.json() as { id?: string; url?: string; error?: { message?: string } };
  if (!stripeResponse.ok || !stripeSession.id || !stripeSession.url) {
    await db.prepare("UPDATE orders SET status = 'checkout_failed', updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(orderId).run();
    return Response.json({ error: stripeSession.error?.message ?? "Stripe checkout could not be created." }, { status: 502 });
  }

  await db.prepare("UPDATE orders SET stripe_session_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .bind(stripeSession.id, orderId).run();
  return Response.json({ url: stripeSession.url, orderNumber });
}
