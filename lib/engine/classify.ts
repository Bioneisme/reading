import { coreLexicon, type Lexicon } from "./lexicon";
import { analyzeWord, pronounce } from "./phonics";
import { SKILL_ORDER, type SkillId } from "./skills";
import { normalizeWord } from "./text";
import { isBdSwap, variantsFor } from "./variants";

export const RULE_ORDER: SkillId[] = [
  "endings",
  "magicE",
  "digraphs",
  "initialBlends",
  "finalBlends",
  "vowelTeams",
  "rControlled",
  "shortVowels",
];

const eq = (a: string[], b: string[]) => a.length === b.length && a.every((x, i) => x === b[i]);

export function classifyMiss(target: string, said: string | null, lex: Lexicon = coreLexicon): SkillId | "other" {
  const t = normalizeWord(target);
  const A = analyzeWord(t, lex);

  if (said === null || !normalizeWord(said)) {
    if (!A) return "other";
    if (A.tricky) return "tricky";
    const hard = [...A.skills].reverse().find((s) => s !== "shortVowels") ?? A.skills[0];
    return hard ?? "other";
  }

  const s = normalizeWord(said);
  if (s === t) return "other";
  if (A?.tricky) return "tricky";
  if (isBdSwap(t, s)) return "bd";

  if (A) {
    const saidProns = pronounce(s, lex);
    for (const skill of RULE_ORDER) {
      if (skill === "endings" ? !A.suffix : !A.skills.includes(skill)) continue;
      for (const v of variantsFor(A, skill)) {
        if (v.spelling && v.spelling === s) return skill;
        if (v.prons.some((p) => saidProns.some((q) => eq(p, q)))) return skill;
      }
    }
  }

  if (s[0] === t[0]) return "guessing";
  return "other";
}

export { SKILL_ORDER };
