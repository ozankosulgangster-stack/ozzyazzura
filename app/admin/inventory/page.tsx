import { env } from "cloudflare:workers";
import Link from "next/link";
import { requireChatGPTUser } from "@/app/chatgpt-auth";
import InventoryManager from "./InventoryManager";
export const dynamic = "force-dynamic";
export default async function InventoryPage() {
  const user = await requireChatGPTUser("/admin/inventory");
  const owner = (env as { ADMIN_EMAIL?: string }).ADMIN_EMAIL?.trim().toLowerCase();
  const authorized = Boolean(owner && user.email.trim().toLowerCase() === owner);
  return <main className="commerce-page"><header className="commerce-header"><Link className="wordmark" href="/">AZZURA</Link><nav><Link href="/admin/orders">Orders</Link><Link href="/admin/contacts">Contacts</Link></nav></header><section className="admin-layout"><p className="eyebrow">Azzura operations</p><h1>Inventory</h1>{authorized ? <InventoryManager /> : <p>Sign in with the configured store owner account to manage inventory.</p>}</section></main>;
}
