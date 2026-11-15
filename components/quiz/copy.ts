import { GRADE_LABEL } from "@/lib/client/progress";
import { QUIZ_SIGNS, type Grade, type SkillId } from "@/lib/engine";

const SIGN_VIEW: Record<string, { visual: string; label: string; skill: string; tint: string }> = {
  tape: { visual: "tape → tap", label: "Reads “tap” for “tape”", skill: "Magic e", tint: "bg-lamp-tint" },
  ship: { visual: "ship → s-hip", label: "Reads “ship” as “s-hip”", skill: "Letter teams (sh, ch, th)", tint: "bg-indigo-tint" },
  guess: { visual: "horse → house", label: "Guesses from the first letter", skill: "Guessing from the first letter", tint: "bg-needs-tint" },
  bd: { visual: "b · d", label: "Mixes up b and d", skill: "b and d mix-ups", tint: "bg-improving-tint" },
  endings: { visual: "jumped → jump", label: "Drops endings", skill: "Word endings", tint: "bg-[#E6F5EC]" },
  tricky: { visual: "said · was · the", label: "Gets stuck on “said”, “was”, “the”", skill: "Tricky words", tint: "bg-[#F6F1E7]" },
  unsure: { visual: "?", label: "Not sure yet", skill: "Tonight’s check will tell us", tint: "bg-unchecked" },
};

export const SIGNS = QUIZ_SIGNS.map((s) => ({
  ...s,
  view: SIGN_VIEW[s.id] ?? { visual: "?", label: s.label, skill: "", tint: "bg-unchecked" },
}));

export interface SpotCopy {
  name: string;
  explain: (name: string) => string;
  heard: string;
}

export const SPOT: Partial<Record<SkillId, SpotCopy>> = {
  magicE: {
    name: "Magic e",
    explain: () => "When a word ends in a quiet e, the vowel says its name: tape, bike, home.",
    heard: "“tap” for “tape”",
  },
  digraphs: {
    name: "Letter teams: sh, ch, th",
    explain: (n) => `Two letters, one sound. ${n} may read them one by one: “s-hip”.`,
    heard: "“ship” as “s-hip”",
  },
  endings: {
    name: "Word endings",
    explain: (n) => `${n} may read the main word and drop the end: “jump” for “jumped”.`,
    heard: "dropped endings",
  },
  bd: {
    name: "b and d mix-ups",
    explain: () => "b and d look alike, and lots of beginning readers flip them.",
    heard: "b and d mix-ups",
  },
  tricky: {
    name: "Tricky words",
    explain: () => "Words like said, was and the don’t follow the usual rules — they’re learned by sight.",
    heard: "stuck on said, was, the",
  },
  guessing: {
    name: "Guessing from the first letter",
    explain: (n) => `${n} may look at the first letter and guess the rest: “house” for “horse”.`,
    heard: "guessing from the first letter",
  },
  shortVowels: {
    name: "Short vowel sounds",
    explain: () => "In short words like bed, cat and sun, each vowel makes its short sound. Many early readers swap them.",
    heard: "",
  },
};

export function pickedSkills(signs: string[]): SkillId[] {
  const order: SkillId[] = ["magicE", "digraphs", "endings", "bd", "tricky", "guessing"];
  const set = new Set(QUIZ_SIGNS.flatMap((s) => (s.skill && signs.includes(s.id) ? [s.skill] : [])));
  return order.filter((s) => set.has(s));
}

export function possessive(name: string): string {
  const n = name.trim();
  return n ? `${n}’s` : "your child’s";
}

export function displayName(name: string): string {
  return name.trim() || "your child";
}

export function gradeLabel(g: Grade | null): string {
  return g ? GRADE_LABEL[g] : "";
}

export const EVENINGS = ["Easy", "Some frustration", "Tears or avoidance"] as const;
export const MINUTES = [5, 10, 15] as const;
export const GOALS = ["Read on their own", "Catch up with the class", "Less stress at bedtime"] as const;
