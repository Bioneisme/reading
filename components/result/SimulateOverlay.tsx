"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { ButtonLink, Icon } from "@/components/kit";
import { computeProfile, SKILLS } from "@/lib/engine";
import { DEMO_SESSIONS } from "@/lib/demo";
import { store } from "@/lib/client/store";
import { nextDay, plural } from "@/lib/client/progress";

const STEP_MS = 550;
const NIGHTS = DEMO_SESSIONS.length;

function useNights() {
  return useMemo(() => {
    const final = computeProfile(DEMO_SESSIONS);
    const rows = DEMO_SESSIONS.map((s, i) => {
      if (i === 0 || s.kind === "check") return { focus: "First check", misses: final.missesPerNight[i] ?? 0 };
      const before = computeProfile(DEMO_SESSIONS.slice(0, i));
      const skill = s.focus ?? before.focus;
      return { focus: `${SKILLS[skill].name} · round ${before.round}`, misses: final.missesPerNight[i] ?? 0 };
    });
    const firstFocus = DEMO_SESSIONS.find((s) => s.kind === "nightly")?.focus ?? final.focus;
    return { rows, focusName: SKILLS[firstFocus].name, day: nextDay(DEMO_SESSIONS) };
  }, []);
}

export function SimulateOverlay({ name, onClose }: { name: string; onClose: () => void }) {
  const [step, setStep] = useState(1);
  const { rows, focusName, day } = useNights();
  const dialogRef = useRef<HTMLDivElement>(null);
  const done = step > NIGHTS;

  useEffect(() => {
    if (done) {
      store.simulateWeek();
      return;
    }
    const t = window.setTimeout(() => setStep((s) => s + 1), STEP_MS);
    return () => window.clearTimeout(t);
  }, [step, done]);

  useEffect(() => {
    dialogRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const peak = Math.max(1, ...rows.map((r) => r.misses));
  const first = rows[0]?.misses ?? 0;
  const last = rows[rows.length - 1]?.misses ?? 0;

  return (
    <div className="fixed inset-0 z-50 animate-fade overflow-y-auto bg-[rgba(28,26,59,0.6)] px-5 py-[72px] max-sm:px-4 max-sm:py-10">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sim-title"
        tabIndex={-1}
        className="mx-auto w-full max-w-[560px] animate-sheet rounded-[28px] bg-card p-7 shadow-[0_8px_0_#14124A] max-sm:p-[22px]"
      >
        <span className="inline-block rounded-full border-[1.5px] border-lamp-line bg-lamp-tint px-2.5 py-[3px] text-[11px] font-black uppercase tracking-[0.08em] text-lamp-ink">
          Simulated week
        </span>
        <h2 id="sim-title" aria-live="polite" className="mt-3 text-[28px] font-black tracking-[-0.02em] max-sm:text-2xl">
          {done ? `${NIGHTS} nights done.` : `Running ${NIGHTS} sample nights...`}
        </h2>
        <p className="mt-1.5 text-base font-semibold leading-normal text-ink-2">
          {done
            ? `${focusName} went from ${plural(first, "miss", "misses")} to ${last}. ${name}’s journal is ready.`
            : "Same engine, sample answers, sped up."}
        </p>
        <ol className="mt-[18px] flex flex-col gap-2">
          {rows.map((r, i) => {
            const shown = step > i;
            return (
              <li
                key={i}
                className={`flex items-center gap-3 rounded-chip px-3.5 py-2.5 transition-[opacity,background-color] duration-300 ${
                  shown ? (step === i + 1 ? "bg-lamp-tint opacity-100" : "bg-paper opacity-100") : "bg-paper opacity-35"
                }`}
              >
                <span className="w-[68px] flex-none text-[15px] font-black max-sm:w-[60px]">Night {i + 1}</span>
                <span className="min-w-0 flex-auto truncate text-sm font-bold text-ink-2">{r.focus}</span>
                <span
                  aria-hidden="true"
                  className="bar-fill h-2.5 w-[calc(var(--bar)*56px)] flex-none rounded-full bg-lamp sm:w-[calc(var(--bar)*104px)]"
                  style={{ "--bar": shown ? r.misses / peak : 0 } as CSSProperties}
                />
                <span key={shown ? "on" : "off"} className={`w-16 flex-none text-right text-[15px] font-black ${shown ? "animate-fade" : ""}`}>
                  {shown ? plural(r.misses, "miss", "misses") : "..."}
                </span>
              </li>
            );
          })}
        </ol>
        <div aria-hidden="true" className="mt-4 h-2.5 overflow-hidden rounded-full bg-[#EDE6D8]">
          <div
            className="bar-fill h-full rounded-full bg-indigo"
            style={{ width: `${(Math.min(step, NIGHTS) / NIGHTS) * 100}%` }}
          />
        </div>
        {done && (
          <div className="mt-5 animate-rise">
            <ButtonLink href="/journal" block className="animate-pop max-sm:px-4 max-sm:text-base motion-safe:[animation-delay:380ms]">
              Open {name}&apos;s journal, Day {day}
              <Icon name="next" size={18} strokeWidth={2.4} />
            </ButtonLink>
          </div>
        )}
        <button
          type="button"
          onClick={onClose}
          className="text-link mt-3 min-h-11 w-full cursor-pointer bg-transparent text-[15px] font-extrabold text-indigo"
        >
          Back to results
        </button>
      </div>
    </div>
  );
}
