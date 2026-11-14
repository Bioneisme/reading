import { NextResponse, type NextRequest } from "next/server";
import { isSessionPaid, stripeClient } from "@/lib/server/stripe";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("session_id");
  if (!id || !/^cs_[A-Za-z0-9_]+$/.test(id)) return NextResponse.json({ paid: false, error: "Missing session" }, { status: 400 });
  const stripe = stripeClient();
  if (!stripe) return NextResponse.json({ paid: false, error: "Payments are not configured" }, { status: 503 });
  try {
    return NextResponse.json({ paid: await isSessionPaid(stripe, id) });
  } catch {
    return NextResponse.json({ paid: false, error: "Unknown session" }, { status: 404 });
  }
}
