"use client";

import { Fragment, useMemo } from "react";
import { passageUnits } from "./words";

const SIZE = {
  lg: "text-[28px] md:text-[44px]",
  md: "text-[24px] md:text-[34px]",
} as const;

export function TappablePassage({
  text,
  marked,
  onToggle,
  size = "lg",
  className = "",
}: {
  text: string;
  marked: ReadonlySet<number>;
  onToggle: (wordIndex: number) => void;
  size?: "lg" | "md";
  className?: string;
}) {
  const units = useMemo(() => passageUnits(text), [text]);
  return (
    <div
      className={`flex flex-wrap gap-x-[0.14em] gap-y-[0.34em] font-read leading-[1.5] text-ink ${SIZE[size]} ${className}`}
    >
      {units.map((u) => {
        const on = marked.has(u.index);
        return (
          <Fragment key={u.index}>
            {u.breakBefore && <span aria-hidden="true" className="h-0 basis-full" />}
            <span className="inline-flex items-baseline">
              {u.pre && <span aria-hidden="true">{u.pre}</span>}
              <button
                type="button"
                aria-pressed={on}
                aria-label={on ? `${u.text}, marked as missed` : u.text}
                onClick={() => onToggle(u.index)}
                className={`word m-0 min-h-12 cursor-pointer rounded-[0.24em] border-0 px-[0.16em] pb-[0.1em] pt-[0.02em] [font:inherit] text-ink ${
                  on ? "bg-highlighter shadow-[inset_0_-0.14em_0_#F2B915]" : "bg-transparent"
                }`}
              >
                {u.text}
              </button>
              {u.post && <span aria-hidden="true">{u.post}</span>}
            </span>
          </Fragment>
        );
      })}
    </div>
  );
}
