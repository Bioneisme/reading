import { DOLCH_SET, analyzeWord } from "./phonics";
import { coreLexicon, type Lexicon } from "./lexicon";
import type { SkillId } from "./skills";
import { tokenize } from "./text";
import type { StoryToken } from "./types";

export function annotateText(text: string, lex: Lexicon = coreLexicon, allowed?: SkillId[]): StoryToken[] {
  const allow = allowed ? new Set(allowed) : null;
  return tokenize(text).map((t) => {
    if (!t.word) return { text: t.text, word: null, practices: [], tricky: false };
    const A = analyzeWord(t.word, lex);
    const sight = !!allow && DOLCH_SET.has(t.word) && !!A && !A.tricky && !A.skills.every((s) => allow.has(s));
    if (sight) return { text: t.text, word: t.word, practices: ["tricky"], tricky: true };
    return {
      text: t.text,
      word: t.word,
      practices: A ? [...A.skills, ...(A.tricky ? (["tricky"] as SkillId[]) : [])] : [],
      tricky: !!A?.tricky,
    };
  });
}

export function validateStory(
  text: string,
  allowed: SkillId[],
  opts: { names?: string[]; lex?: Lexicon } = {},
): { ok: boolean; bad: string[] } {
  const lex = opts.lex ?? coreLexicon;
  const names = new Set((opts.names ?? []).map((n) => n.toLowerCase()));
  const allow = new Set(allowed);
  const bad: string[] = [];
  for (const t of tokenize(text)) {
    const w = t.word;
    if (!w || names.has(w) || DOLCH_SET.has(w)) continue;
    const A = analyzeWord(w, lex);
    const ok = !!A && A.decodable && A.skills.every((s) => allow.has(s));
    if (!ok && !bad.includes(w)) bad.push(w);
  }
  return { ok: bad.length === 0, bad };
}
