"use client";

import Link from "next/link";
import { useState } from "react";
import type { Plan } from "@/lib/engine";
import { buttonClass, Icon } from "@/components/kit";
import { downloadReminderIcs } from "@/lib/client/ics";
import { prettyTime } from "./derive";
import { SKILL_SHORT } from "./skillCopy";
import { SECTION } from "./TonightCard";

function LockGlyph({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3" />
    </svg>
  );
}

export function FreePlanCard({ plan, name, reminderTime }: { plan: Plan; name: string; reminderTime: string }) {
  const [added, setAdded] = useState(false);
  const pairs = plan.pairs.slice(0, 2).map((p) => p.join(" / ")).join(" · ");
  const words = plan.wordList.slice(0, 3).join(" · ");
  const rows = [
    { min: "2 min", label: "Word pairs", words: pairs },
    { min: "3 min", label: "Word list", words },
  ];
  return (
    <section aria-labelledby="free-title" className={`${SECTION} p-[22px] sm:p-[26px]`}>
      <div className="text-[13px] font-black uppercase tracking-[0.1em] text-indigo">Next step</div>
      <h2 id="free-title" className="mt-1.5 text-[clamp(26px,2.6vw,34px)] font-black leading-[1.1] tracking-[-0.02em] text-balance">
        Tomorrow at {prettyTime(reminderTime)}, 10 minutes
      </h2>
      <p className="mt-2 text-base font-semibold leading-normal text-ink-2">
        {name} practices {SKILL_SHORT[plan.focus]}, the skill from tonight&apos;s check. Here&apos;s what it looks like:
      </p>
      <ol className="mt-4 flex flex-col gap-2.5">
        {rows.map((r) => (
          <li key={r.label} className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 rounded-2xl bg-paper px-3.5 py-3">
            <span className="w-[62px] flex-none rounded-[10px] bg-indigo py-1.5 text-center text-sm font-black text-white">
              {r.min}
            </span>
            <span className="font-extrabold">{r.label}</span>
            <span className="ml-auto whitespace-nowrap text-right font-read text-[19px] text-ink-2">{r.words}</span>
          </li>
        ))}
        <li className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 rounded-2xl bg-paper px-3.5 py-3">
          <span className="w-[62px] flex-none rounded-[10px] bg-indigo py-1.5 text-center text-sm font-black text-white">5 min</span>
          <span className="font-extrabold">A story written for {name}</span>
        </li>
      </ol>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link href="/plans" className={buttonClass("primary", "lg", false, "flex-[1_1_240px] whitespace-nowrap max-[400px]:px-4 max-[400px]:text-[15px]")}>
          <LockGlyph size={18} />
          Unlock tomorrow&apos;s session
        </Link>
        <button
          type="button"
          onClick={() => {
            downloadReminderIcs(reminderTime, name);
            setAdded(true);
          }}
          className={buttonClass("secondary", "lg", false, "flex-[1_1_200px] cursor-pointer whitespace-nowrap max-[400px]:px-4 max-[400px]:text-[15px]")}
        >
          <Icon name="calendar" size={18} strokeWidth={2.2} />
          Add a reminder
        </button>
      </div>
      {added && (
        <p role="status" className="mt-3 animate-fade text-sm font-extrabold text-mastered-ink">
          Calendar file downloaded. Open it to get a nudge at {prettyTime(reminderTime)}.
        </p>
      )}
      <Link href="/result" className="text-link mt-3 inline-flex min-h-11 items-center gap-1.5 text-[15px] font-extrabold text-indigo">
        Review tonight&apos;s results
        <Icon name="next" size={16} strokeWidth={2.6} />
      </Link>
    </section>
  );
}

export function LockedTeaser({ name }: { name: string }) {
  return (
    <section
      aria-labelledby="lock-title"
      className={`${SECTION} relative min-h-[460px] overflow-hidden`}
    >
      <div aria-hidden="true" className="p-[26px] opacity-65 blur-[4px]">
        <div className="text-2xl font-black">Skills map</div>
        <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-2.5">
          <div className="h-16 rounded-2xl bg-mastered-tint" />
          <div className="h-16 rounded-2xl bg-improving-tint" />
          <div className="h-16 rounded-2xl bg-needs-tint" />
          <div className="h-16 rounded-2xl bg-unchecked" />
        </div>
        <div className="mt-6 flex h-[120px] items-end gap-3.5">
          {[100, 76, 76, 50, 26].map((h, i) => (
            <div key={i} className="w-[34px] rounded-[10px] bg-lamp" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center p-5">
        <div className="w-[min(420px,100%)] rounded-card border-2 border-[#CFC9FF] bg-card p-6 text-center shadow-[0_5px_0_#CFC9FF]">
          <span
            aria-hidden="true"
            className="inline-flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-indigo-tint text-indigo"
          >
            <LockGlyph size={24} />
          </span>
          <h2 id="lock-title" className="mt-3 text-[22px] font-black leading-tight">
            {name}&apos;s journal comes with the plan
          </h2>
          <p className="mt-2 text-base font-semibold leading-normal text-ink-2">
            Skills map, nightly progress, history and a weekly summary, updated after every night.
          </p>
          <p className="mt-3 text-sm font-black text-indigo">Included in every plan</p>
        </div>
      </div>
    </section>
  );
}
