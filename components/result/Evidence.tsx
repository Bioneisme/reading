"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/kit";
import type { Lexicon } from "@/lib/engine";
import { missLine, optionsFor, type MissGroup, type MissRow } from "./model";
import { PANEL } from "./PlanCards";

const SKIP = "__skip";

function optionId(index: number, value: string) {
  return `said-${index}-${value.replace(/[^a-z0-9_]/gi, "")}`;
}

function Row({
  row,
  name,
  options,
  onPick,
}: {
  row: MissRow;
  name: string;
  options: string[];
  onPick: (index: number, said: string | null) => void;
}) {
  const current = row.said ?? SKIP;
  const values = [...options, SKIP];
  return (
    <li className="rounded-[18px] border-2 border-line bg-paper px-3.5 py-3">
      <div className="flex flex-wrap items-center gap-2.5 font-read text-2xl">
        <span>{row.word}</span>
        <Icon name="next" size={18} strokeWidth={2.4} className="text-ink-3" />
        <span className="text-[#2B2290]">{row.said === null ? "(skipped)" : `“${row.said}”`}</span>
      </div>
      <div role="radiogroup" aria-label={`What ${name} said for ${row.word}`} className="mt-2 flex flex-wrap items-center gap-1.5">
        <span className="mr-0.5 text-xs font-black text-ink-3">{name} said:</span>
        {values.map((v) => {
          const skip = v === SKIP;
          return (
            <button
              key={v}
              id={optionId(row.index, v)}
              type="button"
              role="radio"
              aria-checked={current === v}
              onClick={() => current !== v && onPick(row.index, skip ? null : v)}
              className={`option min-h-11 cursor-pointer rounded-full border-2 border-edge bg-card px-3.5 py-0.5 text-ink aria-checked:border-indigo aria-checked:bg-indigo-tint ${
                skip ? "font-sans text-sm font-extrabold" : "font-read text-[19px]"
              }`}
            >
              {skip ? "Skipped" : v}
            </button>
          );
        })}
      </div>
    </li>
  );
}

export function Evidence({
  name,
  demo,
  groups,
  initialSaid,
  lex,
  onPick,
}: {
  name: string;
  demo: boolean;
  groups: MissGroup[];
  initialSaid: (string | null)[];
  lex: Lexicon | undefined;
  onPick: (index: number, said: string | null) => void;
}) {
  const [first] = useState(initialSaid);
  const pending = useRef<string | null>(null);

  useEffect(() => {
    if (!pending.current) return;
    document.getElementById(pending.current)?.focus({ preventScroll: true });
    pending.current = null;
  }, [groups]);

  const pick = (index: number, said: string | null) => {
    pending.current = optionId(index, said ?? SKIP);
    onPick(index, said);
  };

  const empty = groups.length === 0;

  return (
    <section aria-labelledby="ev-title" className={PANEL}>
      <h2 id="ev-title" className="text-2xl font-black tracking-[-0.01em]">
        How we worked it out
      </h2>
      <p className="mt-1.5 text-base font-semibold leading-normal text-ink-2">
        {empty
          ? `No misses to show. When ${name} reads a word differently, it shows up here with the skill it points to.`
          : demo
            ? `Each miss points to a skill. Example: change what ${name} said and watch the result update.`
            : "Each miss points to a skill. Picked the wrong one? Change it here."}
      </p>
      {groups.map((g) => (
        <div key={g.skill} className="mt-5">
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="text-[17px] font-black">{g.name}</h3>
            <span className="rounded-full bg-lamp-tint px-2.5 py-[3px] text-[13px] font-black text-lamp-ink">{missLine(g.count)}</span>
          </div>
          <ul className="mt-2.5 flex flex-col gap-2.5">
            {g.rows.map((r) => (
              <Row
                key={r.index}
                row={r}
                name={name}
                options={optionsFor(r.word, first[r.index] ?? null, lex)}
                onPick={pick}
              />
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
