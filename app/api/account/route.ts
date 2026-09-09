import { getDatabase } from "@/lib/db";

type ProfileBody = {
  fullName?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
};

export async function PATCH(request: Request) {
  const authUserId = request.headers.get("oai-authenticated-user-id");
  const email = request.headers.get("oai-authenticated-user-email")?.trim().toLowerCase();
  if (!authUserId || !email) return Response.json({ error: "Sign in is required." }, { status: 401 });

  const body = await request.json().catch(() => null) as ProfileBody | null;
  const value = (input: string | undefined, max = 120) => input?.trim().slice(0, max) || null;
  const country = value(body?.country, 2)?.toUpperCase() || "CA";
  if (!/^[A-Z]{2}$/.test(country)) return Response.json({ error: "Choose a valid country." }, { status: 400 });

  await getDatabase().prepare(`INSERT INTO customers (
    auth_user_id, email, full_name, address_line1, address_line2, city, province, postal_code, country
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(auth_user_id) DO UPDATE SET email = excluded.email, full_name = excluded.full_name,
    address_line1 = excluded.address_line1, address_line2 = excluded.address_line2,
    city = excluded.city, province = excluded.province, postal_code = excluded.postal_code,
    country = excluded.country, updated_at = CURRENT_TIMESTAMP`)
    .bind(authUserId, email, value(body?.fullName), value(body?.addressLine1), value(body?.addressLine2), value(body?.city), value(body?.province), value(body?.postalCode, 30), country)
    .run();

  return Response.json({ saved: true });
}
