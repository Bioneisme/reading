import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createLoginToken } from "@/lib/server/auth";
import { sendLoginEmail } from "@/lib/server/mailer";
import { siteOrigin } from "@/lib/server/session";

export const runtime = "nodejs";

const Body = z.object({ email: z.string().trim().email().max(254), next: z.string().max(200).optional() });

export async function POST(req: NextRequest) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
  const token = createLoginToken(parsed.data.email, parsed.data.next);
  if (!token) return NextResponse.json({ error: "Too many links requested. Try again in 15 minutes." }, { status: 429 });
  const origin = siteOrigin(req);
  const link = `${origin}/auth/verify?token=${encodeURIComponent(token)}`;
  try {
    const result = await sendLoginEmail(parsed.data.email, link);
    return NextResponse.json({ ok: true, ...(result.sent ? {} : { devLink: result.devLink }) });
  } catch (err) {
    console.error("[auth/request]", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "We couldn't send the email. Try again in a minute." }, { status: 502 });
  }
}
