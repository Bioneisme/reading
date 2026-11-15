import { NextResponse, type NextRequest } from "next/server";
import { claimCheckout, createSession, upsertUser } from "@/lib/server/auth";
import { currentUser, setSessionCookie } from "@/lib/server/session";
import { checkoutResult, stripeClient } from "@/lib/server/stripe";
import { subscriptionFor } from "@/lib/server/subscription";

export const runtime = "nodejs";

const CLAIM_WINDOW_MS = 60 * 60 * 1000;

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("session_id");
  if (!id || !/^cs_[A-Za-z0-9_]+$/.test(id)) return NextResponse.json({ paid: false, error: "Missing session" }, { status: 400 });
  const stripe = stripeClient();
  if (!stripe) return NextResponse.json({ paid: false, error: "Payments are not configured" }, { status: 503 });
  let result;
  try {
    result = await checkoutResult(stripe, id);
  } catch {
    return NextResponse.json({ paid: false, error: "Unknown session" }, { status: 404 });
  }
  if (!result.paid) return NextResponse.json({ paid: false, email: null });
  if (result.email) await subscriptionFor(stripe, result.email, true).catch(() => null);
  const user = await currentUser();
  if (user && user.email !== result.email) await subscriptionFor(stripe, user.email, true).catch(() => null);
  if (user) return NextResponse.json({ paid: true, email: user.email });
  if (!result.email || Date.now() - result.createdAt > CLAIM_WINDOW_MS) return NextResponse.json({ paid: true, email: null });
  const owner = upsertUser(result.email);
  if (!claimCheckout(id, owner.id)) return NextResponse.json({ paid: true, email: null });
  const res = NextResponse.json({ paid: true, email: owner.email });
  setSessionCookie(res, createSession(owner.id));
  return res;
}
