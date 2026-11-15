"use client";

import { useMemo } from "react";
import { detectPatterns, type Notice, type SessionRecord } from "@/lib/engine";
import { SECTION } from "./TonightCard";

const TONE: Record<Notice["kind"], { chip: string; label: string }> = {
  pattern: { chip: "bg-lamp-tint text-lamp-ink", label: "Pattern" },
  progress: { chip: "bg-mastered-tint text-mastered-ink", label: "Progress" },
  info: { chip: "bg-indigo-tint text-indigo", label: "Good to know" },
};

function Trend({ values }: { values: number[] }) {
  const max = Math.max(1, ...values);
  return (
    <div aria-hidden="true" className="flex h-9 items-end gap-1">
      {values.map((v, i) => (
        <span
          key={i}
          style={{ height: `${Math.max(12, (v / max) * 100)}%`, animationDelay: `${i * 60}ms` }}
          className={`w-2.5 animate-rise rounded-t-[4px] ${v === 0 ? "bg-mastered" : "bg-lamp"}`}
        />
      ))}
    </div>
  );
}

function Item({ n, name }: { n: Notice; name: string }) {
  const tone = TONE[n.kind];
  return (
    <li className="rounded-[20px] border-2 border-line bg-paper px-4 py-4">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-black uppercase tracking-[0.08em] ${tone.chip}`}>
            {tone.label}
          </span>
          <h3 className="mt-1.5 text-lg font-black leading-snug">{n.title.replace(/\bthem\b/, name)}</h3>
        </div>
        {n.trend && n.trend.length >= 3 && <Trend values={n.trend} />}
      </div>
      <ul className="mt-2.5 flex flex-wrap gap-1.5">
        {n.examples.map((e) => (
          <li key={e.word} className="rounded-full border-2 border-line bg-card px-2 py-0.5 font-read text-[15px] sm:px-2.5 sm:text-[17px]">
            {e.word}
            {e.said && <span className="text-[#2B2290]"> → “{e.said}”</span>}
          </li>
        ))}
      </ul>
      {n.swaps.length > 0 && (
        <p className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1 text-sm font-extrabold text-ink-2">
          {n.swaps.map((s) => (
            <span key={s} className="whitespace-nowrap">
              {s}
            </span>
          ))}
        </p>
      )}
      <p className="mt-2 text-[15px] font-semibold leading-normal text-ink-2">{n.detail}</p>
      <p className="mt-1.5 text-xs font-black uppercase tracking-[0.08em] text-ink-3">{n.evidence}</p>
    </li>
  );
}

export function NoticedCard({ sessions, name }: { sessions: SessionRecord[]; name: string }) {
  const notices = useMemo(() => detectPatterns(sessions), [sessions]);
  return (
    <section aria-labelledby="noticed-title" className={`${SECTION} p-6`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="noticed-title" className="text-[22px] font-black">
          What we noticed
        </h2>
        <span className="text-xs font-black uppercase tracking-[0.08em] text-ink-3">From the words you marked</span>
      </div>
      {notices.length === 0 ? (
        <p className="mt-2 text-[15px] font-semibold leading-normal text-ink-2">
          After two nights of reading, patterns in {name}&apos;s slips show up here, like the same sound read the same wrong way.
        </p>
      ) : (
        <ul className="mt-3.5 flex flex-col gap-3">
          {notices.map((n) => (
            <Item key={n.id} n={n} name={name} />
          ))}
        </ul>
      )}
    </section>
  );
}
