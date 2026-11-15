import { NextResponse } from "next/server";
import { currentUser } from "@/lib/server/session";
import { stripeClient } from "@/lib/server/stripe";
import { NO_SUBSCRIPTION, subscriptionFor } from "@/lib/server/subscription";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ user: null, subscription: NO_SUBSCRIPTION });
  const subscription = await subscriptionFor(stripeClient(), user.email).catch((err) => {
    console.error("[auth/me]", err instanceof Error ? err.message : err);
    return null;
  });
  return NextResponse.json({ user: { email: user.email }, subscription });
}
