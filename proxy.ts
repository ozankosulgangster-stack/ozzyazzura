import { NextRequest, NextResponse } from "next/server";
export function proxy(request: NextRequest) {
  if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
    const origin = request.headers.get("origin");
    const expected = process.env.NEXTAUTH_URL;
    if (!expected || origin !== new URL(expected).origin || !request.headers.get("content-type")?.startsWith("application/json")) {
      return NextResponse.json({ error: "Request origin is not allowed." }, { status: 403 });
    }
  }
  return NextResponse.next();
}
export const config = { matcher: ["/api/account", "/api/admin/:path*", "/api/checkout"] };
