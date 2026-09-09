import { calculateShipping } from "@/lib/shipping";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { country?: string; subtotalCents?: number } | null;
  if (!body || typeof body.country !== "string" || !Number.isInteger(body.subtotalCents) || (body.subtotalCents ?? 0) < 0) {
    return Response.json({ error: "Invalid shipping request." }, { status: 400 });
  }
  return Response.json(calculateShipping(body.country, body.subtotalCents!));
}
