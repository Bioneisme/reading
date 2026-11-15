import { NextResponse, type NextRequest } from "next/server";
import { consumeLoginToken, createSession, upsertUser } from "@/lib/server/auth";
import { setSessionCookie } from "@/lib/server/session";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const origin = process.env.SITE_URL || req.nextUrl.origin;
  const t = req.nextUrl.searchParams.get("token");
  const login = t ? consumeLoginToken(t) : null;
  if (!login) return NextResponse.redirect(new URL("/signin?error=expired", origin));
  const user = upsertUser(login.email);
  const res = NextResponse.redirect(new URL(`/signin?signed=1&next=${encodeURIComponent(login.next)}`, origin));
  setSessionCookie(res, createSession(user.id));
  return res;
}
