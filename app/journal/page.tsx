"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { computeProfile, SKILLS, type Grade, type Profile, type SessionRecord, type SkillId } from "@/lib/engine";
import { store, useStore, type AppState } from "@/lib/client/store";
import { currentDay, doneToday, formatDate, GRADE_LABEL, plural, streak } from "@/lib/client/progress";
import { downloadReminderIcs } from "@/lib/client/ics";
import { Shell } from "@/components/Shell";
import { MissesChart, SkillMap } from "@/components/SkillMap";
import { Button, Card, Eyebrow, H1, H2, LinkButton, Loading, LockIcon } from "@/components/ui";

export default function JournalPage() {
  const snap = useStore();
  if (!snap) return <Shell><Loading /></Shell>;
  const { state } = snap;
  if (!state.child) {
    return (
      <Shell>
        <H1>Your journal starts after the first check</H1>
        <p className="mt-3 text-ink-soft">Answer six quick questions, then do a 3-minute reading check tonight.</p>
        <LinkButton href="/start" className="mt-6">Start with my child</LinkButton>
      </Shell>
    );
  }
  return <Journal state={state} />;
}

function weeklySummary(profile: Profile, sessions: SessionRecord[]): string {
  const week = sessions.slice(-7);
  const counts = new Map<SkillId, number>();
  week.forEach((s) => s.focus && counts.set(s.focus, (counts.get(s.focus) ?? 0) + 1));
  const practiced =
    Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ??
    week.flatMap((s) => s.misses).find((m) => m.skill !== "other")?.skill as SkillId | undefined ??
    profile.focus;
  const hist = (profile.skills[practiced]?.history ?? []).slice(-7);
  const next = profile.focus !== practiced ? profile.focus : profile.nextUp;
  const name = SKILLS[practiced].name;
  let first: string;
  if (hist.length >= 2 && hist.some((h) => h > 0)) {
    const a = hist[0];
    const b = hist[hist.length - 1];
    const fromTo = `from ${plural(a, "miss", "misses")} to ${b}`;
    first =
      b < a
        ? `This week: ${name} improved ${fromTo}.`
        : b === a
          ? `This week: ${name} held steady at ${plural(b, "miss", "misses")} a night.`
          : `This week: ${name} went ${fromTo}. That's normal while a skill is new.`;
  } else {
    first = `This week: the focus is ${name}.`;
  }
  return next ? `${first} Next up: ${SKILLS[next].name}.` : first;
}

function Journal({ state }: { state: AppState }) {
  const child = state.child!;
  const demo = state.demo;
  const unlocked = state.pro || demo;
  const profile = useMemo(() => computeProfile(state.sessions), [state.sessions]);
  const day = currentDay(state.sessions, demo);
  const nights = streak(state.sessions, demo);
  const done = !demo && doneToday(state.sessions) && state.sessions.some((s) => s.kind === "nightly");
  const hasSessions = state.sessions.length > 0;

  return (
    <Shell width="max-w-3xl">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Eyebrow>{child.name}&apos;s journal</Eyebrow>
          <H1 className="mt-1">
            Day {day} · {child.name}
          </H1>
        </div>
        {nights > 0 && (
          <p className="rounded-full bg-[#fff4d6] px-4 py-2 font-semibold text-[#7a5410]">
            <span aria-hidden>🔥 </span>
            {nights}-night streak
          </p>
        )}
      </header>

      <Card className="mt-6 border-brand/30 bg-brand-soft">
        <p className="text-sm font-semibold tracking-wide text-brand-strong uppercase">Tonight</p>
        {hasSessions ? (
          <>
            <p className="mt-1 font-display text-2xl font-semibold">
              {SKILLS[profile.focus].name} — round {profile.round}
            </p>
            <p className="mt-1 text-ink-soft">Word pairs, a word list and a short story. About 10 minutes.</p>
          </>
        ) : (
          <p className="mt-1 font-display text-2xl font-semibold">Start with a 3-minute reading check</p>
        )}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          {!hasSessions ? (
            <LinkButton href="/check">Start tonight&apos;s check</LinkButton>
          ) : unlocked ? (
            <LinkButton href="/session" variant={done ? "secondary" : "primary"}>
              {done ? "Do another session" : "Start tonight's 10 minutes"}
            </LinkButton>
          ) : (
            <LinkButton href="/plans" variant="accent">
              <LockIcon /> Unlock nightly sessions
            </LinkButton>
          )}
          {done && <p className="text-brand-strong">Tonight&apos;s session is done. See you tomorrow.</p>}
        </div>
      </Card>

      {unlocked ? (
        <Progress state={state} profile={profile} />
      ) : (
        <div className="relative mt-8">
          <div aria-hidden className="pointer-events-none max-h-[420px] overflow-hidden opacity-60 blur-[3px] select-none">
            <Card>
              <H2>Skills map</H2>
              <SkillMap profile={profile} />
            </Card>
          </div>
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <Card className="max-w-md text-center shadow-lg">
              <LockIcon className="mx-auto h-6 w-6 text-brand" />
              <p className="mt-2 font-display text-xl font-semibold">See {child.name}&apos;s progress night by night</p>
              <p className="mt-2 text-ink-soft">
                Skills map, misses per night, weekly summary and a new plan every evening.
              </p>
              <LinkButton href="/plans" variant="accent" className="mt-4">
                Unlock {child.name}&apos;s 28-day plan
              </LinkButton>
            </Card>
          </div>
        </div>
      )}

      <Settings state={state} />
    </Shell>
  );
}

