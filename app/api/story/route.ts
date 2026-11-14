import { NextResponse } from "next/server";
import { z } from "zod";
import { SKILL_ORDER, type SkillId } from "@/lib/engine";
import { createClaudeWriter } from "@/lib/server/claude";
import { fullLexicon } from "@/lib/server/lexicon-full";
import { generateStory } from "@/lib/server/story-service";

export const runtime = "nodejs";
export const maxDuration = 60;

const Skill = z.enum(SKILL_ORDER as [SkillId, ...SkillId[]]);
const Body = z.object({
  focus: Skill,
  allowed: z.array(Skill).max(11),
  childName: z.string().trim().max(40).default("your child"),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const result = await generateStory(parsed.data, { writer: createClaudeWriter(), lex: fullLexicon() });
  return NextResponse.json(result);
}
