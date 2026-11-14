"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  allowedSkills,
  buildPlan,
  computeProfile,
  getStory,
  SKILL_ORDER,
  validateStory,
  wordsOf,
  type Profile,
  type Story,
} from "@/lib/engine";
import { useStore, type AppState } from "@/lib/client/store";
import { ButtonLink, ExampleChip, Icon } from "@/components/kit";
import { SKILL_SHORT } from "@/components/journal/skillCopy";
import { AnnotatedPassage, PracticeToggle } from "./AnnotatedPassage";
import { legendFor, SHAPE_GLYPH, storyTokens } from "./annotate";

const CHIP = "rounded-full border-2 border-line bg-card px-3 py-1.5 text-sm font-extrabold";

function list(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

function explainer(story: Story, name: string | null, profile: Profile | null): string {
  const focus = SKILL_SHORT[story.focus];
  if (!name || !profile) {
    return `Every word practices ${focus}, uses a sound pattern kids usually learn before it, or is a tricky word kids learn by sight. Toggle the parent view to see which is which.`;
  }
  const mastered = SKILL_ORDER.filter((s) => s !== "tricky" && s !== story.focus && profile.skills[s].status === "mastered")
    .slice(0, 2)
    .map((s) => SKILL_SHORT[s].toLowerCase());
  const known = mastered.length ? `a skill ${name} has mastered (${list(mastered)}), ` : "";
  return `Every word is ${known}the skill ${name} is practicing (${focus}), or a tricky word ${name} knows by sight. Each word is checked against ${name}'s skills map before the story is shown.`;
}

export function StoryReader({ id }: { id: string }) {
  const snap = useStore();
  const story = getStory(id);
  if (!story) return <NotFound name={snap?.state.child?.name ?? null} />;
  return <Reader story={story} state={snap?.state ?? null} />;
}

function Reader({ story, state }: { story: Story; state: AppState | null }) {
  const [labels, setLabels] = useState(true);
  const child = state?.child ?? null;
  const name = child?.name ?? null;
  const demo = !!state?.demo;
  const sessions = state?.sessions ?? [];
  const unlocked = !!state && (state.demo || state.pro);

  const profile = useMemo(() => (sessions.length ? computeProfile(sessions) : null), [sessions]);
  const plan = useMemo(() => (profile && name ? buildPlan(profile, name) : null), [profile, name]);
  const tokens = useMemo(() => storyTokens(story.text, null), [story.text]);
  const legend = useMemo(() => legendFor(tokens, story.focus), [tokens, story.focus]);
  const count = wordsOf(story.text).length;
  const checked = useMemo(() => {
    if (!profile || !name) return false;
    return validateStory(story.text, allowedSkills(profile), { names: [name] }).ok;
  }, [profile, name, story.text]);

  const tonight = plan?.story.id === story.id;
  const eyebrow = tonight
    ? `Tonight's story · ${SKILL_SHORT[plan.focus]}, round ${plan.round}`
    : `Practice story · ${SKILL_SHORT[story.focus]}`;

  const cta = !child
    ? { href: "/start", label: "Start with my child", play: false }
    : !sessions.length
      ? { href: "/check", label: "Start tonight's check", play: false }
      : unlocked
        ? { href: "/session", label: "Start tonight's 10 minutes", play: true }
        : { href: "/plans", label: "Unlock nightly sessions", play: false };

  return (
    <div className="min-h-screen bg-paper pb-14">
      <header className="no-print border-b-2 border-line-soft">
        <div className="mx-auto flex max-w-[1120px] items-center gap-3 px-6 py-3">
          <Link
            href={child ? "/journal" : "/"}
            className="inline-flex min-h-11 flex-none items-center gap-1.5 text-[15px] font-extrabold text-indigo no-underline"
          >
            <Icon name="back" size={18} strokeWidth={2.6} />
            {child ? `${child.name}'s journal` : "Readly"}
          </Link>
          <div className="flex-auto" />
          {demo && <ExampleChip />}
          <button
            type="button"
            onClick={() => window.print()}
            className="tactile inline-flex min-h-11 flex-none cursor-pointer items-center gap-2 rounded-[14px] border-2 border-line-strong bg-card px-3.5 text-[15px] font-extrabold text-ink shadow-[0_3px_0_#DCD3C3]"
          >
            <Icon name="print" size={18} />
            Print
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1000px] px-6 pt-7 print:max-w-none print:p-0">
        <div className="no-print text-[13px] font-black uppercase tracking-[0.1em] text-indigo">{eyebrow}</div>
        <h1 className="mt-1.5 font-read text-[clamp(40px,4.4vw,60px)] font-bold leading-[1.05]">{story.title}</h1>
        <ul className="no-print mt-3.5 flex flex-wrap gap-2">
          <li className={CHIP}>{count} words</li>
          <li className={CHIP}>Built for {SKILL_SHORT[story.focus]}</li>
          {checked && name && (
            <li className="inline-flex items-center gap-1.5 rounded-full bg-mastered-tint px-3 py-1.5 text-sm font-black text-mastered-ink">
              <Icon name="check" size={16} strokeWidth={2.6} />
              Every word checked for {name}
            </li>
          )}
        </ul>

        <div className="no-print mt-[22px] flex flex-wrap items-center gap-x-5 gap-y-3">
          <PracticeToggle on={labels} onChange={setLabels} />
          {labels && (
            <ul aria-label="Legend" className="flex flex-wrap gap-x-4 gap-y-2">
              {legend.map((l) => (
                <li
                  key={l.key}
                  className="inline-flex items-center gap-1.5 text-sm font-black"
                  style={{ color: l.ink }}
                >
                  <span aria-hidden="true">{SHAPE_GLYPH[l.shape]}</span>
                  {l.label} · {l.count}
                </li>
              ))}
            </ul>
          )}
        </div>

        <article
          aria-label={story.title}
          className="mt-[18px] rounded-[30px] border-2 border-line bg-card p-[clamp(20px,4vw,52px)] shadow-edge print:border-0 print:p-0 print:shadow-none"
        >
          <AnnotatedPassage text={story.text} tokens={tokens} focus={story.focus} labels={labels} />
        </article>

        <p className="no-print mt-[18px] max-w-[760px] text-[15px] font-bold leading-[1.6] text-ink-2">
          {explainer(story, name, profile)}
        </p>
        <div className="no-print mt-[22px] flex flex-wrap gap-3">
          <ButtonLink href={cta.href}>
            {cta.play && <Icon name="play" size={18} />}
            {cta.label}
          </ButtonLink>
        </div>
      </main>
    </div>
  );
}

function NotFound({ name }: { name: string | null }) {
  return (
    <div className="min-h-screen bg-paper">
      <main className="mx-auto max-w-[640px] px-6 pt-20 text-center">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-tint text-indigo">
          <Icon name="book" size={28} />
        </span>
        <h1 className="mt-4 text-[32px] font-black leading-tight tracking-[-0.02em]">We couldn&apos;t find that story</h1>
        <p className="mt-2 text-[17px] font-semibold leading-normal text-ink-2">
          It may have been replaced by a newer one. Tonight&apos;s story is always in the journal.
        </p>
        <ButtonLink href={name ? "/journal" : "/"} className="mt-6">
          {name ? `Back to ${name}'s journal` : "Back to Readly"}
        </ButtonLink>
      </main>
    </div>
  );
}
