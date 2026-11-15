"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/kit";
import { Moon } from "@/components/journal/icons";

const PAIR_WORD =
  "word min-h-16 min-w-[96px] cursor-pointer rounded-2xl border-0 bg-paper px-3.5 pb-2 pt-1 font-read text-[clamp(32px,3.4vw,42px)] leading-[1.3] text-ink shadow-[inset_0_-4px_0_#ECE4D6] aria-pressed:bg-highlighter aria-pressed:shadow-[inset_0_-6px_0_#F2B915]";

export function PairsGrid({
  pairs,
  marked,
  onToggle,
}: {
  pairs: [string, string][];
  marked: ReadonlySet<string>;
  onToggle: (key: string) => void;
}) {
  return (
    <ul className="mt-5 grid grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))] gap-3.5">
      {pairs.map((pair, i) => (
        <li
          key={pair.join("-")}
          className="flex items-center justify-center gap-2.5 rounded-[22px] border-2 border-line bg-card px-3.5 py-[18px] shadow-edge"
        >
          {pair.map((w, j) => {
            const key = `${i}-${j}`;
            const on = marked.has(key);
            return (
              <span key={key} className="contents">
                {j === 1 && (
                  <span aria-hidden="true" className="text-sm font-black text-[#B3AC9E]">
                    ·
                  </span>
                )}
                <button
                  type="button"
                  aria-pressed={on}
                  aria-label={on ? `${w}, marked as missed` : w}
                  onClick={() => onToggle(key)}
                  className={PAIR_WORD}
                >
                  {w}
                </button>
              </span>
            );
          })}
        </li>
      ))}
    </ul>
  );
}

export function WordListGrid({
  words,
  marked,
  onToggle,
}: {
  words: string[];
  marked: ReadonlySet<number>;
  onToggle: (index: number) => void;
}) {
  return (
    <ul className="mt-5 grid grid-cols-[repeat(auto-fit,minmax(min(150px,44%),1fr))] gap-3">
      {words.map((w, i) => {
        const on = marked.has(i);
        return (
          <li key={`${w}-${i}`} className="flex">
            <button
              type="button"
              aria-pressed={on}
              aria-label={on ? `${w}, marked as missed` : w}
              onClick={() => onToggle(i)}
              className="word min-h-[92px] flex-auto cursor-pointer rounded-[20px] border-2 border-line bg-card px-3 pb-3 pt-1.5 font-read text-[clamp(36px,3.8vw,46px)] text-ink shadow-[0_4px_0_#ECE4D6] aria-pressed:border-[#E5A50F] aria-pressed:bg-highlighter aria-pressed:shadow-[0_4px_0_#E5A50F]"
            >
              {w}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function StoryLoading({ name, focus, word }: { name: string; focus: string; word: string }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 650);
    return () => clearInterval(t);
  }, []);
  const letters = word.slice(0, 6).split("");
  const steps = [
    `Using the ${focus} words ${name} is practicing`,
    `Adding only words ${name} can already read`,
    "Checking every word",
  ];
  const at = Math.min(tick, steps.length - 1);
  const tilt = ["-rotate-[8deg]", "", "rotate-[4deg]", "rotate-[9deg]", "-rotate-[4deg]", "rotate-[6deg]"];
  return (
    <main className="mx-auto w-full max-w-[640px] flex-[1_0_auto] overflow-x-clip px-6 pb-10 pt-12 text-center">
      <div aria-hidden="true" className="relative flex h-[110px] items-end justify-center gap-2">
        <span className="absolute left-[calc(50%+min(44vw,150px))] top-0 -translate-x-1/2">
          <span className="block animate-float">
            <Moon fill="#FFC93C" stroke="#E5A50F" size={34} />
          </span>
        </span>
        {letters.map((l, i) => {
          const last = i === letters.length - 1;
          const up = (tick + i) % 2 === 0;
          return (
            <span
              key={i}
              className={`inline-flex h-[60px] w-[54px] items-center justify-center rounded-[15px] border-2 font-read text-[30px] font-bold transition-transform duration-500 motion-reduce:transition-none ${tilt[i % tilt.length]} ${
                up ? "-translate-y-2 motion-reduce:translate-y-0" : ""
              } ${last ? "border-[#E8AE1C] bg-lamp shadow-[0_5px_0_#D99A0B]" : "border-edge bg-card shadow-[0_5px_0_#E4DBCB]"}`}
            >
              {l}
            </span>
          );
        })}
      </div>
      <h1 className="mt-[22px] text-[clamp(28px,3vw,40px)] font-black leading-[1.12] tracking-[-0.02em]">
        Writing tonight&apos;s story…
      </h1>
      <p className="mt-2.5 text-[17px] font-semibold leading-[1.55] text-ink-2">
        Every word is checked against what {name} can read. Usually a few seconds.
      </p>
      <ol aria-live="polite" className="mx-auto mt-6 flex max-w-[460px] flex-col gap-2.5 text-left">
        {steps.map((s, i) => {
          const done = at > i;
          const cur = at === i;
          return (
            <li
              key={s}
              className={`flex items-center gap-3 rounded-2xl border-2 border-line bg-card px-4 py-3.5 transition-opacity duration-500 ${
                done || cur ? "opacity-100" : "opacity-45"
              }`}
            >
              <span
                aria-hidden="true"
                className={`inline-flex h-7 w-7 flex-none items-center justify-center rounded-full text-white transition-colors duration-300 ${
                  done ? "bg-mastered" : cur ? "bg-indigo-line" : "bg-edge"
                }`}
              >
                <Icon name="check" size={16} strokeWidth={3} />
              </span>
              <span className="text-base font-extrabold">{s}</span>
              {done && <span className="sr-only">(done)</span>}
            </li>
          );
        })}
      </ol>
    </main>
  );
}
