import {
  buildPlan,
  computeProfile,
  getDistractors,
  normalizeWord,
  SKILLS,
  summarizeCheck,
  type CheckSummary,
  type Lexicon,
  type Plan,
  type Profile,
  type SessionRecord,
  type SkillId,
} from "@/lib/engine";
import { missExample } from "@/lib/client/progress";

export type SkillKey = SkillId | "other";

export interface MissRow {
  index: number;
  word: string;
  said: string | null;
}

export interface MissGroup {
  skill: SkillKey;
  name: string;
  count: number;
  rows: MissRow[];
}

export interface ResultModel {
  summary: CheckSummary;
  profile: Profile;
  plan: Plan;
  weak: SkillId | null;
  weakCount: number;
  second: { name: string; count: number } | null;
  examples: string[];
  groups: MissGroup[];
}

export function skillName(skill: SkillKey): string {
  return skill === "other" ? "Other misreadings" : SKILLS[skill].name;
}

export function missLine(n: number): string {
  return `${n} ${n === 1 ? "miss" : "misses"}`;
}

export function buildModel(check: SessionRecord, sessions: SessionRecord[], name: string): ResultModel {
  const summary = summarizeCheck(check.words, check.misses);
  const profile = computeProfile(sessions);
  const plan = buildPlan(profile, name);
  const weak = summary.weakSpot;
  const weakGroup = weak ? summary.bySkill.find((g) => g.skill === weak) : undefined;
  const secondGroup = summary.bySkill.find((g) => g.skill !== weak && g.skill !== "other");
  const rows = check.misses.map((m, index) => ({ index, word: m.word, said: m.said, skill: m.skill }));
  const groups = summary.bySkill.map((g) => ({
    skill: g.skill,
    name: skillName(g.skill),
    count: g.count,
    rows: rows.filter((r) => r.skill === g.skill).map(({ index, word, said }) => ({ index, word, said })),
  }));
  return {
    summary,
    profile,
    plan,
    weak,
    weakCount: weakGroup?.count ?? 0,
    second: secondGroup ? { name: SKILLS[secondGroup.skill as SkillId].name, count: secondGroup.count } : null,
    examples: (weakGroup?.misses ?? []).map(missExample),
    groups,
  };
}

export function optionsFor(word: string, first: string | null, lex: Lexicon | undefined): string[] {
  const target = normalizeWord(word);
  let list: string[] = [];
  try {
    list = getDistractors(word, lex, 4).map((d) => d.said);
  } catch {
    list = [];
  }
  if (first) list = [first, ...list];
  const seen = new Set<string>([target]);
  return list
    .filter((s) => {
      const k = normalizeWord(s);
      if (!k || seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .slice(0, 3);
}
