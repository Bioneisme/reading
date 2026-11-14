import type { SkillId, SkillStatus } from "@/lib/engine";

export const SKILL_SHORT: Record<SkillId, string> = {
  shortVowels: "Short vowels",
  magicE: "Magic e",
  digraphs: "Letter teams",
  initialBlends: "Blends at the start",
  finalBlends: "Blends at the end",
  endings: "Word endings",
  vowelTeams: "Vowel teams",
  rControlled: "Bossy r",
  bd: "b and d",
  tricky: "Tricky words",
  guessing: "Guessing from the first letter",
};

export const SKILL_WITH_EXAMPLES: Record<SkillId, string> = {
  shortVowels: "Short vowels",
  magicE: "Magic e",
  digraphs: "Letter teams (sh, ch, th)",
  initialBlends: "Blends at the start (st, bl, tr)",
  finalBlends: "Blends at the end (-st, -nd, -mp)",
  endings: "Word endings (-s, -ed, -ing)",
  vowelTeams: "Vowel teams (ai, ee, oa)",
  rControlled: "Bossy r (ar, or, er)",
  bd: "b and d mix-ups",
  tricky: "Tricky words (said, was, are)",
  guessing: "Guessing from the first letter",
};

export const SKILL_MAP_EXAMPLE: Record<SkillId, string> = {
  shortVowels: "bed vs bad",
  magicE: "tap → tape",
  digraphs: "ship · chin · that",
  initialBlends: "stop · black · trip",
  finalBlends: "fast · hand · jump",
  endings: "jumps · jumped · jumping",
  vowelTeams: "rain · feet · boat · night",
  rControlled: "car · fork · bird · fur",
  bd: "bad vs dab",
  tricky: "said · was · are",
  guessing: "horse vs house",
};

export const SKILL_TAG: Record<SkillId, string> = {
  shortVowels: "Short",
  magicE: "Magic e",
  digraphs: "Letter team",
  initialBlends: "Start blend",
  finalBlends: "End blend",
  endings: "Ending",
  vowelTeams: "Vowel team",
  rControlled: "Bossy r",
  bd: "b / d",
  tricky: "Tricky",
  guessing: "Whole word",
};

export const STATUS_LABEL: Record<SkillStatus, string> = {
  mastered: "Mastered",
  improving: "Improving",
  needsWork: "Needs work",
  notChecked: "Not checked yet",
};

const NUMBER_WORDS = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"];

export function numberWord(n: number): string {
  return NUMBER_WORDS[n] ?? String(n);
}
