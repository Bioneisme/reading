"use client";

import Link from "next/link";
import { quizProfile, SKILLS } from "@/lib/engine";
import { useStore } from "@/lib/client/store";
import { Shell } from "@/components/Shell";
import { Card, Eyebrow, H1, LinkButton, Loading } from "@/components/ui";

export default function PreliminaryProfile() {
  const snap = useStore();
  if (!snap) return <Shell><Loading /></Shell>;
  const { child, quiz } = snap.state;
  if (!child) {
    return (
      <Shell>
        <H1>Let&apos;s start with a few questions</H1>
        <p className="mt-3 text-ink-soft">It takes about a minute.</p>
        <LinkButton href="/start" className="mt-6">Start the quiz</LinkButton>
      </Shell>
    );
  }
  const skills = quizProfile(quiz?.signs ?? []);
  const unsure = !quiz?.signs.length || quiz.signs.includes("unsure");

  return (
    <Shell width="max-w-2xl">
      <Eyebrow>Preliminary</Eyebrow>
      <H1 className="mt-2">{child.name}&apos;s reading profile</H1>
      <p className="mt-3 text-lg text-ink-soft">
        {unsure
          ? `You're not sure yet, and that's fine. These are the most common weak spots for kids ${child.name}'s age. Tonight's check will tell us for real.`
          : `Based on what you've heard, these are ${child.name}'s likely weak spots.`}
      </p>

      <ul className="mt-6 grid gap-3">
        {skills.map((id, i) => (
          <li key={id}>
            <Card>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-display text-xl font-semibold">
                  <span className="mr-2 text-ink-soft">{i + 1}.</span>
                  {SKILLS[id].name}
                </p>
                <span className="rounded-full bg-paper px-3 py-1 font-reading text-lg">{SKILLS[id].example}</span>
              </div>
              <p className="mt-2 leading-relaxed text-ink-soft">{SKILLS[id].explain(child.name, [])}</p>
            </Card>
          </li>
        ))}
      </ul>

      <div className="mt-8 rounded-3xl bg-brand-soft p-6">
        <p className="font-display text-xl font-semibold text-brand-strong">
          Tonight: a 3-minute reading check to confirm.
        </p>
        <p className="mt-2 text-ink-soft">
          {child.name} reads a short text aloud. You tap the words they miss. That&apos;s it.
        </p>
        <LinkButton href="/check" className="mt-5 w-full sm:w-auto">
          Start tonight&apos;s check
        </LinkButton>
      </div>
      <p className="mt-6 text-sm text-ink-soft">
        Wrong name or grade? <Link href="/start" className="font-semibold text-brand-strong underline">Redo the quiz</Link>
      </p>
    </Shell>
  );
}
