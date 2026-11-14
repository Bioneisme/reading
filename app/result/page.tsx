"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { buildPlan, computeProfile, SKILLS, summarizeCheck, type SessionRecord } from "@/lib/engine";
import { store, useStore, type AppState } from "@/lib/client/store";
import { missExample, plural } from "@/lib/client/progress";
import { Shell } from "@/components/Shell";
import { answerToMiss, MisreadingChoices } from "@/components/MisreadingPicker";
import { Button, Card, CheckIcon, Eyebrow, H1, H2, LinkButton, Loading, LockIcon } from "@/components/ui";

const PREMIUM = [
  "The practice story, built for this skill (every word checked)",
  "The full 28-day plan",
  "A 10-minute check every night after the first one",
  "Skills map and progress over time",
  "A weekly summary",
];

export default function ResultPage() {
  const snap = useStore();
  if (!snap) return <Shell><Loading /></Shell>;
  const { state } = snap;
  const check = [...state.sessions].reverse().find((s) => s.kind === "check");
  if (!state.child || !check) {
    return (
      <Shell>
        <H1>No reading check yet</H1>
        <p className="mt-3 text-ink-soft">Results appear after tonight&apos;s 3-minute check.</p>
        <LinkButton href={state.child ? "/check" : "/start"} className="mt-6">
          {state.child ? "Start tonight's check" : "Start with my child"}
        </LinkButton>
      </Shell>
    );
  }
  return <Result state={state} check={check} />;
}

