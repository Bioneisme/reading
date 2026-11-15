import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/server/auth";
import { clearSessionCookie, sessionToken } from "@/lib/server/session";

export const runtime = "nodejs";

export async function POST() {
  deleteSession(await sessionToken());
  const res = NextResponse.json({ ok: true });
  clearSessionCookie(res);
  return res;
}
