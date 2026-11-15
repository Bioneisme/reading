import { coreLexicon, type Lexicon } from "./lexicon";
import { analyzeWord } from "./phonics";
import { PHONICS_SKILLS, SKILL_ORDER, type SkillId } from "./skills";
import type { CheckSummary, Miss, Profile, SessionRecord, SkillState, SkillStatus } from "./types";

const DECAY = 0.7;
const MIN_ATTEMPTS = 3;
const MASTERED_RATE = 0.15;
const MASTERED_ATTEMPTS = 8;

const order = (s: SkillId | "other") => (s === "other" ? 99 : SKILL_ORDER.indexOf(s));

export function summarizeCheck(words: string[], misses: Miss[]): CheckSummary {
  const by = new Map<SkillId | "other", Miss[]>();
  for (const m of misses) by.set(m.skill, [...(by.get(m.skill) ?? []), m]);
  const bySkill = [...by.entries()]
    .map(([skill, ms]) => ({ skill, count: ms.length, misses: ms }))
    .sort((a, b) => b.count - a.count || order(a.skill) - order(b.skill));
  const top = bySkill.find((b) => b.skill !== "other");
  return { totalWords: words.length, totalMisses: misses.length, bySkill, weakSpot: top && top.skill !== "other" ? top.skill : null };
}

export function computeProfile(sessions: SessionRecord[], lex: Lexicon = coreLexicon): Profile {
  const list = [...sessions].sort((a, b) => a.day - b.day || a.date.localeCompare(b.date));
  const n = list.length;
  const acc = Object.fromEntries(
    SKILL_ORDER.map((s) => [s, { a: 0, e: 0, raw: 0, hist: new Array<number>(n).fill(0) }]),
  ) as Record<SkillId, { a: number; e: number; raw: number; hist: number[] }>;

  list.forEach((sess, k) => {
    const w = Math.pow(DECAY, n - 1 - k);
    const missed = new Map(sess.misses.map((m) => [m.word, m.skill]));
    for (const word of new Set(sess.words)) {
      const practices = new Set(analyzeWord(word, lex)?.practices ?? []);
      const ms = missed.get(word);
      if (ms && ms !== "other") practices.add(ms);
      for (const p of practices) { acc[p].a += w; acc[p].raw += 1; }
    }
    for (const m of sess.misses) {
      if (m.skill === "other") continue;
      acc[m.skill].e += w;
      acc[m.skill].hist[k] += 1;
    }
  });

  const skills = {} as Record<SkillId, SkillState>;
  for (const s of SKILL_ORDER) {
    const { a, e, raw, hist } = acc[s];
    const rate = (e + 1) / (a + 2);
    let status: SkillStatus;
    const hadErrors = hist.some((x) => x > 0);
    const last = hist.at(-1) ?? 0;
    const peak = Math.max(0, ...hist.slice(0, -1));
    if (raw < MIN_ATTEMPTS && !hadErrors) status = "notChecked";
    else if (rate <= MASTERED_RATE && raw >= MASTERED_ATTEMPTS && hist.slice(-2).every((x) => x === 0)) status = "mastered";
    else if (!hadErrors) status = raw >= MASTERED_ATTEMPTS ? "improving" : "notChecked";
    else if (n >= 2 && last < peak) status = "improving";
    else status = "needsWork";
    const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
    const progress =
      status === "mastered"
        ? 1
        : status === "notChecked"
          ? 0
          : status === "improving"
            ? 0.55 + 0.3 * clamp01(1 - (rate - MASTERED_RATE) / 0.35)
            : 0.1 + 0.15 * clamp01(1 - rate / 0.5);
    skills[s] = { skill: s, attempts: a, errors: e, rawAttempts: raw, rate, status, history: hist, progress };
  }

  const candidates = SKILL_ORDER.filter(
    (s) => skills[s].errors > 0 && skills[s].rawAttempts >= MIN_ATTEMPTS && skills[s].status !== "mastered",
  ).sort((x, y) => skills[y].rate - skills[x].rate || order(x) - order(y));
  const fallback = PHONICS_SKILLS.find((s) => skills[s].status !== "mastered") ?? "vowelTeams";
  const current = [...list].reverse().find((s) => s.kind === "nightly")?.focus;
  const lastWeak = n ? summarizeCheck(list[n - 1].words, list[n - 1].misses).weakSpot : null;
  const focus =
    current && skills[current].status !== "mastered"
      ? current
      : lastWeak && skills[lastWeak].status !== "mastered"
        ? lastWeak
        : (candidates[0] ?? fallback);
  const nextUp = candidates.find((s) => s !== focus) ?? PHONICS_SKILLS.find((s) => s !== focus && skills[s].status !== "mastered") ?? null;

  let round = 1;
  for (let k = n - 1; k >= 0 && list[k].kind === "nightly" && list[k].focus === focus; k--) round++;

  return { skills, focus, nextUp, round, missesPerNight: list.map((s) => s.misses.length) };
}

export function allowedSkills(profile: Profile): SkillId[] {
  const fi = PHONICS_SKILLS.indexOf(profile.focus);
  return PHONICS_SKILLS.filter((s, i) => {
    const st = profile.skills[s].status;
    if (s === profile.focus) return true;
    if (st === "mastered" || st === "improving") return true;
    return fi >= 0 ? i < fi && st !== "needsWork" : i <= PHONICS_SKILLS.indexOf("endings") && st !== "needsWork";
  });
}
