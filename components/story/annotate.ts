import { annotateText, SKILL_ORDER, wordsOf, type SkillId, type StoryToken } from "@/lib/engine";
import { SKILL_SHORT, SKILL_TAG } from "@/components/journal/skillCopy";

export type Shape = "square" | "triangle" | "dot";

export interface WordMark {
  skill: SkillId | null;
  shape: Shape;
  tag: string;
  line: string;
  ink: string;
  thick: boolean;
}

export const SHAPE_GLYPH: Record<Shape, string> = { square: "■", triangle: "▲", dot: "●" };

export function storyTokens(text: string, server: StoryToken[] | null): StoryToken[] {
  if (server && server.filter((t) => t.word).length === wordsOf(text).length) return server;
  return annotateText(text);
}

export function markFor(token: StoryToken, focus: SkillId): WordMark {
  if (token.practices.includes(focus) && focus !== "tricky") {
    return { skill: focus, shape: "square", tag: SKILL_TAG[focus], line: "#4B3FE0", ink: "#2B2290", thick: true };
  }
  if (token.tricky || token.practices.includes("tricky")) {
    return { skill: "tricky", shape: "triangle", tag: SKILL_TAG.tricky, line: "#F08A3C", ink: "#A4480C", thick: true };
  }
  const skill = [...SKILL_ORDER].reverse().find((s) => token.practices.includes(s)) ?? null;
  return { skill, shape: "dot", tag: skill ? SKILL_TAG[skill] : "Word", line: "#CFC6B6", ink: "#6A6787", thick: false };
}

export interface LegendItem {
  key: string;
  shape: Shape;
  label: string;
  count: number;
  ink: string;
}

export function legendFor(tokens: StoryToken[], focus: SkillId): LegendItem[] {
  const counts = new Map<string, { mark: WordMark; count: number }>();
  for (const t of tokens) {
    if (!t.word) continue;
    const mark = markFor(t, focus);
    const key = mark.skill ?? "word";
    const cur = counts.get(key);
    if (cur) cur.count++;
    else counts.set(key, { mark, count: 1 });
  }
  const rank = (key: string) => {
    const m = counts.get(key)!.mark;
    if (m.shape === "square") return -1;
    if (m.shape === "triangle") return 100;
    return key === "word" ? 99 : SKILL_ORDER.indexOf(key as SkillId);
  };
  return [...counts.keys()]
    .sort((a, b) => rank(a) - rank(b))
    .map((key) => {
      const { mark, count } = counts.get(key)!;
      return {
        key,
        shape: mark.shape,
        label: mark.skill ? SKILL_SHORT[mark.skill] : "Other words",
        count,
        ink: mark.shape === "dot" ? "#4D4A6B" : mark.ink,
      };
    });
}
