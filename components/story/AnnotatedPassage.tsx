"use client";

import { Fragment, useMemo } from "react";
import type { SkillId, StoryToken } from "@/lib/engine";
import { passageUnits } from "@/components/reading/words";
import { markFor, SHAPE_GLYPH } from "./annotate";

const SIZE = {
  reader: "text-[clamp(28px,3.6vw,44px)] leading-[1.6] gap-x-[0.28em]",
  session: "text-[clamp(26px,3.2vw,40px)] leading-normal gap-x-[0.16em]",
} as const;

export function AnnotatedPassage({
  text,
  tokens,
  focus,
  labels,
  size = "reader",
  marked,
  onToggle,
}: {
  text: string;
  tokens: StoryToken[];
  focus: SkillId;
  labels: boolean;
  size?: keyof typeof SIZE;
  marked?: ReadonlySet<number>;
  onToggle?: (wordIndex: number) => void;
}) {
  const units = useMemo(() => passageUnits(text), [text]);
  const words = useMemo(() => tokens.filter((t) => t.word), [tokens]);

  return (
    <div
      className={`flex flex-wrap font-read text-ink ${SIZE[size]} ${labels ? "gap-y-[0.6em]" : "gap-y-[0.2em]"}`}
    >
      {units.map((u) => {
        const token = words[u.index];
        const mark = token ? markFor(token, focus) : null;
        const on = marked?.has(u.index) ?? false;
        const underline =
          labels && mark ? { boxShadow: `inset 0 ${mark.thick ? -4 : -3}px 0 ${mark.line}` } : undefined;
        const label = labels && mark ? `${u.text}, ${mark.tag}` : u.text;
        return (
          <Fragment key={u.index}>
            {u.breakBefore && <span aria-hidden="true" className="h-0 basis-full" />}
            <span className="inline-flex flex-col items-center">
              <span className="inline-flex items-baseline px-[0.04em]" style={underline}>
                {u.pre && <span aria-hidden="true">{u.pre}</span>}
                {onToggle ? (
                  <button
                    type="button"
                    aria-pressed={on}
                    aria-label={on ? `${label}, marked as missed` : label}
                    onClick={() => onToggle(u.index)}
                    className={`word m-0 min-h-12 cursor-pointer rounded-[0.2em] border-0 px-[0.12em] pb-[0.04em] [font:inherit] text-ink ${
                      on ? "bg-highlighter shadow-[inset_0_-6px_0_#F2B915]" : "bg-transparent"
                    }`}
                  >
                    {u.text}
                  </button>
                ) : (
                  <span>{u.text}</span>
                )}
                {u.post && <span aria-hidden="true">{u.post}</span>}
              </span>
              {labels && mark && (
                <span
                  aria-hidden="true"
                  className="mt-1 whitespace-nowrap font-sans text-[10px] font-black uppercase leading-none tracking-[0.06em]"
                  style={{ color: mark.ink }}
                >
                  {SHAPE_GLYPH[mark.shape]} {mark.tag}
                </span>
              )}
            </span>
          </Fragment>
        );
      })}
    </div>
  );
}

export function PracticeToggle({ on, onChange }: { on: boolean; onChange: (next: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className="option inline-flex min-h-12 cursor-pointer items-center gap-2.5 rounded-[14px] border-2 border-line-strong bg-card py-0 pl-2 pr-3.5 text-[15px] font-extrabold text-ink"
    >
      <span
        aria-hidden="true"
        className={`relative h-[26px] w-11 flex-none rounded-full transition-colors ${on ? "bg-indigo" : "bg-unchecked-line"}`}
      >
        <span
          className={`absolute top-[3px] h-5 w-5 rounded-full bg-white transition-[left] ${on ? "left-[21px]" : "left-[3px]"}`}
        />
      </span>
      Show what each word practices
    </button>
  );
}
