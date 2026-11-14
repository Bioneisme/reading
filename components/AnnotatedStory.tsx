"use client";

import { useMemo } from "react";
import { annotateText, type SkillId } from "@/lib/engine";

export const SKILL_TAG: Record<SkillId, string> = {
  shortVowels: "short vowel",
  magicE: "magic e",
  digraphs: "letter team",
  initialBlends: "start blend",
  finalBlends: "end blend",
  endings: "ending",
  vowelTeams: "vowel team",
  rControlled: "bossy r",
  bd: "b / d",
  tricky: "tricky word",
  guessing: "whole word",
};

export function AnnotatedStory({ text, annotate, focus }: { text: string; annotate: boolean; focus?: SkillId }) {
  const tokens = useMemo(() => {
    try {
      return annotateText(text);
    } catch {
      return [{ text, word: null, practices: [] as SkillId[], tricky: false }];
    }
  }, [text]);

  if (!annotate) {
    return <div className="reading-text whitespace-pre-line">{text}</div>;
  }

  return (
    <div className="reading-text whitespace-pre-line">
      {tokens.map((t, i) => {
        if (!t.word) return <span key={i}>{t.text}</span>;
        const tags = t.tricky ? ["tricky word"] : t.practices.map((p) => SKILL_TAG[p]);
        const isFocus = Boolean(focus && t.practices.includes(focus));
        return (
          <span key={i} className="inline-flex flex-col items-center align-top leading-tight">
            <span className={isFocus ? "rounded-md bg-brand-soft px-1 font-bold" : "px-1"}>{t.text}</span>
            <span className="mb-2 max-w-[8rem] font-sans text-[11px] leading-tight font-semibold tracking-wide text-ink-soft uppercase">
              {isFocus && <span aria-hidden>★ </span>}
              {tags.length ? tags.slice(0, 2).join(" · ") : "—"}
            </span>
          </span>
        );
      })}
    </div>
  );
}
