import { tokenize } from "@/lib/engine";

export interface WordUnit {
  index: number;
  text: string;
  word: string;
  pre: string;
  post: string;
  breakBefore: boolean;
}

export function passageUnits(text: string): WordUnit[] {
  const units: WordUnit[] = [];
  let pending = "";
  let breakNext = false;
  for (const t of tokenize(text)) {
    if (t.word) {
      units.push({ index: units.length, text: t.text, word: t.word, pre: pending, post: "", breakBefore: breakNext });
      pending = "";
      breakNext = false;
      continue;
    }
    const m = /^(\S*)(\s*)([\s\S]*)$/.exec(t.text);
    if (!m) continue;
    const [, head, space, rest] = m;
    const last = units[units.length - 1];
    if (!space) {
      if (last) last.post += head;
      else pending += head;
      continue;
    }
    if (last) last.post += head;
    else pending += head;
    const restMatch = /^([\s\S]*?)(\S*)$/.exec(rest);
    const between = space + (restMatch ? restMatch[1] : rest);
    if (/\n\s*\n/.test(between) && units.length) breakNext = true;
    pending += restMatch ? restMatch[2] : "";
  }
  return units;
}

export function wordCount(text: string): number {
  return passageUnits(text).length;
}

export function sentenceRange(units: WordUnit[], index: number): [number, number] {
  let start = index;
  let end = index;
  while (start > 0 && !/[.!?]/.test(units[start - 1].post)) start--;
  while (end < units.length - 1 && !/[.!?]/.test(units[end].post)) end++;
  return [start, end];
}

export function sentenceAround(text: string, index: number): string {
  const units = passageUnits(text);
  if (!units[index]) return "";
  const [start, end] = sentenceRange(units, index);
  return units
    .slice(start, end + 1)
    .map((u) => u.pre + u.text + u.post)
    .join(" ");
}
