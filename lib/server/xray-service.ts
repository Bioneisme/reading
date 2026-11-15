import "server-only";
import { plainPunctuation, type Xray } from "@/lib/engine";

export interface CoachWriter {
  write(prompt: string): Promise<string>;
}

const BANNED = /\b(dyslexi\w*|disorder|disabilit\w*|delay\w*|diagnos\w*|behind|lazy|adhd|deficit|struggl\w*)\b/i;

export function coachPrompt(x: Xray, script: string): string {
  return [
    "Write ONE short, warm sentence (max 28 words) for a parent of a 5-8 year old who is learning to read.",
    "Explain what happened in this misread, using only the facts below. Do not add new facts, rules, numbers or advice.",
    "Never mention diagnoses, delays, being behind, or disorders. No emojis, no dashes, no semicolons. Plain English.",
    `Word: ${x.word}`,
    `Child said: ${x.said ?? "(skipped)"}`,
    `Skill: ${x.skillName}`,
    ...x.facts.map((f) => `Fact: ${f}`),
    `The parent will then say: "${script}"`,
  ].join("\n");
}

export function acceptTip(tip: string, x: Xray): string | null {
  const t = plainPunctuation(tip.trim().replace(/^["“]|["”]$/g, ""));
  if (!t || t.length > 220 || BANNED.test(t)) return null;
  if (!t.toLowerCase().includes(x.word)) return null;
  if (/\d/.test(t)) return null;
  return t;
}

export async function coachTip(x: Xray, script: string, writer: CoachWriter | null): Promise<string | null> {
  if (!writer || x.facts.length === 0) return null;
  try {
    return acceptTip(await writer.write(coachPrompt(x, script)), x);
  } catch {
    return null;
  }
}