function Result({ state, check }: { state: AppState; check: SessionRecord }) {
  const router = useRouter();
  const name = state.child!.name;
  const demo = state.demo;
  const unlocked = state.pro;

  const summary = useMemo(() => summarizeCheck(check.words, check.misses), [check]);
  const profile = useMemo(() => computeProfile(state.sessions), [state.sessions]);
  const plan = useMemo(() => buildPlan(profile, name), [profile, name]);

  const weak = summary.weakSpot;
  const weakGroup = weak ? summary.bySkill.find((g) => g.skill === weak) : undefined;
  const examples = (weakGroup?.misses ?? []).map(missExample);
  const scripts = weak ? SKILLS[weak].scripts(name) : plan.scripts;

  const changeMiss = (idx: number, said: string | null, custom?: boolean) => {
    const misses = check.misses.slice();
    misses[idx] = answerToMiss(misses[idx].word, { said, custom });
    store.putSession({ ...check, misses });
  };

  return (
    <Shell width="max-w-2xl">
      <Eyebrow>Tonight&apos;s results</Eyebrow>

      {weak && weakGroup ? (
        <>
          <H1 className="mt-2">
            {name}&apos;s weak spot: {SKILLS[weak].name} — {weakGroup.count} of {plural(summary.totalMisses, "miss", "misses")}
          </H1>
          <p className="mt-4 text-lg leading-relaxed text-ink-soft">{SKILLS[weak].explain(name, examples)}</p>
        </>
      ) : (
        <>
          <H1 className="mt-2">
            {summary.totalMisses === 0
              ? `No misses tonight — ${name} read all ${summary.totalWords} words!`
              : `${name} missed ${plural(summary.totalMisses, "word")}, with no single pattern yet`}
          </H1>
          <p className="mt-4 text-lg leading-relaxed text-ink-soft">
            {summary.totalMisses === 0
              ? "That's a great sign. Tomorrow we'll try a harder text to find the next skill to work on."
              : "Tomorrow's check will tell us more. Here's a gentle plan to start with."}
          </p>
        </>
      )}

      {demo && check.misses.length > 0 && (
        <Card className="mt-6 border-sun bg-[#fffaf0]">
          <p className="font-semibold">Try it: change what {name} said</p>
          <p className="mt-1 text-sm text-ink-soft">
            The result above is computed from these answers, not hard-coded. Try changing “bik” to “bite” or “bake” and watch the weak spot change.
          </p>
          <ul className="mt-4 grid gap-5">
            {check.misses.map((m, i) => (
              <li key={`${i}-${m.word}`}>
                <p className="mb-2 font-reading text-2xl font-bold">{m.word}</p>
                <MisreadingChoices
                  word={m.word}
                  childName={name}
                  compact
                  value={{ said: m.said }}
                  onChange={(a) => changeMiss(i, a.said, a.custom)}
                />
              </li>
            ))}
          </ul>
        </Card>
      )}

      {summary.bySkill.length > 0 && (
        <section className="mt-10">
          <H2>What we heard</H2>
          <div className="mt-4 grid gap-3">
            {summary.bySkill.map((g) => (
              <Card key={g.skill} className="!p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-semibold">{g.skill === "other" ? "Other misreadings" : SKILLS[g.skill].name}</p>
                  <p className="text-sm text-ink-soft">{plural(g.count, "miss", "misses")}</p>
                </div>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {g.misses.map((m, i) => (
                    <li key={i} className="rounded-full bg-paper px-3 py-1 font-reading text-lg">
                      {missExample(m)}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section className="mt-10">
        <H2>Say this tomorrow</H2>
        <ol className="mt-4 grid gap-3">
          {scripts.map((s, i) => (
            <li key={i} className="flex gap-3 rounded-2xl bg-brand-soft p-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand font-semibold text-white">{i + 1}</span>
              <p className="text-lg leading-relaxed">“{s}”</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-10">
        <H2>Tomorrow&apos;s 10-minute plan</H2>
        <p className="mt-1 text-ink-soft">Focus: {SKILLS[plan.focus].name}</p>
        <ol className="mt-4 grid gap-3">
          <li className="rounded-2xl border border-line bg-surface p-4">
            <p className="text-sm font-semibold text-accent">2 min · Word pairs</p>
            <p className="mt-1 font-reading text-2xl">{plan.pairs.slice(0, 4).map((p) => p.join(" / ")).join(",  ")}</p>
          </li>
          <li className="rounded-2xl border border-line bg-surface p-4">
            <p className="text-sm font-semibold text-accent">3 min · Word list</p>
            <p className="mt-1 font-reading text-2xl">{plan.wordList.join(", ")}</p>
          </li>
          <li className="rounded-2xl border border-line bg-surface p-4">
            <p className="text-sm font-semibold text-accent">5 min · Story</p>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-lg">
              <span className="font-reading text-2xl">“{plan.story.title}”</span>
              <span className="text-sm text-ink-soft">every word checked</span>
              {unlocked ? (
                <Link href={`/story/${plan.story.id}`} className="text-sm font-semibold text-brand-strong underline">
                  Open the story
                </Link>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-paper px-2 py-0.5 text-sm text-ink-soft">
                  <LockIcon className="h-3.5 w-3.5" /> Locked
                </span>
              )}
            </p>
          </li>
        </ol>
      </section>

      <section className="mt-10">
        <Card className={unlocked ? "" : "border-brand/30"}>
          <H2>{unlocked ? "Included in your plan" : `Unlock ${name}'s 28-day plan`}</H2>
          <ul className="mt-4 grid gap-2">
            {PREMIUM.map((p) => (
              <li key={p} className="flex items-start gap-2">
                {unlocked ? (
                  <CheckIcon className="mt-1 h-4 w-4 shrink-0 text-brand" />
                ) : (
                  <LockIcon className="mt-1 h-4 w-4 shrink-0 text-ink-soft" />
                )}
                <span>{p}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {unlocked ? (
              <LinkButton href="/journal">Go to {name}&apos;s journal</LinkButton>
            ) : (
              <LinkButton href="/plans" variant="accent">Unlock {name}&apos;s 28-day plan</LinkButton>
            )}
            {demo && (
              <Button
                variant="secondary"
                onClick={() => {
                  store.jumpToDay5();
                  router.push("/journal");
                }}
              >
                Jump to Day 5 →
              </Button>
            )}
          </div>
          {demo && (
            <p className="mt-3 text-sm text-ink-soft">“Jump to Day 5” shows what a parent sees after five nights.</p>
          )}
        </Card>
      </section>

      <p className="mt-8 text-sm text-ink-soft">
        Readly is a coaching tool, not a medical or dyslexia test. If you&apos;re worried, talk to {name}&apos;s teacher.
      </p>
    </Shell>
  );
}
