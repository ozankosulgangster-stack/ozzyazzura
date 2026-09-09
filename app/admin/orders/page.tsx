import { env } from "cloudflare:workers";
import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { getDatabase } from "@/lib/db";
import OrderManager, { type ManagedOrder } from "./OrderManager";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const user = await requireChatGPTUser("/admin/orders");
  const adminEmail = (env as { ADMIN_EMAIL?: string }).ADMIN_EMAIL?.trim().toLowerCase();
  const authorized = Boolean(adminEmail && user.email.trim().toLowerCase() === adminEmail);
  const orders = authorized ? await getDatabase().prepare(`SELECT order_number, email, status, total_cents,
    tracking_carrier, tracking_number, tracking_url, created_at, updated_at
    FROM orders ORDER BY created_at DESC LIMIT 100`).all<ManagedOrder>() : { results: [] as ManagedOrder[] };

  return <main className="commerce-page"><header className="commerce-header"><a className="wordmark" href="/">AZZURA</a><nav><a href="/">Shop</a><a href="/admin/contacts">Contacts</a><a href="/account">My account</a></nav></header><section className="admin-layout"><p className="eyebrow">Azzura operations</p><h1>Orders &amp; fulfilment</h1>{authorized ? <OrderManager initialOrders={orders.results} /> : <div className="admin-notice"><h2>Admin access is not configured.</h2><p>Add the store owner email to activate this private order-management page.</p></div>}</section></main>;
}
