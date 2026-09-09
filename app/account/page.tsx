import { requireChatGPTUser, chatGPTSignOutPath } from "@/app/chatgpt-auth";
import { getDatabase } from "@/lib/db";
import ProfileForm, { type Profile } from "./ProfileForm";

export const dynamic = "force-dynamic";

type Order = { order_number: string; status: string; total_cents: number; created_at: string; tracking_url: string | null };

export default async function AccountPage() {
  const user = await requireChatGPTUser("/account");
  const db = getDatabase();
  const profile = await db.prepare(`SELECT full_name, address_line1, address_line2, city, province, postal_code, country
    FROM customers WHERE auth_user_id = ?`).bind(user.userId).first<Profile>();
  const orders = await db.prepare(`SELECT order_number, status, total_cents, created_at, tracking_url
    FROM orders WHERE customer_auth_user_id = ? ORDER BY created_at DESC LIMIT 50`).bind(user.userId).all<Order>();

  return <main className="commerce-page">
    <header className="commerce-header"><a className="wordmark" href="/">AZZURA</a><nav><a href="/">Shop</a><a href="/track">Track order</a><a href="/admin/orders">Manage orders</a><a href={chatGPTSignOutPath("/")}>Sign out</a></nav></header>
    <section className="account-hero"><p className="eyebrow">My Azzura</p><h1>Welcome, {user.displayName}.</h1><p>Your saved delivery details and order history stay connected to your secure account.</p></section>
    <section className="account-grid">
      <ProfileForm profile={profile} />
      <div className="order-history"><h2>Your orders</h2>{orders.results.length === 0 ? <p>No orders yet.</p> : orders.results.map((order: Order) => <article key={order.order_number}><div><strong>{order.order_number}</strong><span>{new Date(order.created_at).toLocaleDateString("en-CA")}</span></div><div><span className={`order-status status-${order.status}`}>{order.status.replaceAll("_", " ")}</span><strong>CA${(order.total_cents / 100).toFixed(2)}</strong></div>{order.tracking_url && <a href={order.tracking_url} target="_blank" rel="noreferrer">Track shipment →</a>}</article>)}</div>
    </section>
  </main>;
}
