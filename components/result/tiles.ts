import type { SkillId } from "@/lib/engine";

export interface TileSpec {
  from: string;
  to: string;
  caption: string;
  tone: "lamp" | "indigo";
}

export const SKILL_TILES: Record<SkillId, TileSpec> = {
  shortVowels: { from: "bad", to: "bed", caption: "bad or bed? Listen to the middle", tone: "lamp" },
  magicE: { from: "tap", to: "tape", caption: "tap → tape: the quiet e changes the a", tone: "lamp" },
  digraphs: { from: "sip", to: "ship", caption: "s and h team up to make one sound", tone: "lamp" },
  initialBlends: { from: "top", to: "stop", caption: "top → stop: say both sounds at the start", tone: "lamp" },
  finalBlends: { from: "had", to: "hand", caption: "had → hand: say both sounds at the end", tone: "lamp" },
  endings: { from: "ride", to: "rides", caption: "ride → rides: keep the ending", tone: "lamp" },
  vowelTeams: { from: "ran", to: "rain", caption: "ran → rain: two vowels, one long sound", tone: "lamp" },
  rControlled: { from: "bid", to: "bird", caption: "bid → bird: the bossy r changes the vowel", tone: "lamp" },
  bd: { from: "big", to: "dig", caption: "big or dig? b and d face opposite ways", tone: "lamp" },
  tricky: { from: "sed", to: "said", caption: "said is a rule-breaker: learn it by heart", tone: "lamp" },
  guessing: { from: "house", to: "horse", caption: "house or horse? The middle matters", tone: "indigo" },
};

export function changedLetters(from: string, to: string): Set<number> {
  let p = 0;
  while (p < from.length && p < to.length && from[p] === to[p]) p++;
  let s = 0;
  while (s < from.length - p && s < to.length - p && from[from.length - 1 - s] === to[to.length - 1 - s]) s++;
  const out = new Set<number>();
  for (let i = p; i < to.length - s; i++) out.add(i);
  return out;
}
