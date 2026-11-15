import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { currentUser } from "@/lib/server/session";
import { stripeClient } from "@/lib/server/stripe";
import { setCancelAtPeriodEnd } from "@/lib/server/subscription";

export const runtime = "nodejs";

const Body = z.object({ action: z.enum(["cancel", "resume"]) });

export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in first" }, { status: 401 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  const stripe = stripeClient();
  if (!stripe) return NextResponse.json({ error: "Payments are not configured" }, { status: 503 });
  try {
    const subscription = await setCancelAtPeriodEnd(stripe, user.email, parsed.data.action === "cancel");
    return NextResponse.json({ subscription });
  } catch (err) {
    console.error("[subscription]", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Could not update the subscription" }, { status: 502 });
  }
}
