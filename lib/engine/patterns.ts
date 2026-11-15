import { coreLexicon, type Lexicon } from "./lexicon";
import { SKILLS, type SkillId } from "./skills";
import type { SessionRecord } from "./types";
import { buildXray } from "./xray";

export interface Notice {
  id: string;
  kind: "pattern" | "progress" | "info";
  skill: SkillId | null;
  title: string;
  detail: string;
  swaps: string[];
  examples: { word: string; said: string | null }[];
  evidence: string;
  trend: number[] | null;
}

const MIN_WORDS = 3;
const MIN_NIGHTS = 2;
const MAX_NOTICES = 3;

const TITLES: Partial<Record<SkillId, string>> = {
  magicE: "Reads the vowel short before a quiet e",
  digraphs: "Reads sh, ch, th as a single letter",
  vowelTeams: "Reads only the first vowel in a vowel team",
  shortVowels: "Mixes up the short vowel sounds",
  initialBlends: "Drops a sound from blends at the start",
  finalBlends: "Drops a sound from blends at the end",
  endings: "Leaves off word endings",
  rControlled: "Reads the vowel without the bossy r",
  tricky: "Gets stuck on tricky words",
  guessing: "Guesses from the first letter",
};

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

function sorted(sessions: SessionRecord[]): SessionRecord[] {
  return [...sessions].sort((a, b) => a.date.localeCompare(b.date) || a.day - b.day);
}

function swapsFor(misses: { word: string; said: string | null }[], lex: Lexicon): string[] {
  const counts = new Map<string, number>();
  for (const m of misses) {
    const x = m.said ? buildXray(m.word, m.said, lex) : null;
    for (const t of x?.tiles ?? []) {
      if (!t.broken || t.silent) continue;
      const key = t.said ? `${t.letters}: /${t.sound}/ → /${t.said}/` : `${t.letters}: /${t.sound}/ → left out`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k);
}

function skillPatterns(list: SessionRecord[], lex: Lexicon): Notice[] {
  const bySkill = new Map<SkillId, { word: string; said: string | null; night: string }[]>();
  for (const s of list)
    for (const m of s.misses) {
      if (m.said === null || m.skill === "other" || m.skill === "bd") continue;
      const arr = bySkill.get(m.skill) ?? [];
      arr.push({ word: m.word, said: m.said, night: s.id });
      bySkill.set(m.skill, arr);
    }
  const out: Notice[] = [];
  for (const [skill, misses] of bySkill) {
    const nights = new Set(misses.map((m) => m.night));
    if (misses.length < MIN_WORDS || nights.size < MIN_NIGHTS) continue;
    const firstIdx = list.findIndex((s) => nights.has(s.id));
    const trend = list.slice(firstIdx).map((s) => s.misses.filter((m) => m.skill === skill).length);
    const improving = trend.length >= 3 && trend[trend.length - 1] < trend[0];
    out.push({
      id: `skill-${skill}`,
      kind: "pattern",
      skill,
      title: TITLES[skill] ?? `Keeps missing ${SKILLS[skill].name.toLowerCase()}`,
      detail: improving
        ? `Fewer each night: ${trend[0]} → ${trend[trend.length - 1]}. Keep going with ${SKILLS[skill].name}.`
        : `The same kind of slip, again and again. That's one skill to practice, not a reading problem.`,
      swaps: skill === "guessing" || skill === "tricky" ? [] : swapsFor(misses, lex),
      examples: misses.slice(0, 4).map(({ word, said }) => ({ word, said })),
      evidence: `Based on ${plural(misses.length, "word")} over ${plural(nights.size, "night")}`,
      trend,
    });
  }
  return out.sort((a, b) => b.examples.length - a.examples.length || (b.trend?.length ?? 0) - (a.trend?.length ?? 0));
}

function fixedWords(list: SessionRecord[]): Notice | null {
  const missedAt = new Map<string, number>();
  const fixed: string[] = [];
  list.forEach((s, i) => {
    const missed = new Set(s.misses.map((m) => m.word));
    for (const w of new Set(s.words)) if (missedAt.has(w) && missedAt.get(w)! < i && !missed.has(w) && !fixed.includes(w)) fixed.push(w);
    for (const w of missed) if (!missedAt.has(w)) missedAt.set(w, i);
  });
  if (fixed.length < 2) return null;
  return {
    id: "fixed",
    kind: "progress",
    skill: null,
    title: "Words that used to trip them up",
    detail: "Missed on an earlier night, read right since.",
    swaps: [],
    examples: fixed.slice(0, 5).map((word) => ({ word, said: null })),
    evidence: `${plural(fixed.length, "word")} fixed`,
    trend: null,
  };
}

function bdMixups(list: SessionRecord[]): Notice | null {
  const misses = list.flatMap((s) => s.misses.filter((m) => m.skill === "bd").map((m) => ({ ...m, night: s.id })));
  const nights = new Set(misses.map((m) => m.night));
  if (misses.length < 2 || nights.size < MIN_NIGHTS) return null;
  return {
    id: "bd",
    kind: "info",
    skill: "bd",
    title: "Mixes up b and d",
    detail: "Very common up to age 7 or 8. A quick trick: “bed” — the b and d are the bedposts.",
    swaps: [],
    examples: misses.slice(0, 4).map(({ word, said }) => ({ word, said })),
    evidence: `Based on ${plural(misses.length, "word")} over ${plural(nights.size, "night")}`,
    trend: null,
  };
}

export function detectPatterns(sessions: SessionRecord[], lex: Lexicon = coreLexicon): Notice[] {
  const list = sorted(sessions);
  if (list.length < MIN_NIGHTS) return [];
  const patterns = skillPatterns(list, lex);
  const extra = [fixedWords(list), bdMixups(list)].filter((n): n is Notice => n !== null);
  return [...patterns.slice(0, MAX_NOTICES - Math.min(extra.length, 1)), ...extra].slice(0, MAX_NOTICES);
}