function Progress({ state, profile }: { state: AppState; profile: Profile }) {
  const sessions = state.sessions;
  return (
    <>
      {sessions.length > 0 && (
        <p className="mt-6 rounded-2xl border border-line bg-surface p-4 text-lg">{weeklySummary(profile, sessions)}</p>
      )}

      <Card className="mt-6">
        <H2>Skills map</H2>
        <p className="mt-1 text-sm text-ink-soft">The 11 skills of early reading, in teaching order.</p>
        <SkillMap profile={profile} focus={sessions.length ? profile.focus : undefined} nextUp={sessions.length ? profile.nextUp : null} />
      </Card>

      <Card className="mt-6">
        <H2>Progress</H2>
        <div className="mt-4">
          <MissesChart values={profile.missesPerNight} />
        </div>
      </Card>

      <Card className="mt-6">
        <H2>History</H2>
        {sessions.length === 0 ? (
          <p className="mt-3 text-ink-soft">Your first night will show up here.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line">
            {[...sessions].reverse().map((s) => (
              <li key={s.id} className="flex flex-wrap items-baseline justify-between gap-2 py-3">
                <span>
                  <span className="font-semibold">Night {s.day}</span>
                  <span className="text-ink-soft"> · {formatDate(s.date)}</span>
                  <span className="block text-sm text-ink-soft">
                    {s.kind === "check" ? "Reading check" : s.focus ? SKILLS[s.focus].name : "Nightly session"}
                  </span>
                </span>
                <span className="text-sm font-semibold tabular-nums">{plural(s.misses.length, "miss", "misses")}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}

function Settings({ state }: { state: AppState }) {
  const router = useRouter();
  const child = state.child!;
  const [name, setName] = useState(child.name);
  const [grade, setGrade] = useState<Grade>(child.grade);
  const [saved, setSaved] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const field = "min-h-12 w-full rounded-xl border-2 border-line bg-surface px-3 focus:border-brand focus:outline-none";

  return (
    <Card className="mt-6">
      <H2>Settings</H2>
      <form
        className="mt-4 grid gap-4 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          store.setChild({ name: name.trim(), grade });
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        }}
      >
        <label className="grid gap-1 text-sm font-semibold">
          Child&apos;s name
          <input className={field} value={name} maxLength={30} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          Grade
          <select className={field} value={grade} onChange={(e) => setGrade(e.target.value as Grade)}>
            {(Object.keys(GRADE_LABEL) as Grade[]).map((g) => (
              <option key={g} value={g}>
                {GRADE_LABEL[g]}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-center gap-3 sm:col-span-2">
          <Button type="submit" variant="secondary">Save</Button>
          {saved && <span role="status" className="text-brand-strong">Saved</span>}
        </div>
      </form>

      <div className="mt-6 border-t border-line pt-5">
        <label className="grid max-w-xs gap-1 text-sm font-semibold">
          Reminder time
          <input
            type="time"
            className={field}
            value={state.reminderTime}
            onChange={(e) => e.target.value && store.setReminderTime(e.target.value)}
          />
        </label>
        <Button variant="secondary" className="mt-3" onClick={() => downloadReminderIcs(state.reminderTime, child.name)}>
          Add a nightly reminder to my calendar
        </Button>
      </div>

      <div className="mt-6 border-t border-line pt-5">
        <p className="font-semibold">Subscription</p>
        {state.pro ? (
          confirmCancel ? (
            <div className="mt-2 rounded-2xl bg-paper p-4">
              <p>Cancel {child.name}&apos;s plan? Your history stays on this device.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    store.setPro(false);
                    setConfirmCancel(false);
                  }}
                >
                  Yes, cancel
                </Button>
                <Button variant="ghost" onClick={() => setConfirmCancel(false)}>Keep my plan</Button>
              </div>
            </div>
          ) : (
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <p className="text-ink-soft">Active.</p>
              <Button variant="ghost" onClick={() => setConfirmCancel(true)}>Cancel subscription</Button>
            </div>
          )
        ) : (
          <p className="mt-1 text-ink-soft">
            {state.demo ? "Example mode: everything is unlocked so you can look around." : "Free plan."}
          </p>
        )}
      </div>

      <div className="mt-6 border-t border-line pt-5">
        <p className="font-semibold">{state.demo ? "Leave the example" : "Reset all data"}</p>
        {confirmReset ? (
          <div className="mt-2 rounded-2xl bg-accent-soft p-4">
            <p>
              {state.demo
                ? "This clears the example. Your own data is not affected."
                : `This deletes ${child.name}'s profile, history and settings from this device. It can't be undone.`}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                variant="accent"
                onClick={() => {
                  store.reset();
                  router.push("/");
                }}
              >
                {state.demo ? "Clear the example" : "Yes, delete everything"}
              </Button>
              <Button variant="ghost" onClick={() => setConfirmReset(false)}>Never mind</Button>
            </div>
          </div>
        ) : (
          <Button variant="ghost" className="!px-0" onClick={() => setConfirmReset(true)}>
            {state.demo ? "Clear the example…" : "Reset all data…"}
          </Button>
        )}
      </div>
    </Card>
  );
}
