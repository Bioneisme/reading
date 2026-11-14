import type { SkillId } from "./skills";

export type Grade = "K" | "1" | "2" | "3";

export interface Segment {
  g: string;
  ph: string[];
  label: SegLabel;
  stress?: number;
  role?: SkillId;
  blend?: "initial" | "final";
}

export type SegLabel =
  | "C"
  | "DG"
  | "V"
  | "VT"
  | "RC"
  | "E0"
  | "X";

export interface WordAnalysis {
  word: string;
  base: string;
  suffix: "" | "s" | "es" | "ed" | "ing";
  suffixPh: string[];
  pron: string[];
  segments: Segment[] | null;
  skills: SkillId[];
  decodable: boolean;
  tricky: boolean;
  practices: SkillId[];
}

export interface Distractor {
  said: string;
  skill: SkillId | "other";
}

export interface Miss {
  word: string;
  said: string | null;
  skill: SkillId | "other";
}

export interface SessionRecord {
  id: string;
  date: string;
  day: number;
  kind: "check" | "nightly";
  focus?: SkillId;
  words: string[];
  misses: Miss[];
}

export type SkillStatus = "notChecked" | "needsWork" | "improving" | "mastered";

export interface SkillState {
  skill: SkillId;
  attempts: number;
  errors: number;
  rawAttempts: number;
  rate: number;
  status: SkillStatus;
  history: number[];
  progress: number;
}

export interface Profile {
  skills: Record<SkillId, SkillState>;
  focus: SkillId;
  nextUp: SkillId | null;
  round: number;
  missesPerNight: number[];
}

export interface CheckSummary {
  totalWords: number;
  totalMisses: number;
  bySkill: { skill: SkillId | "other"; count: number; misses: Miss[] }[];
  weakSpot: SkillId | null;
}

export interface Story {
  id: string;
  title: string;
  focus: SkillId;
  text: string;
}

export interface Plan {
  focus: SkillId;
  round: number;
  pairs: [string, string][];
  wordList: string[];
  story: { id: string; title: string };
  scripts: [string, string, string];
}

export interface StoryToken {
  text: string;
  word: string | null;
  practices: SkillId[];
  tricky: boolean;
}

export interface Passage {
  id: string;
  grade: Grade;
  title: string;
  text: string;
}
