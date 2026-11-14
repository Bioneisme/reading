import Image from "next/image";
import type { ReactNode } from "react";
import type { Grade } from "@/lib/engine";
import { GRADE_LABEL } from "@/lib/client/progress";
import { EVENING_ART, GOAL_ART, GRADE_ART } from "./art";
import { EVENINGS, GOALS, MINUTES, SIGNS } from "./copy";
import { PictureCard } from "./PictureCard";

const h1 = "m-0 text-[28px] font-black leading-[1.12] tracking-[-0.02em] lg:text-[clamp(28px,3vw,40px)]";
const lead = "mt-2 text-[17px] font-semibold text-ink-2";

function Question({ title, sub, children }: { title: ReactNode; sub: string; children: ReactNode }) {
  return (
    <>
      <h1 className={`${h1} text-balance`}>{title}</h1>
      <p className={lead}>{sub}</p>
      {children}
    </>
  );
}

export function NameStep({ name, onName, onSubmit }: { name: string; onName: (v: string) => void; onSubmit: () => void }) {
  return (
    <div>
      <div className="relative aspect-video overflow-hidden rounded-[28px] bg-indigo-tint">
        <Image
          src="/images/photo-3-mom-floor.jpg"
          alt="A mom sits on the rug with her phone while her little one plays"
          fill
          priority
          sizes="(min-width: 1024px) 500px, 100vw"
          className="object-cover object-[50%_35%]"
        />
        <span className="absolute left-3.5 top-3.5 rounded-full bg-card px-3 py-1.5 text-[13px] font-black text-ink">
          6 quick questions · about 1 minute
        </span>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="relative mx-3 -mt-9 rounded-card border-2 border-line bg-card p-[22px] shadow-edge"
      >
        <h1 className="m-0 text-[24px] font-black leading-[1.15] tracking-[-0.02em] sm:text-[26px] lg:text-[34px]">
          What&apos;s your child&apos;s first name?
        </h1>
        <label htmlFor="child-name" className="mt-4 block text-sm font-extrabold text-ink-2">
          First name
        </label>
        <input
          id="child-name"
          type="text"
          autoComplete="off"
          autoFocus
          maxLength={30}
          value={name}
          onChange={(e) => onName(e.target.value)}
          placeholder="e.g. Mia"
          className="mt-1.5 block min-h-[58px] w-full rounded-button border-2 border-indigo bg-card px-[18px] text-[22px] font-extrabold text-ink placeholder:text-[#B3AC9E]"
        />
        <p className="mt-2.5 text-sm font-bold leading-normal text-ink-3">
          First name and grade are all we ask. No photos, no voice, no email.
        </p>
      </form>
    </div>
  );
}

export function GradeStep({ name, grade, onPick }: { name: string; grade: Grade | null; onPick: (g: Grade) => void }) {
  const grades: Grade[] = ["K", "1", "2", "3"];
  return (
    <Question title={`What grade is ${name} in?`} sub="We'll pick the right text for tonight.">
      <div role="radiogroup" aria-label="Grade" className="mt-2 grid grid-cols-2 gap-3.5">
        {grades.map((g) => (
          <PictureCard
            key={g}
            className="mt-[34px]"
            selected={grade === g}
            onSelect={() => onPick(g)}
            art={GRADE_ART[g].art}
            artClass={GRADE_ART[g].artClass}
            title={GRADE_LABEL[g]}
            sub={GRADE_ART[g].ages}
          />
        ))}
      </div>
    </Question>
  );
}

