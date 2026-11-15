import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { buildXray, SKILLS } from "@/lib/engine";
import { createCoachWriter } from "@/lib/server/claude";
import { fullLexicon } from "@/lib/server/lexicon-full";
import { coachTip } from "@/lib/server/xray-service";

export const runtime = "nodejs";

const Body = z.object({
  word: z.string().regex(/^[A-Za-z']{1,30}$/),
  said: z.string().regex(/^[A-Za-z']{1,30}$/).nullable(),
});

export async function POST(req: NextRequest) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const x = buildXray(parsed.data.word, parsed.data.said, fullLexicon());
  if (!x) return NextResponse.json({ error: "Unknown word" }, { status: 404 });
  const script = x.skill === "other" ? "" : SKILLS[x.skill].scripts("")[0];
  const tip = await coachTip(x, script, createCoachWriter());
  return NextResponse.json({ xray: x, tip, source: tip ? "ai" : "engine" });
}
