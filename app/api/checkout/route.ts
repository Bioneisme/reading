import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createCheckoutSession, stripeClient } from "@/lib/server/stripe";

export const runtime = "nodejs";

const Body = z.object({ plan: z.enum(["week", "month", "year"]) });

export async function POST(req: NextRequest) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  const stripe = stripeClient();
  if (!stripe) return NextResponse.json({ error: "Payments are not configured" }, { status: 503 });
  const origin = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin;
  try {
    const url = await createCheckoutSession(stripe, parsed.data.plan, origin);
    return NextResponse.json({ url });
  } catch (err) {
    console.error("[checkout]", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Could not start checkout" }, { status: 502 });
  }
}
