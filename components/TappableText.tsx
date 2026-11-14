"use client";

import type { ReactNode } from "react";

export interface TextToken {
  text: string;
  word: string | null;
}

const wordBase =
  "word-btn inline-block cursor-pointer rounded-xl border-2 px-1 -mx-1 align-baseline transition-colors select-none";
const wordOff = "border-transparent hover:bg-brand-soft";
const wordOn =
  "border-mark-line bg-mark underline decoration-mark-line decoration-[3px] underline-offset-[10px]";

function group(tokens: TextToken[]): ({ space: string } | { items: number[] })[] {
  const out: ({ space: string } | { items: number[] })[] = [];
  let cur: number[] = [];
  tokens.forEach((t, i) => {
    if (t.word === null && /^\s+$/.test(t.text)) {
      if (cur.length) out.push({ items: cur });
      cur = [];
      out.push({ space: t.text.includes("\n\n") ? "\n\n" : t.text.includes("\n") ? "\n" : " " });
    } else {
      cur.push(i);
    }
  });
  if (cur.length) out.push({ items: cur });
  return out;
}

export function TappableText({
  tokens,
  marked,
  onToggle,
  className = "",
}: {
  tokens: TextToken[];
  marked: ReadonlySet<number>;
  onToggle?: (index: number) => void;
  className?: string;
}) {
  return (
    <div className={`reading-text whitespace-pre-line text-ink ${className}`}>
      {group(tokens).map((g, gi) =>
        "space" in g ? (
          <span key={gi}>{g.space}</span>
        ) : (
          <span key={gi} className="whitespace-nowrap">
            {g.items.map((i) => {
              const t = tokens[i];
              if (!t.word || !onToggle) return <span key={i}>{t.text}</span>;
              const on = marked.has(i);
              return (
                <button
                  key={i}
                  type="button"
                  aria-pressed={on}
                  aria-label={on ? `${t.text}, marked as missed` : t.text}
                  onClick={() => onToggle(i)}
                  className={`${wordBase} ${on ? wordOn : wordOff}`}
                >
                  {t.text}
                </button>
              );
            })}
          </span>
        ),
      )}
    </div>
  );
}

export function WordTile({
  word,
  marked,
  onToggle,
  children,
}: {
  word: string;
  marked: boolean;
  onToggle: () => void;
  children?: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={marked}
      aria-label={marked ? `${word}, marked as missed` : word}
      onClick={onToggle}
      className={`reading-text min-h-20 min-w-[7rem] rounded-2xl border-2 px-5 py-2 transition-colors ${
        marked
          ? "border-mark-line bg-mark underline decoration-mark-line decoration-[3px] underline-offset-[10px]"
          : "border-line bg-surface hover:border-brand/50"
      }`}
    >
      {word}
      {children}
    </button>
  );
}

export function MarkedCount({ n }: { n: number }) {
  return (
    <p aria-live="polite" className="text-base font-semibold text-ink">
      <span className="mr-1 inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-mark px-2 tabular-nums ring-2 ring-mark-line">
        {n}
      </span>{" "}
      {n === 1 ? "word marked" : "words marked"}
    </p>
  );
}
