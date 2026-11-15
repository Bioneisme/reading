"use client";

import { Fragment, type ReactNode } from "react";
import { computeProfile, type Profile, type SessionRecord, type SkillId } from "@/lib/engine";
import { Glim, useCountUp } from "@/components/kit";
import { Moon } from "@/components/journal/icons";
import { missLabel, nightsInARow } from "@/components/journal/derive";
import { numberWord, SKILL_SHORT, SKILL_WITH_EXAMPLES, STATUS_LABEL } from "@/components/journal/skillCopy";
import { DemoNextStep } from "@/components/DemoNextStep";
import { StepMain } from "./parts";

function ReadWord({ children }: { children: ReactNode }) {
  return <span className="font-read text-xl text-ink">{children}</span>;
}

function joinWords(words: string[]): ReactNode {
  return words.map((w, i) => (
    <Fragment key={w}>
      {i > 0 && (i === words.length - 1 ? " and " : ", ")}
      <ReadWord>{w}</ReadWord>
    </Fragment>
  ));
}

export interface SummaryData {
  before: SessionRecord[];
  rec: SessionRecord;
  storyWords: string[];
  name: string;
  demo: boolean;
  beforeProfile: Profile;
}

export function summaryFacts({ before, rec, demo }: SummaryData) {
  const after = [...before, rec];
  const run = nightsInARow(after, demo);
  const profile = computeProfile(after);
  return { run, profile };
}

function CountMisses({ n }: { n: number }) {
  const v = useCountUp(n, 600);
  return (
    <>
      <span aria-hidden="true">{missLabel(v)}</span>
      <span className="sr-only">{missLabel(n)}</span>
    </>
  );
}

export function SessionSummary(data: SummaryData) {
  const { before, rec, storyWords, name, beforeProfile } = data;
  const { run, profile } = summaryFacts(data);
  const focus = rec.focus as SkillId;
  const tonight = rec.misses.length;
  const last = before.length ? before[before.length - 1].misses.length : null;
  const missed = new Set(rec.misses.map((m) => m.word));
  const shown = new Set(rec.words);
  const earlier = before.slice(-3).flatMap((s) => s.misses.map((m) => m.word));
  const fixed = [...new Set(earlier)].filter((w) => shown.has(w) && !missed.has(w)).slice(0, 3);
  const storySet = new Set(storyWords);
  const storyMisses = [...new Set(rec.misses.map((m) => m.word).filter((w) => storySet.has(w)))];
  const statusBefore = beforeProfile.skills[focus].status;
  const statusAfter = profile.skills[focus].status;

  const delta =
    last === null
      ? null
      : tonight < last
        ? { text: `${last - tonight} fewer than last time`, good: true }
        : tonight === last
          ? { text: "Same as last time — steady", good: true }
          : { text: "A tougher night. That happens.", good: false };

  const moons = Array.from({ length: 7 }, (_, i) => i < Math.min(run, 7));
  const headline = run >= 2 ? `Night ${rec.day} done. ${numberWord(run)} nights in a row.` : `Night ${rec.day} done.`;
  const next =
    profile.focus !== focus
      ? `${SKILL_SHORT[focus]} looks steady for now. Tomorrow starts ${SKILL_WITH_EXAMPLES[profile.focus]}.`
      : profile.nextUp
        ? `Same skill, new words and a new story. Next up after that: ${SKILL_WITH_EXAMPLES[profile.nextUp]}.`
        : "Same skill, new words and a new story.";

  return (
    <StepMain narrow>
      <div className="flex animate-pop justify-center">
        <Glim pose="cheer" size={120} className="max-sm:size-24" />
      </div>
      <ol aria-label={`${run} ${run === 1 ? "night" : "nights"} in a row`} className="flex justify-center gap-2 pt-2.5">
        {moons.map((on, i) => {
          const fresh = on && i === Math.min(run, 7) - 1;
          return (
            <li key={i} aria-hidden="true" style={{ animationDelay: `${i * 70}ms` }} className="animate-rise">
              <span
                style={{ animationDelay: `${fresh ? 700 : 360 + i * 70}ms` }}
                className={`inline-flex ${on ? "animate-pop" : ""} ${fresh ? "[animation-duration:240ms]" : ""}`}
              >
                <Moon fill={on ? "#FFC93C" : "transparent"} stroke={on ? "#E5A50F" : "#CFC6B6"} size={30} />
              </span>
            </li>
          );
        })}
      </ol>
      <h1 className="mt-4 text-center text-[clamp(30px,3.4vw,44px)] font-black leading-[1.1] tracking-[-0.02em]">
        {headline}
      </h1>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-[22px] bg-night p-[18px] text-white shadow-[0_5px_0_#14124A]">
          <div className="text-xs font-black uppercase tracking-[0.1em] text-[#FFD95E]">Tonight</div>
          <div className="mt-1 text-[clamp(26px,3vw,34px)] font-black tabular-nums">
            <CountMisses n={tonight} />
          </div>
        </div>
        <div className="rounded-[22px] border-2 border-line bg-card p-[18px] shadow-edge">
          <div className="text-xs font-black uppercase tracking-[0.1em] text-ink-3">Last time</div>
          <div className="mt-1 text-[clamp(26px,3vw,34px)] font-black tabular-nums">
            {last === null ? "—" : <CountMisses n={last} />}
          </div>
        </div>
      </div>
      {delta && (
        <div className="mt-3 animate-fade text-center [animation-delay:600ms]">
          <span
            className={`inline-block rounded-full px-3.5 py-1.5 text-[15px] font-black ${
              delta.good ? "bg-mastered-tint text-mastered-ink" : "bg-needs-tint text-needs-ink"
            }`}
          >
            {delta.text}
          </span>
        </div>
      )}

      <section className="mt-[22px] animate-rise rounded-[22px] border-2 border-line bg-card px-[22px] py-5 [animation-delay:200ms]">
        <h2 className="text-lg font-black">What changed</h2>
        <p className="mt-1.5 text-[17px] font-semibold leading-[1.55] text-ink-2">
          {fixed.length > 0 ? (
            <>
              {name} read {joinWords(fixed)} on the first try.{" "}
            </>
          ) : tonight === 0 ? (
            <>{name} read every word tonight. </>
          ) : (
            <>
              Tonight&apos;s misses: {joinWords([...missed].slice(0, 4))}.{" "}
            </>
          )}
          {storyMisses.length === 0
            ? "The story had no misses at all."
            : `The story had ${missLabel(storyMisses.length)}.`}
          {statusAfter !== statusBefore && ` ${SKILL_SHORT[focus]} is now: ${STATUS_LABEL[statusAfter].toLowerCase()}.`}
        </p>
      </section>

      <section className="mt-3 animate-rise rounded-[22px] border-2 border-lamp-line bg-lamp-tint px-[22px] py-5 [animation-delay:300ms]">
        <h2 className="text-xs font-black uppercase tracking-[0.1em] text-lamp-ink">Tomorrow&apos;s focus</h2>
        <p className="mt-1.5 text-xl font-black leading-[1.4]">
          {SKILL_SHORT[profile.focus]} · round {profile.round}
        </p>
        <p className="mt-1 text-base font-bold leading-normal text-[#4A3500]">{next}</p>
      </section>

      {data.demo && (
        <DemoNextStep name={name} title={`That was ${name}\'s night. Your child\'s plan starts with one check.`} className="mt-6" />
      )}
    </StepMain>
  );
}
