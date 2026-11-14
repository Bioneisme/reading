"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import { buildPlan, computeProfile, getStory, wordsOf } from "@/lib/engine";
import { useStore, type AppState } from "@/lib/client/store";
import { doneToday, GRADE_LABEL } from "@/lib/client/progress";
import {
  headerLine,
  journalDay,
  nightlyDoneTonight,
  sortSessions,
  streakLine,
  weekStrip,
  weekSummary,
} from "./derive";
import { JournalHeader } from "./JournalHeader";
import { FreePlanCard, LockedTeaser } from "./LockedCards";
import { HistoryCard, MissesChart, WeekCard } from "./SideCards";
import { SettingsCard } from "./SettingsCard";
import { SkillsMap } from "./SkillsMap";
import { SKILL_SHORT } from "./skillCopy";
import { TonightCard, type TonightCopy } from "./TonightCard";

export function JournalScreen() {
  const snap = useStore();
  const router = useRouter();
  const checked = useRef(false);

  useEffect(() => {
    if (!snap || checked.current) return;
    checked.current = true;
    if (!snap.state.child) router.replace("/start");
  }, [snap, router]);

  if (!snap || !snap.state.child) return <JournalSkeleton />;
  return <Journal state={snap.state} />;
}

function JournalSkeleton() {
  return (
    <div className="min-h-screen bg-paper" aria-busy="true">
      <div className="h-[212px] bg-night" />
    </div>
  );
}

function Journal({ state }: { state: AppState }) {
  const child = state.child!;
  const demo = state.demo;
  const sessions = useMemo(() => sortSessions(state.sessions), [state.sessions]);
  const locked = !demo && !state.pro;
  const profile = useMemo(() => computeProfile(sessions), [sessions]);
  const plan = useMemo(() => buildPlan(profile, child.name), [profile, child.name]);
  const hasSessions = sessions.length > 0;
  const hasNightly = sessions.some((s) => s.kind === "nightly");

  const story = useMemo(() => {
    const s = getStory(plan.story.id);
    return s ? { id: s.id, title: s.title, words: wordsOf(s.text).length } : null;
  }, [plan.story.id]);

  const focusTitle = `${SKILL_SHORT[profile.focus]} — round ${profile.round}`;
  const tonight: TonightCopy = !hasSessions
    ? {
        label: "Tonight",
        title: "A 3-minute reading check",
        sub: `${child.name} reads a short text out loud. You tap the words ${child.name} misses, and we find the weak spot.`,
        cta: { label: "Start tonight's check", href: "/check" },
        steps: false,
        story: null,
      }
    : nightlyDoneTonight(sessions, demo)
      ? {
          label: "Tomorrow",
          title: focusTitle,
          sub: "Tonight’s 10 minutes are done. See you tomorrow evening.",
          cta: { label: "Do one more round", href: "/session", secondary: true },
          steps: true,
          story,
        }
      : !hasNightly
        ? {
            label: "Next",
            title: focusTitle,
            sub: doneToday(sessions)
              ? `Tomorrow evening is perfect — or start now if ${child.name} is up for it.`
              : "About 10 minutes: word pairs, a word list and a new story.",
            cta: { label: `Start round ${profile.round}`, href: "/session" },
            steps: true,
            story,
          }
        : {
            label: "Tonight",
            title: focusTitle,
            sub: "About 10 minutes: word pairs, a word list and a new story.",
            cta: { label: "Start tonight’s 10 minutes", href: "/session" },
            steps: true,
            story,
          };

  const day = journalDay(sessions, demo);
  const header = (
    <JournalHeader
      title={`Day ${day} · ${child.name}`}
      line={`${GRADE_LABEL[child.grade]} · ${headerLine(profile, sessions, demo, locked)}`}
      demo={demo}
      streak={streakLine(sessions, demo)}
      week={weekStrip(sessions, demo)}
    />
  );

  return (
    <div className="min-h-screen bg-paper pb-14">
      {header}
      <div className="mx-auto flex max-w-[1120px] flex-wrap items-start gap-5 px-6 pt-6">
        <div className="flex min-w-0 flex-[2_1_560px] flex-col gap-5">
          {locked ? (
            <>
              {hasSessions ? <FreePlanCard plan={plan} /> : <TonightCard copy={tonight} />}
              <LockedTeaser name={child.name} />
            </>
          ) : (
            <>
              <TonightCard copy={tonight} />
              <SkillsMap profile={profile} sessions={sessions} showTags={hasSessions} />
            </>
          )}
        </div>
        <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-5">
          {!locked && (
            <>
              <WeekCard summary={weekSummary(profile, sessions)} />
              <MissesChart sessions={sessions} />
              <HistoryCard sessions={sessions} demo={demo} />
            </>
          )}
          <SettingsCard state={state} locked={locked} />
        </div>
      </div>
    </div>
  );
}
