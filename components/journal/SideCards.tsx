"use client";

import { useState } from "react";
import type { SessionRecord } from "@/lib/engine";
import { formatDate } from "@/lib/client/progress";
import { missLabel, sessionTitle, sortSessions, SUMMARY_AFTER, weekdayShort, dayKey, type WeekSummary } from "./derive";
import { useInView } from "./motion";
import { numberWord } from "./skillCopy";
import { SECTION } from "./TonightCard";

function placeholder(sessions: number): { title: string; sub: string } {
  const left = Math.max(1, SUMMARY_AFTER - sessions);
  const more = left === 1 ? "one more session" : `${numberWord(left).toLowerCase()} more sessions`;
  return {
    title: sessions === 0 ? "Your first weekly summary comes after three sessions." : `Your first weekly summary comes after ${more}.`,
    sub:
      sessions === 0
        ? "Tonight’s reading check is the first. The summary shows which skill moved, and what comes next."
        : "The reading check counts as the first. The summary shows which skill moved, and what comes next.",
  };
}

export function WeekCard({ summary, sessions }: { summary: WeekSummary | null; sessions: number }) {
  const empty = placeholder(sessions);
  return (
    <section
      aria-labelledby="week-title"
      className="rounded-[28px] border-2 border-lamp-line bg-lamp-tint p-6 shadow-[0_4px_0_#F2CF6B]"
    >
      <div id="week-title" className="text-[13px] font-black uppercase tracking-[0.1em] text-lamp-ink">
        This week
      </div>
      {summary ? (
        <>
          <p className="mt-2 text-[21px] font-black leading-[1.35]">{summary.headline}</p>
          <p className="mt-1 text-sm font-extrabold leading-normal text-lamp-ink">{summary.overall}</p>
          {summary.next && <p className="mt-1.5 text-[17px] font-extrabold leading-[1.45] text-[#4A3500]">{summary.next}</p>}
          <ul className="mt-3.5 flex flex-wrap gap-2">
            {summary.chips.map((c) => (
              <li key={c} className="rounded-full bg-card px-3 py-[5px] text-[13px] font-extrabold">
                {c}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <p className="mt-2 text-[19px] font-black leading-[1.35]">{empty.title}</p>
          <p className="mt-1.5 text-[15px] font-bold leading-normal text-[#4A3500]">{empty.sub}</p>
        </>
      )}
    </section>
  );
}

export function MissesChart({ sessions }: { sessions: SessionRecord[] }) {
  const shown = sortSessions(sessions).slice(-10);
  const max = Math.max(1, ...shown.map((s) => s.misses.length));
  const single = shown.length === 1;
  const values = shown.map((s) => s.misses.length);
  const [ref, seen] = useInView<HTMLDivElement>();
  return (
    <section aria-labelledby="prog-title" className={`${SECTION} p-6`}>
      <h2 id="prog-title" className="text-[22px] font-black">
        Misses per night
      </h2>
      {shown.length === 0 ? (
        <p className="mt-3 text-sm font-bold leading-normal text-ink-3">Your first night shows up here.</p>
      ) : (
        <>
          <div
            ref={ref}
            role="img"
            aria-label={`Misses per night: ${values.join(", ")}`}
            className={`mt-[18px] flex h-[172px] items-end gap-3 border-b-2 border-line px-1 ${single ? "justify-center" : ""}`}
          >
            {shown.map((s, i) => (
              <div
                key={s.id}
                className={`flex h-full flex-col items-center justify-end gap-1.5 ${single ? "w-11" : "flex-1"}`}
              >
                <span
                  style={{ transitionDelay: `${i * 70 + 200}ms` }}
                  className={`text-[15px] font-black transition-opacity duration-300 ${seen ? "opacity-100" : "opacity-0"}`}
                >
                  {s.misses.length}
                </span>
                <span
                  className="block w-full max-w-11 rounded-[10px_10px_4px_4px] bg-lamp shadow-[inset_0_-4px_0_#E5A50F] transition-[height] duration-700 ease-(--ease-out-soft)"
                  style={{
                    height: seen ? `${Math.max(6, (s.misses.length / max) * 120)}px` : "6px",
                    transitionDelay: `${i * 70}ms`,
                  }}
                />
              </div>
            ))}
          </div>
          <div aria-hidden="true" className={`mt-2 flex gap-3 px-1 ${single ? "justify-center" : ""}`}>
            {shown.map((s) => (
              <span
                key={s.id}
                className={`text-center text-xs font-extrabold text-ink-3 ${single ? "w-16" : "flex-1"}`}
              >
                {single ? `Night ${s.day}` : weekdayShort(s.date)}
              </span>
            ))}
          </div>
        </>
      )}
      {shown.length > 0 && (
        <p className="mt-3.5 text-sm font-bold leading-normal text-ink-2">
          {shown.length > 1
            ? "Fewer misses on the same skill means it is sticking."
            : "Come back tomorrow — night 2 starts the trend line."}
        </p>
      )}
    </section>
  );
}

const LIMIT = 6;

export function HistoryCard({ sessions, demo }: { sessions: SessionRecord[]; demo: boolean }) {
  const [all, setAll] = useState(false);
  const list = sortSessions(sessions).reverse();
  const shown = all ? list : list.slice(0, LIMIT);
  const today = dayKey(new Date());
  return (
    <section aria-labelledby="hist-title" className={`${SECTION} p-6`}>
      <h2 id="hist-title" className="text-[22px] font-black">
        History
      </h2>
      {list.length === 0 ? (
        <p className="mt-3 text-sm font-bold leading-normal text-ink-3">Each night you do the 10 minutes, it shows up here.</p>
      ) : (
        <ol className="mt-3 flex flex-col">
          {shown.map((s, i) => (
            <li
              key={s.id}
              style={i >= LIMIT ? { animationDelay: `${(i - LIMIT) * 40}ms` } : undefined}
              className={`flex items-center gap-3 border-b-2 border-sand py-3 ${i >= LIMIT ? "animate-rise" : ""}`}
            >
              <span className="min-w-0 flex-auto">
                <span className="block text-[15px] font-black">{sessionTitle(sessions, s)}</span>
                <span className="block text-[13px] font-bold text-ink-3">
                  {!demo && dayKey(s.date) === today ? "Tonight · " : ""}
                  {formatDate(s.date)}
                </span>
              </span>
              <span className="flex-none rounded-full bg-lamp-tint px-2.5 py-1 text-[13px] font-black text-lamp-ink">
                {missLabel(s.misses.length)}
              </span>
            </li>
          ))}
        </ol>
      )}
      {list.length === 1 && (
        <p className="mt-3 text-sm font-bold leading-normal text-ink-3">Each night you do the 10 minutes, it shows up here.</p>
      )}
      {list.length > LIMIT && (
        <button
          type="button"
          onClick={() => setAll((v) => !v)}
          className="text-link inline-flex min-h-11 cursor-pointer items-center gap-1.5 font-extrabold text-indigo mt-2 text-[15px]"
        >
          {all ? "Show fewer nights" : `Show all ${list.length} nights`}
        </button>
      )}
    </section>
  );
}
