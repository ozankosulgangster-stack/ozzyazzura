import { env } from "cloudflare:workers";
import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { getDatabase } from "@/lib/db";

export const dynamic = "force-dynamic";

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  marketing_opt_in: number;
  status: string;
  created_at: string;
};

type Subscriber = {
  email: string;
  full_name: string | null;
  source: string;
  status: string;
  consent_at: string;
};

export default async function AdminContactsPage() {
  const user = await requireChatGPTUser("/admin/contacts");
  const adminEmail = (env as { ADMIN_EMAIL?: string }).ADMIN_EMAIL?.trim().toLowerCase();
  const authorized = Boolean(adminEmail && user.email.trim().toLowerCase() === adminEmail);
  const db = getDatabase();
  const [contacts, subscribers] = authorized ? await Promise.all([
    db.prepare(`SELECT id, name, email, message, marketing_opt_in, status, created_at
      FROM contact_messages ORDER BY created_at DESC LIMIT 100`).all<ContactMessage>(),
    db.prepare(`SELECT email, full_name, source, status, consent_at
      FROM subscribers WHERE status = 'active' ORDER BY consent_at DESC LIMIT 500`).all<Subscriber>(),
  ]) : [{ results: [] as ContactMessage[] }, { results: [] as Subscriber[] }];

  return <main className="commerce-page"><header className="commerce-header"><a className="wordmark" href="/">AZZURA</a><nav><a href="/admin/orders">Orders</a><a href="/account">My account</a></nav></header><section className="admin-layout admin-contacts"><p className="eyebrow">Azzura relationships</p><h1>Contacts &amp; subscribers</h1>{authorized ? <div className="contact-admin-grid"><section><div className="admin-section-heading"><h2>Customer enquiries</h2><span>{contacts.results.length} recent</span></div>{contacts.results.length ? <div className="contact-message-list">{contacts.results.map((contact) => <article key={contact.id}><div><h3>{contact.name}</h3><a href={`mailto:${contact.email}`}>{contact.email}</a></div><p>{contact.message}</p><small>{contact.created_at} · {contact.marketing_opt_in ? "Marketing opt-in" : "Enquiry only"}</small></article>)}</div> : <p className="admin-empty">No enquiries yet.</p>}</section><section><div className="admin-section-heading"><h2>Notification list</h2><span>{subscribers.results.length} active</span></div>{subscribers.results.length ? <div className="subscriber-list">{subscribers.results.map((subscriber) => <article key={subscriber.email}><div><strong>{subscriber.full_name || subscriber.email}</strong><a href={`mailto:${subscriber.email}`}>{subscriber.email}</a></div><small>{subscriber.source.replace("_", " ")} · consent {subscriber.consent_at}</small></article>)}</div> : <p className="admin-empty">No subscribers yet.</p>}</section></div> : <div className="admin-notice"><h2>Admin access is not configured.</h2><p>Add the store owner email to activate this private customer inbox.</p></div>}</section></main>;
}
