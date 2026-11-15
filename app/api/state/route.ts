import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getState, putState } from "@/lib/server/auth";
import { currentUser } from "@/lib/server/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 512 * 1024;

const State = z
  .object({
    child: z.object({ name: z.string().max(60), grade: z.enum(["K", "1", "2", "3"]) }).nullable(),
    quiz: z.unknown(),
    sessions: z.array(z.object({ id: z.string().max(100) }).passthrough()).max(2000),
    reminderTime: z.string().regex(/^\d{2}:\d{2}$/),
  })
  .passthrough();

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in first" }, { status: 401 });
  const row = getState(user.id);
  return NextResponse.json({ state: row?.data ?? null, updatedAt: row?.updatedAt ?? null });
}

export async function PUT(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in first" }, { status: 401 });
  const text = await req.text();
  if (Buffer.byteLength(text) > MAX_BYTES) return NextResponse.json({ error: "State is too large" }, { status: 413 });
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = z.object({ state: State }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid state" }, { status: 400 });
  const { child, quiz, sessions, reminderTime } = parsed.data.state;
  putState(user.id, { child, quiz, sessions, reminderTime });
  return NextResponse.json({ ok: true });
}
