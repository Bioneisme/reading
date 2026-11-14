import { NextResponse } from "next/server";
import { z } from "zod";
import { coreLexicon } from "@/lib/engine/lexicon";
import { fullLexicon } from "@/lib/server/lexicon-full";

export const runtime = "nodejs";

const Body = z.object({
  words: z.array(z.string().regex(/^[a-z']{1,30}$/)).max(300),
});

function candidates(w: string): string[] {
  const out = [w];
  if (w.endsWith("ing")) out.push(w.slice(0, -3), w.slice(0, -3) + "e", w.slice(0, -4));
  if (w.endsWith("ed")) out.push(w.slice(0, -2), w.slice(0, -1), w.slice(0, -3));
  if (w.endsWith("es")) out.push(w.slice(0, -2));
  if (w.endsWith("s")) out.push(w.slice(0, -1));
  return out;
}

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const full = fullLexicon();
  const entries: Record<string, string[]> = {};
  for (const word of new Set(parsed.data.words)) {
    for (const w of candidates(word)) {
      if (entries[w] || coreLexicon.get(w)) continue;
      const prons = full.get(w);
      if (prons) entries[w] = prons.map((p) => p.join(" "));
    }
  }
  return NextResponse.json({ entries });
}
