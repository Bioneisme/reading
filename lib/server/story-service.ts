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
  const names = STORY_NAMES.filter((n) => analyzeWord(n, lex)?.decodable);
  const allowed = [...new Set([...focusWords, ...otherWords, ...DOLCH.filter((w) => !w.includes("'"))])].sort();
  return [
    `Write a short practice story for a beginning reader (age 5–8) who is working on: ${skill.name} (${skill.example}).`,
    `The child reads it aloud to a parent. Warm and simple, a tiny plot with a happy ending.`,
    ``,
    `The child can only read the words in ALLOWED WORDS. Any other word breaks the exercise.`,
    ``,
    `Rules:`,
    `- 60 to 100 words. Short sentences of 3–9 words.`,
    `- Every word of the title and the story must appear in ALLOWED WORDS, spelled exactly as listed.`,
    `- Do not add endings (-s, -es, -ed, -ing) unless that exact form is listed. No contractions, no possessive 's.`,
    `- Use at least 8 different FOCUS words; repeat them.`,
    `- Character names: only ${names.join(", ")}.`,
    `- Before answering, re-read the story word by word and replace any word that is not in ALLOWED WORDS.`,
    ``,
    `FOCUS words: ${focusWords.join(" ")}`,
    ``,
    `ALLOWED WORDS: ${allowed.join(" ")}`,
    rejected.length
      ? `\nYour previous draft used words the child cannot read yet: ${rejected.join(", ")}. Write a new story without them.`
      : "",
  ].join("\n");
}

export async function generateStory(
  req: StoryRequest,
  deps: { writer: StoryWriter | null; lex: Lexicon; deadlineMs?: number },
): Promise<StoryResult> {
  const rejected: string[] = [];
  const started = Date.now();
  let attempts = 0;
  if (deps.writer) {
    while (attempts < MAX_ATTEMPTS && Date.now() - started < (deps.deadlineMs ?? 40_000)) {
      attempts++;
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
