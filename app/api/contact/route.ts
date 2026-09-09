import { getDatabase } from "@/lib/db";

type ContactBody = {
  name?: string;
  email?: string;
  message?: string;
  marketingOptIn?: boolean;
  website?: string;
};

function validEmail(email: string) {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as ContactBody | null;
  if (body?.website?.trim()) return Response.json({ saved: true });

  const name = body?.name?.trim() ?? "";
  const email = body?.email?.trim().toLowerCase() ?? "";
  const message = body?.message?.trim() ?? "";
  const marketingOptIn = body?.marketingOptIn === true;
  if (!name || name.length > 120 || !validEmail(email) || !message || message.length > 4000) {
    return Response.json({ error: "Add your name, a valid email, and a message." }, { status: 400 });
  }

  const db = getDatabase();
  const statements = [db.prepare(`INSERT INTO contact_messages
    (id, name, email, message, marketing_opt_in) VALUES (?, ?, ?, ?, ?)`)
    .bind(crypto.randomUUID(), name, email, message, marketingOptIn ? 1 : 0)];
  if (marketingOptIn) {
    statements.push(db.prepare(`INSERT INTO subscribers (email, full_name, source, status)
      VALUES (?, ?, 'contact_form', 'active')
      ON CONFLICT(email) DO UPDATE SET full_name = excluded.full_name, source = 'contact_form',
        status = 'active', consent_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP`)
      .bind(email, name));
  }
  await db.batch(statements);
  return Response.json({ saved: true });
}
