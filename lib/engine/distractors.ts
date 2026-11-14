import { DOLCH, WORDBANK } from "../../data/wordbank";
import { classifyMiss } from "./classify";
import { coreLexicon, type Lexicon } from "./lexicon";
import { analyzeWord } from "./phonics";
import type { SkillId } from "./skills";
import { normalizeWord } from "./text";
import type { Distractor } from "./types";
import { bdSwaps, trickyVariants, variantsFor } from "./variants";

const OFFER_ORDER: SkillId[] = [
  "endings",
  "magicE",
  "vowelTeams",
  "rControlled",
  "digraphs",
  "initialBlends",
  "finalBlends",
  "bd",
  "shortVowels",
];

const BLOCKED = new Set(
  "dike dyke damn hell shit fuck crap piss dick cock tit tits fag sex ass butt kill rape slut cum porn nazi poop".split(" "),
);

const POOL = [...new Set([...WORDBANK, ...DOLCH])];
const KID_WORDS = new Set(POOL);

function okSpelling(s: string, target: string): boolean {
  return s !== target && s.length >= 2 && /^[a-z']+$/.test(s) && !BLOCKED.has(s);
}

function guessingCandidates(t: string, lex: Lexicon, as: "guessing" | "tricky" = "guessing"): string[] {
  const prefix = (w: string) => { let i = 0; while (i < w.length && w[i] === t[i]) i++; return i; };
  const score = (w: string) =>
    2 * prefix(w) + (w.at(-1) === t.at(-1) ? 2 : 0) + (w.length === t.length ? 1 : 0) + [...new Set(w)].filter((c) => t.includes(c)).length;
  return POOL.filter(
    (w) => w[0] === t[0] && !w.startsWith(t) && !t.startsWith(w) && Math.abs(w.length - t.length) <= 1 && !BLOCKED.has(w),
  )
    .sort((a, b) => score(b) - score(a) || a.localeCompare(b))
    .filter((w) => classifyMiss(t, w, lex) === as)
    .slice(0, 3);
}

export function getDistractors(target: string, lex: Lexicon = coreLexicon, max = 4): Distractor[] {
  const t = normalizeWord(target);
  const A = analyzeWord(t, lex);
  const pools: Distractor[][] = [];

  if (A?.tricky) {
    const sp = trickyVariants(t).filter((s) => okSpelling(s, t) && KID_WORDS.has(s));
    const look = guessingCandidates(t, lex, "tricky");
    const all = [...new Set([...sp, ...look])].slice(0, max);
    return all.map((said) => ({ said, skill: "tricky" }));
  } else if (A) {
    for (const skill of OFFER_ORDER) {
      if (skill !== "bd" && skill !== "endings" && !A.skills.includes(skill)) continue;
      if (skill === "endings" && !A.suffix) continue;
      let sp =
        skill === "bd"
          ? bdSwaps(t).filter((x) => KID_WORDS.has(x))
          : [...new Set(variantsFor(A, skill).map((v) => v.spelling).filter(Boolean))];
      sp = sp.filter((s) => okSpelling(s, t) && classifyMiss(t, s, lex) === skill);
      if (skill === "shortVowels") sp.sort((a, b) => Number(KID_WORDS.has(b)) - Number(KID_WORDS.has(a)));
      if (sp.length) pools.push(sp.map((said) => ({ said, skill })));
    }
  }

  const guess: Distractor[] = guessingCandidates(t, lex).map((said) => ({ said, skill: "guessing" }));
  const out: Distractor[] = [];
  const seen = new Set<string>();
  const take = (d: Distractor | undefined) => {
    if (d && !seen.has(d.said) && out.length < max) { seen.add(d.said); out.push(d); }
  };
  for (const p of pools) if (out.length < max - 1) take(p[0]);
  take(guess[0]);
  for (let i = 1; out.length < max && i < 4; i++) {
    for (const p of pools) take(p[i]);
    take(guess[i]);
  }
  return out;
}
