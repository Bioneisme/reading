"use client";

import { useMemo, useState } from "react";
import { classifyMiss, getDistractors, normalizeWord, tokenize, type Lexicon, type Miss } from "@/lib/engine";
import { StepFooter } from "./StepFooter";

export interface SaidItem {
  word: string;
  context?: string;
  preset?: string | null;
}

type Answer = { kind: "option"; said: string } | { kind: "other"; text: string } | { kind: "skip" };

function optionsFor(word: string, lex: Lexicon | undefined, preset: string | null | undefined): string[] {
  const target = normalizeWord(word);
  let list: string[] = [];
  try {
    list = getDistractors(word, lex, 4).map((d) => d.said);
  } catch {
    list = [];
  }
  const p = preset ? normalizeWord(preset) : "";
  if (p && p !== target) list = [p, ...list];
  const seen = new Set<string>([target]);
  const out = list.filter((s) => {
    const k = normalizeWord(s);
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  return out.slice(0, 3);
}

function initialAnswer(item: SaidItem, options: string[]): Answer | undefined {
  if (!item.preset) return undefined;
  const p = normalizeWord(item.preset);
  if (options.includes(p)) return { kind: "option", said: p };
  return { kind: "other", text: item.preset };
}

function toMiss(word: string, a: Answer, lex: Lexicon | undefined): Miss {
  const said = a.kind === "skip" ? null : a.kind === "option" ? a.said : a.text.trim().toLowerCase() || null;
  return { word: normalizeWord(word) || word, said, skill: classifyMiss(word, said, lex) };
}

function answered(a: Answer | undefined): boolean {
  if (!a) return false;
  if (a.kind === "other") return a.text.trim().length > 0;
  return true;
}

const choice =
  "option cursor-pointer rounded-[18px] border-2 border-edge bg-card text-ink shadow-[0_4px_0_#E4DBCB] aria-checked:animate-pop aria-checked:border-indigo aria-checked:bg-indigo-tint aria-checked:shadow-[0_4px_0_#4B3FE0]";

function Context({ context, word }: { context: string; word: string }) {
  const target = normalizeWord(word);
  let hit = false;
  return (
    <p className="mt-1 font-read text-[21px] leading-[1.8] md:text-[27px]">
      {tokenize(context).map((t, i) => {
        if (t.word && t.word === target && !hit) {
          hit = true;
          return (
            <mark key={i} className="rounded-lg bg-highlighter px-1 text-ink">
              {t.text}
            </mark>
          );
        }
        return <span key={i}>{t.text}</span>;
      })}
    </p>
  );
}

export function SaidPicker({
  items,
  childName,
  lex,
  onDone,
  onBack,
  demo = false,
  doneLabel = "See results",
}: {
  items: { word: string; context?: string; preset?: string | null }[];
  childName: string;
  lex?: Lexicon;
  onDone: (misses: Miss[]) => void;
  onBack?: () => void;
  demo?: boolean;
  doneLabel?: string;
}) {
  const options = useMemo(() => items.map((it) => optionsFor(it.word, lex, it.preset)), [items, lex]);
  const [answers, setAnswers] = useState<(Answer | undefined)[]>(() =>
    items.map((it, i) => initialAnswer(it, options[i] ?? [])),
  );
  const [idx, setIdx] = useState(0);
  const total = items.length;
  const pos = Math.min(idx, Math.max(0, total - 1));
  const item = items[pos];
  const opts = options[pos] ?? [];
  const cur = answers[pos];
  const isLast = pos >= total - 1;

  if (!item) return null;

  const set = (a: Answer) =>
    setAnswers((prev) => {
      const next = prev.slice();
      next[pos] = a;
      return next;
    });

  const finish = () => {
    onDone(items.map((it, i) => toMiss(it.word, answers[i] ?? { kind: "skip" }, lex)));
  };

  const go = () => {
    if (!answered(cur)) return;
    if (isLast) finish();
    else setIdx(pos + 1);
  };

  const back = pos > 0 ? { label: "Previous", onClick: () => setIdx(pos - 1) } : onBack ? { label: "Text", onClick: onBack } : null;
  const otherSel = cur?.kind === "other";

  return (
    <>
      <main className="mx-auto w-full max-w-[780px] flex-[1_0_auto] animate-fade px-6 pb-7 pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-[26px] font-black leading-[1.15] tracking-[-0.02em] md:text-[36px]">
            What did {childName} say?
          </h1>
          <div className="flex items-center gap-2.5">
            <span className="text-[15px] font-black text-ink-2">
              {pos + 1} of {total}
            </span>
            <span aria-hidden="true" className="flex gap-1.5">
              {items.map((_, k) => (
                <span key={k} className="h-2 w-[22px] overflow-hidden rounded-full bg-[#E6DFD2]">
                  <span
                    className={`block h-full rounded-full ${k < pos ? "bg-indigo" : "bg-lamp"}`}
                    style={{
                      width: k <= pos ? "100%" : "0%",
                      transition: "width 360ms var(--ease-out-soft), background-color 240ms ease-out",
                    }}
                  />
                </span>
              ))}
            </span>
          </div>
        </div>

        <div key={`card-${pos}`} className="mt-[18px] animate-rise rounded-card border-2 border-line bg-card px-[22px] py-5 shadow-edge">
          {item.context && (
            <>
              <div className="text-xs font-black uppercase tracking-[0.1em] text-ink-3">In the text</div>
              <Context context={item.context} word={item.word} />
            </>
          )}
          <div className={`flex flex-wrap items-center gap-x-[18px] gap-y-3.5 ${item.context ? "mt-4" : ""}`}>
            <span className="inline-flex rounded-[18px] bg-highlighter px-6 pb-2.5 pt-1 font-read text-[40px] font-bold leading-[1.25] shadow-[0_5px_0_#E5A50F] md:text-[58px]">
              {item.word}
            </span>
            <span className="flex-[1_1_220px] text-base font-bold leading-normal text-ink-2">
              {childName} was reading this word. Which one sounds closest to what {childName} said?
            </span>
          </div>
        </div>

        <div
          key={`opts-${pos}`}
          role="radiogroup"
          aria-label={`What ${childName} said`}
          className="mt-4 animate-rise motion-safe:[animation-delay:70ms]"
        >
          {opts.length > 0 && (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(150px,100%),1fr))] gap-3">
              {opts.map((o) => {
                const sel = cur?.kind === "option" && cur.said === o;
                return (
                  <button
                    key={o}
                    type="button"
                    role="radio"
                    aria-checked={sel}
                    onClick={() => set({ kind: "option", said: o })}
                    className={`${choice} min-h-[72px] px-3.5 py-2 font-read text-[30px]`}
                  >
                    “{o}”
                  </button>
                );
              })}
            </div>
          )}
          <div className="mt-3 grid grid-cols-[repeat(auto-fit,minmax(min(200px,100%),1fr))] gap-3">
            <button
              type="button"
              role="radio"
              aria-checked={otherSel}
              onClick={() => set({ kind: "other", text: cur?.kind === "other" ? cur.text : "" })}
              className={`${choice} min-h-[60px] px-4 py-2 text-[17px] font-extrabold`}
            >
              Something else…
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={cur?.kind === "skip"}
              onClick={() => set({ kind: "skip" })}
              className={`${choice} min-h-[60px] px-4 py-2 text-[17px] font-extrabold`}
            >
              Skipped it
            </button>
          </div>
        </div>

        {otherSel && (
          <label className="mt-4 block animate-rise text-base font-extrabold">
            Type what {childName} said
            <input
              type="text"
              autoFocus
              value={cur.text}
              onChange={(e) => set({ kind: "other", text: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter") go();
              }}
              placeholder="Type it the way it sounded"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className="mt-2 block min-h-[58px] w-full rounded-button border-2 border-line-strong bg-card px-4 font-read text-2xl text-ink"
            />
          </label>
        )}

        <p className="mt-4 text-sm font-bold text-ink-3">
          {demo
            ? `Example: ${childName}'s answers are already picked. Tap any to change it.`
            : "Not sure? Pick the closest one — it still helps."}
        </p>
      </main>

      <StepFooter
        back={back}
        hint={answered(cur) ? `Word ${pos + 1} of ${total}.` : `Word ${pos + 1} of ${total}. Pick one to go on.`}
        cta={{ label: isLast ? doneLabel : "Next word", onClick: go, disabled: !answered(cur) }}
      />
    </>
  );
}
