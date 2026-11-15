"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { AppHeader, ChildChip, Glim, Icon } from "@/components/kit";

export type StepId = "pairs" | "list" | "story" | "said" | "summary";

const STEPS: { label: string; short: string; time: string }[] = [
  { label: "Warm-up", short: "Warm-up", time: "2 min" },
  { label: "Word list", short: "Word list", time: "3 min" },
  { label: "Story", short: "Story", time: "5 min" },
  { label: "Summary", short: "Summary", time: "" },
];

const STEP_INDEX: Record<StepId, number> = { pairs: 0, list: 1, story: 2, said: 2, summary: 3 };

export function SessionHeader({ name, night, demo }: { name: string; night: number; demo: boolean }) {
  return (
    <AppHeader
      right={
        <div className="flex items-center gap-2">
          <span className="max-[359px]:hidden">
            <ChildChip name={name} grade={`Night ${night}`} demo={demo} />
          </span>
          <span className="min-[360px]:hidden">
            <ChildChip name={name} demo={demo} />
          </span>
          <Link
            href="/journal"
            aria-label={`Exit to ${name}'s journal`}
            className="tactile inline-flex h-11 w-11 flex-none items-center justify-center rounded-[14px] border-2 border-edge bg-card text-ink"
          >
            <Icon name="close" size={20} strokeWidth={2.4} />
          </Link>
        </div>
      }
    />
  );
}

export function Stepper({ title, step }: { title: string; step: StepId }) {
  const at = STEP_INDEX[step];
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const r = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
    return () => cancelAnimationFrame(r);
  }, []);
  return (
    <nav aria-label="Tonight's steps" className="no-print mx-auto w-full max-w-[1120px] px-6 pt-4">
      <div className="text-[13px] font-black text-indigo">{title}</div>
      <ol className="mt-2 flex gap-2">
        {STEPS.map((s, i) => {
          const on = i <= at;
          return (
            <li key={s.label} aria-current={i === at ? "step" : undefined} className="min-w-0 flex-1">
              <div aria-hidden="true" className="h-2 overflow-hidden rounded-full bg-[#E6DFD2]">
                <div
                  className="bar-fill h-full rounded-full bg-indigo"
                  style={{ width: shown && on ? "100%" : "0%", transitionDelay: i === at ? "80ms" : "0ms" }}
                />
              </div>
              <div
                className={`mt-1.5 text-xs font-black transition-colors duration-300 ${on ? "text-[#2B2290]" : "text-ink-3"}`}
              >
                <span className="block truncate sm:hidden">{s.short}</span>
                {s.time && (
                  <span className={`block truncate text-[11px] font-extrabold sm:hidden ${on ? "text-indigo" : "text-ink-3"}`}>
                    {s.time}
                  </span>
                )}
                <span className="hidden truncate sm:block">
                  {s.label}
                  {s.time && ` · ${s.time}`}
                </span>
                {i < at && <span className="sr-only"> (done)</span>}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function SayThis({ name, script }: { name: string; script: string }) {
  return (
    <div className="mt-5 flex max-w-[640px] items-start gap-3">
      <Glim pose="hello" size={56} float={false} className="-mt-1 flex-none" />
      <div className="rounded-[20px_20px_20px_6px] bg-indigo-tint px-[18px] py-3.5 text-base font-bold leading-normal">
        <span className="block text-[11px] font-black uppercase tracking-[0.1em] text-indigo">
          If {name} is stuck, say this
        </span>
        “{script}”
      </div>
    </div>
  );
}

export function StepMain({ children, narrow = false }: { children: ReactNode; narrow?: boolean }) {
  return (
    <main
      className={`mx-auto w-full flex-[1_0_auto] px-6 pb-8 pt-[22px] ${narrow ? "max-w-[760px]" : "max-w-[1000px]"}`}
    >
      {children}
    </main>
  );
}

export function StepTitle({ title, sub }: { title: string; sub: string }) {
  return (
    <>
      <h1 className="text-[clamp(26px,2.8vw,38px)] font-black leading-[1.12] tracking-[-0.02em]">{title}</h1>
      <p className="mt-1.5 text-base font-semibold leading-normal text-ink-2">{sub}</p>
    </>
  );
}