export function HeardStep({ name, signs, onToggle }: { name: string; signs: string[]; onToggle: (id: string) => void }) {
  return (
    <Question title={`Which of these have you heard when ${name} reads?`} sub="Pick all that apply. Each one points to a reading skill.">
      <div role="group" aria-label="What you've heard" className="mt-[18px] flex flex-col gap-2.5">
        {SIGNS.map((s) => {
          const on = signs.includes(s.id);
          return (
            <button
              key={s.id}
              type="button"
              role="checkbox"
              aria-checked={on}
              onClick={() => onToggle(s.id)}
              className={`option flex min-h-16 w-full cursor-pointer items-center gap-3.5 rounded-[18px] border-2 py-2.5 pl-2.5 pr-3.5 text-left text-ink ${
                on ? "border-indigo bg-[#F4F2FF] shadow-[0_4px_0_#4B3FE0]" : "border-edge bg-card shadow-[0_4px_0_#E4DBCB]"
              }`}
            >
              <span
                aria-hidden="true"
                className={`flex w-[112px] flex-none items-center justify-center self-stretch rounded-xl px-1.5 py-1 text-center font-read text-[17px] leading-[1.2] ${s.view.tint}`}
              >
                {s.view.visual}
              </span>
              <span className="min-w-0 flex-auto">
                <span className="block text-base font-black leading-[1.3]">{s.view.label}</span>
                <span className="mt-0.5 block text-[13px] font-extrabold text-indigo">{s.view.skill}</span>
              </span>
              <span
                aria-hidden="true"
                className={`inline-flex h-[26px] w-[26px] flex-none items-center justify-center rounded-lg border-2 text-white ${
                  on ? "border-indigo bg-indigo" : "border-unchecked-line bg-card"
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
              </span>
            </button>
          );
        })}
      </div>
    </Question>
  );
}

export function EveningsStep({ value, onPick }: { value: string | null; onPick: (v: string) => void }) {
  return (
    <Question title="How do reading evenings usually go?" sub="No judgment — it sets the tone of your tips.">
      <div role="radiogroup" aria-label="Reading evenings" className="mt-2 grid grid-cols-3 gap-2 sm:gap-3">
        {EVENINGS.map((e) => (
          <PictureCard compact key={e} selected={value === e} onSelect={() => onPick(e)} art={EVENING_ART[e].art} artClass={EVENING_ART[e].artClass} title={e} />
        ))}
      </div>
    </Question>
  );
}

export function MinutesStep({ value, onPick }: { value: number | null; onPick: (v: number) => void }) {
  return (
    <Question title="How many minutes can you do most nights?" sub="We'll fit the plan to your time.">
      <div role="radiogroup" aria-label="Minutes a night" className="mt-2 grid grid-cols-3 gap-2 sm:gap-3">
        {MINUTES.map((n) => {
          const rec = n === 10;
          return (
            <PictureCard
              compact
              key={n}
              selected={value === n}
              onSelect={() => onPick(n)}
              artClass={`h-[88px] ${rec ? "bg-indigo-tint" : "bg-[#F6F1E7]"}`}
              art={
                <span
                  className={`-mt-[34px] inline-flex h-20 min-w-[72px] items-center justify-center rounded-[20px] border-2 px-3 text-[40px] font-black tracking-[-0.02em] ${
                    rec
                      ? "border-[#3F33CF] bg-indigo text-white shadow-[0_6px_0_#3328B0]"
                      : "border-edge bg-card text-ink shadow-[0_6px_0_#E4DBCB]"
                  }`}
                >
                  {n}
                </span>
              }
              title="minutes"
              extra={
                rec ? (
                  <span className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border-2 border-white bg-lamp px-2.5 py-[3px] text-[11px] font-black text-ink">
                    Recommended
                  </span>
                ) : null
              }
            />
          );
        })}
      </div>
    </Question>
  );
}

export function GoalStep({ name, value, onPick }: { name: string; value: string | null; onPick: (v: string) => void }) {
  return (
    <Question title={`What's your goal for ${name}?`} sub="Pick the one that matters most right now.">
      <div role="radiogroup" aria-label="Goal" className="mt-2 grid grid-cols-3 gap-2 sm:gap-3">
        {GOALS.map((g) => (
          <PictureCard compact key={g} selected={value === g} onSelect={() => onPick(g)} art={GOAL_ART[g].art} artClass={GOAL_ART[g].artClass} title={g} />
        ))}
      </div>
    </Question>
  );
}

export function BuildingStep({ possessive, letters, steps, t }: { possessive: string; letters: string[]; steps: string[]; t: number }) {
  const tiles = [
    "-rotate-[8deg] bg-card border-edge shadow-[0_5px_0_#E4DBCB]",
    "bg-indigo border-[#3F33CF] text-white shadow-[0_5px_0_#3328B0]",
    "rotate-[8deg] bg-lamp border-[#E8AE1C] shadow-[0_5px_0_#D99A0B]",
  ];
  const bob = [t % 2 === 0 ? "-translate-y-1.5" : "", t % 2 === 1 ? "-translate-y-2.5" : "", t % 2 === 0 ? "-translate-y-1" : ""];
  return (
    <div className="lg:pt-6">
      <div aria-hidden="true" className="flex h-[120px] items-end justify-center gap-2">
        {letters.map((l, i) => (
          <span
            key={i}
            className={`inline-flex h-[62px] w-14 items-center justify-center rounded-2xl border-2 font-read text-[32px] font-bold transition-transform duration-500 motion-reduce:transition-none ${tiles[i]} ${bob[i]}`}
          >
            {l}
          </span>
        ))}
      </div>
      <h1 className={`${h1} mt-[22px] text-center`}>Building {possessive} reading profile…</h1>
      <ol aria-live="polite" className="mx-auto mt-6 flex max-w-[460px] flex-col gap-2.5">
        {steps.map((s, i) => {
          const done = t >= i + 1;
          const cur = t === i;
          return (
            <li
              key={s}
              className={`flex items-center gap-3 rounded-button border-2 border-line bg-card px-4 py-3.5 transition-opacity ${
                done || cur ? "opacity-100" : "opacity-45"
              }`}
            >
              <span
                aria-hidden="true"
                className={`inline-flex h-7 w-7 flex-none items-center justify-center rounded-full text-white ${
                  done ? "bg-mastered" : cur ? "bg-indigo-line" : "bg-edge"
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
              </span>
              <span className="text-base font-extrabold">
                {s}
                {done && <span className="sr-only"> — done</span>}
              </span>
            </li>
          );
        })}
      </ol>
      <div aria-hidden="true" className="mx-auto mt-5 h-2.5 max-w-[460px] overflow-hidden rounded-full bg-[#EDE6D8]">
        <div
          className="h-full rounded-full bg-indigo transition-[width] duration-700 ease-linear"
          style={{ width: `${(Math.min(t, 3) / 3) * 100}%` }}
        />
      </div>
    </div>
  );
}
