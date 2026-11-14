import "server-only";
import { DOLCH, STORY_NAMES, WORDBANK } from "@/data/wordbank";
import {
  SKILLS, analyzeWord, annotateText, storyForSkill, validateStory,
  type SkillId, type Story, type StoryToken,
} from "@/lib/engine";
import type { Lexicon } from "@/lib/engine/lexicon";

export interface StoryRequest {
  focus: SkillId;
  allowed: SkillId[];
  childName: string;
}

export interface StoryDraft {
  title: string;
  text: string;
}

export interface StoryWriter {
  write(prompt: string): Promise<StoryDraft>;
}

export interface StoryResult {
  story: Story;
  source: "llm" | "library";
  tokens: StoryToken[];
  attempts: number;
  rejected: string[];
}

export const MAX_ATTEMPTS = 3;

export function vocabularyFor(req: StoryRequest, lex: Lexicon): { focusWords: string[]; otherWords: string[] } {
  const allow = new Set<SkillId>([...req.allowed, req.focus]);
  const ok = WORDBANK.filter((w) => {
    const A = analyzeWord(w, lex);
    return !!A && A.decodable && A.skills.every((s) => allow.has(s));
  });
  const focusWords = ok.filter((w) => analyzeWord(w, lex)?.practices.includes(req.focus));
  return { focusWords, otherWords: ok.filter((w) => !focusWords.includes(w)) };
}

export function buildPrompt(req: StoryRequest, lex: Lexicon, rejected: string[] = []): string {
  const { focusWords, otherWords } = vocabularyFor(req, lex);
  const skill = SKILLS[req.focus];
  return [
    `Write a short practice story for a beginning reader (age 5–8) who is working on: ${skill.name} (${skill.example}).`,
    `The story is read aloud by the child to a parent. Warm, simple, a tiny plot with a happy ending.`,
    ``,
    `Hard rules:`,
    `- 60 to 100 words. Short sentences (3–9 words).`,
    `- Use ONLY words from the lists below (any capitalization). No other words, no contractions, no possessives with 's.`,
    `- Use at least 8 different words from the FOCUS list.`,
    `- Characters may only be named: ${STORY_NAMES.join(", ")}.`,
    `- Title: 2–5 words, from the same lists.`,
    ``,
    `FOCUS words: ${focusWords.join(" ")}`,
    `Other decodable words: ${otherWords.join(" ")}`,
    `Sight words: ${DOLCH.filter((w) => !w.includes("'")).join(" ")}`,
    rejected.length ? `\nYour previous draft used words that are NOT allowed: ${rejected.join(", ")}. Do not use them.` : "",
  ].join("\n");
}

export async function generateStory(req: StoryRequest, deps: { writer: StoryWriter | null; lex: Lexicon }): Promise<StoryResult> {
  const rejected: string[] = [];
  let attempts = 0;
  if (deps.writer) {
    for (attempts = 1; attempts <= MAX_ATTEMPTS; attempts++) {
      try {
        const draft = await deps.writer.write(buildPrompt(req, deps.lex, rejected));
        const all = `${draft.title}. ${draft.text}`;
        const v = validateStory(all, [...req.allowed, req.focus], { names: STORY_NAMES, lex: deps.lex });
        const words = draft.text.split(/\s+/).filter(Boolean).length;
        if (v.ok && words >= 50 && words <= 110) {
          const story: Story = { id: `gen-${req.focus}-${Date.now().toString(36)}`, title: draft.title, focus: req.focus, text: draft.text };
          return { story, source: "llm", tokens: annotateText(draft.text, deps.lex), attempts, rejected };
        }
        rejected.push(...v.bad.filter((w) => !rejected.includes(w)));
      } catch (err) {
        console.error("[story] writer failed", err instanceof Error ? err.message : err);
        break;
      }
    }
  }
  const story = storyForSkill(req.focus);
  return { story, source: "library", tokens: annotateText(story.text, deps.lex), attempts, rejected };
}
