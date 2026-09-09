import { getDatabase } from "@/lib/db";

type SubscribeBody = { email?: string; source?: string };

function validEmail(email: string) {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as SubscribeBody | null;
  const email = body?.email?.trim().toLowerCase() ?? "";
  const source = body?.source === "contact_form" ? "contact_form" : "newsletter";
  if (!validEmail(email)) return Response.json({ error: "Enter a valid email address." }, { status: 400 });

  await getDatabase().prepare(`INSERT INTO subscribers (email, source, status)
    VALUES (?, ?, 'active')
    ON CONFLICT(email) DO UPDATE SET source = excluded.source, status = 'active',
      consent_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP`)
    .bind(email, source).run();

  return Response.json({ saved: true });
}
