"use client";

import { useEffect, useMemo, useState } from "react";
import {
  allowedSkills,
  analyzeWord,
  buildPlan,
  computeProfile,
  getStory,
  normalizeWord,
  SKILLS,
  storyForSkill,
  tokenize,
  type Miss,
  type Plan,
  type Profile,
  type SessionRecord,
  type SkillId,
  type Story,
  type StoryToken,
} from "@/lib/engine";
import { generateStory } from "@/lib/client/api";
import { store, useStore, type AppState } from "@/lib/client/store";
import { nextDay, plural, streak } from "@/lib/client/progress";
import { Shell } from "@/components/Shell";
import { MarkedCount, TappableText, WordTile } from "@/components/TappableText";
import { answerToMiss, MisreadingFlow, type Answer } from "@/components/MisreadingPicker";
import { STATUS_LABEL } from "@/components/SkillMap";
import { Button, Card, Eyebrow, H1, H2, LinkButton, Loading, LockIcon } from "@/components/ui";

export default function SessionPage() {
  const snap = useStore();
  if (!snap) return <Shell><Loading /></Shell>;
  const { state } = snap;
  if (!state.child || state.sessions.length === 0) {
    return (
      <Shell>
        <H1>Start with a reading check</H1>
        <p className="mt-3 text-ink-soft">Nightly sessions are built from the first 3-minute check.</p>
        <LinkButton href={state.child ? "/check" : "/start"} className="mt-6">
          {state.child ? "Start tonight's check" : "Start with my child"}
        </LinkButton>
      </Shell>
    );
  }
  if (!state.pro && !state.demo) {
    return (
      <Shell width="max-w-xl">
        <Card className="text-center">
          <LockIcon className="mx-auto h-6 w-6 text-brand" />
          <H1 className="mt-3">Nightly sessions are part of the plan</H1>
          <p className="mt-3 text-ink-soft">
            Word pairs, a word list and a practice story built from {state.child.name}&apos;s misses, every night.
          </p>
          <LinkButton href="/plans" variant="accent" className="mt-6">
            Unlock {state.child.name}&apos;s 28-day plan
          </LinkButton>
        </Card>
      </Shell>
    );
  }
  return <Session state={state} />;
}

const STEPS = ["Warm-up", "Word list", "Story", "Summary"];

function guessSkill(word: string, focus: SkillId): SkillId | "other" {
  try {
    const a = analyzeWord(word);
    if (!a) return "other";
    if (a.practices.includes(focus) || a.skills.includes(focus)) return focus;
    if (a.tricky) return "tricky";
    return a.practices[0] ?? a.skills[0] ?? "other";
  } catch {
    return "other";
  }
}

function libraryStory(plan: Plan): Story {
  return getStory(plan.story.id) ?? storyForSkill(plan.focus);
}

function Session({ state }: { state: AppState }) {
  const child = state.child!;
  const [initial] = useState(() => {
    const profile = computeProfile(state.sessions);
    const plan = buildPlan(profile, child.name);
    return { profile, plan, sessions: state.sessions };
  });
  const { plan, profile } = initial;

  const [step, setStep] = useState(0);
  const [saying, setSaying] = useState(false);
  const [marks, setMarks] = useState<Set<string>>(new Set());
  const [answers, setAnswers] = useState<Record<string, Answer | undefined>>({});
  const [story, setStory] = useState<Story | null>(null);
  const [serverTokens, setServerTokens] = useState<StoryToken[] | null>(null);
  const [saved, setSaved] = useState<SessionRecord | null>(null);

  useEffect(() => {
    let alive = true;
    const allowed = (() => {
      try {
        return allowedSkills(profile);
      } catch {
        return [plan.focus];
      }
    })();
    generateStory({ focus: plan.focus, allowed, childName: child.name }, { timeoutMs: 45000 })
      .then(({ story: s, tokens }) => {
        if (!alive) return;
        if (s.text.trim()) {
          setServerTokens(tokens);
          setStory(s);
        } else setStory(libraryStory(plan));
      })
      .catch(() => alive && setStory(libraryStory(plan)));
    return () => {
      alive = false;
    };
  }, [plan, profile, child.name]);

  const storyTokens = useMemo(
    () => (story ? (serverTokens ?? tokenize(story.text)) : []),
    [story, serverTokens],
  );

  const toggle = (key: string) =>
    setMarks((cur) => {
      const n = new Set(cur);
      if (n.has(key)) n.delete(key);
      else n.add(key);
      return n;
    });

  const markedWords = useMemo(() => {
    const out: { key: string; word: string; display: string }[] = [];
    plan.pairs.forEach((p, i) =>
      p.forEach((w, j) => {
        const k = `p:${i}:${j}`;
        if (marks.has(k)) out.push({ key: k, word: normalizeWord(w), display: w });
      }),
    );
    plan.wordList.forEach((w, i) => {
      const k = `l:${i}`;
      if (marks.has(k)) out.push({ key: k, word: normalizeWord(w), display: w });
    });
    storyTokens.forEach((t, i) => {
      const k = `s:${i}`;
      if (t.word && marks.has(k)) out.push({ key: k, word: t.word, display: t.text });
    });
    return out;
  }, [marks, plan, storyTokens]);

  const countFor = (prefix: string) => Array.from(marks).filter((k) => k.startsWith(prefix)).length;

  const save = () => {
    if (saved) return;
    const words = [
      ...plan.pairs.flat().map(normalizeWord),
      ...plan.wordList.map(normalizeWord),
      ...storyTokens.filter((t) => t.word).map((t) => t.word as string),
    ];
    const misses: Miss[] = markedWords.map((m) => {
      const a = answers[m.key];
      return a ? answerToMiss(m.word, a) : { word: m.word, said: null, skill: guessSkill(m.word, plan.focus) };
    });
    const latest = store.get().state.sessions;
    const rec: SessionRecord = {
      id: store.newId(),
      date: new Date().toISOString(),
      day: nextDay(latest),
      kind: "nightly",
      focus: plan.focus,
      words,
      misses,
    };
    store.addSession(rec);
    setSaved(rec);
    setSaying(false);
    setStep(3);
    window.scrollTo({ top: 0 });
  };

  const goto = (s: number) => {
    setStep(s);
    window.scrollTo({ top: 0 });
  };

  const header = (
    <div className="print:hidden">
      <Eyebrow>
        Tonight · {SKILLS[plan.focus].name} · round {plan.round}
      </Eyebrow>
      <ol className="mt-3 flex gap-1.5" aria-label="Session steps">
        {STEPS.map((s, i) => (
          <li key={s} className="flex-1" aria-current={i === step ? "step" : undefined}>
            <div className={`h-2 rounded-full ${i <= step ? "bg-brand" : "bg-brand-soft"}`} />
            <p className={`mt-1.5 text-xs font-semibold sm:text-sm ${i === step ? "text-ink" : "text-ink-soft"}`}>
              {i < step ? "✓ " : ""}
              {s}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );

  if (step === 3 && saved) {
    return (
      <Shell width="max-w-2xl">
        {header}
        <Summary state={state} rec={saved} before={initial.sessions} beforeProfile={profile} />
      </Shell>
    );
  }

  if (saying) {
    return (
      <Shell width="max-w-2xl">
        {header}
        <H1 className="mt-6 mb-2">What did {child.name} say?</H1>
        <p className="mb-5 text-ink-soft">Optional, but it makes tomorrow&apos;s plan sharper.</p>
        <Card>
          <MisreadingFlow
            words={markedWords}
            childName={child.name}
            answers={answers}
            onAnswer={(k, a) => setAnswers((cur) => ({ ...cur, [k]: a }))}
            onFinish={save}
            finishLabel="Finish tonight"
            onBack={() => setSaying(false)}
          />
        </Card>
        <Button variant="ghost" className="mt-4 !px-0" onClick={save}>
          Skip this and finish
        </Button>
      </Shell>
    );
  }

  return (
    <Shell width="max-w-3xl">
      {header}

      {step === 0 && (
        <section className="mt-6">
          <H2>Warm-up: word pairs</H2>
          <p className="mt-1 text-ink-soft">
            About 2 minutes. {child.name} reads each pair. Tap any word they miss.
          </p>
          <ul className="mt-5 grid gap-3">
            {plan.pairs.map((p, i) => (
              <li key={i} className="flex flex-wrap items-center gap-3">
                {p.map((w, j) => (
                  <WordTile key={j} word={w} marked={marks.has(`p:${i}:${j}`)} onToggle={() => toggle(`p:${i}:${j}`)} />
                ))}
              </li>
            ))}
          </ul>
          <Footer count={countFor("p:")} onBack={null} onNext={() => goto(1)} nextLabel="Next: word list →" />
        </section>
      )}

      {step === 1 && (
        <section className="mt-6">
          <H2>Word list</H2>
          <p className="mt-1 text-ink-soft">About 3 minutes. Tap any word {child.name} misses.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            {plan.wordList.map((w, i) => (
              <WordTile key={i} word={w} marked={marks.has(`l:${i}`)} onToggle={() => toggle(`l:${i}`)} />
            ))}
          </div>
          <Footer count={countFor("l:")} onBack={() => goto(0)} onNext={() => goto(2)} nextLabel="Next: story →" />
        </section>
      )}

      {step === 2 && (
        <section className="mt-6">
          {!story ? (
            <Loading label="Getting tonight's story ready…" />
          ) : (
            <>
              <Card className="print-area">
                <h2 className="mb-4 font-display text-2xl font-semibold">{story.title}</h2>
                <TappableText
                  tokens={storyTokens}
                  marked={new Set(Array.from(marks).filter((k) => k.startsWith("s:")).map((k) => Number(k.slice(2))))}
                  onToggle={(i) => toggle(`s:${i}`)}
                />
              </Card>
              <p className="mt-3 text-sm text-ink-soft print:hidden">
                About 5 minutes. Every word in this story was checked to be readable for {child.name}.
              </p>
              <Footer
                count={countFor("s:")}
                onBack={() => goto(1)}
                onNext={() => {
                  if (markedWords.length) {
                    setSaying(true);
                    window.scrollTo({ top: 0 });
                  } else save();
                }}
                nextLabel="Done reading →"
              />
            </>
          )}
        </section>
      )}
    </Shell>
  );
}

function Footer({
  count,
  onBack,
  onNext,
  nextLabel,
}: {
  count: number;
  onBack: (() => void) | null;
  onNext: () => void;
  nextLabel: string;
}) {
  return (
    <div className="sticky bottom-0 z-10 -mx-4 mt-6 border-t border-line bg-paper/95 px-4 py-3 backdrop-blur print:hidden">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <MarkedCount n={count} />
        <div className="flex gap-2">
          {onBack && (
            <Button variant="secondary" onClick={onBack}>
              Back
            </Button>
          )}
          <Button onClick={onNext}>{nextLabel}</Button>
        </div>
      </div>
    </div>
  );
}

function Summary({
  state,
  rec,
  before,
  beforeProfile,
}: {
  state: AppState;
  rec: SessionRecord;
  before: SessionRecord[];
  beforeProfile: Profile;
}) {
  const child = state.child!;
  const after = useMemo(() => computeProfile([...before, rec]), [before, rec]);
  const last = before[before.length - 1];
  const tonight = rec.misses.length;
  const prev = last ? last.misses.length : null;
  const focus = rec.focus!;
  const statusBefore = beforeProfile.skills[focus]?.status ?? "notChecked";
  const statusAfter = after.skills[focus]?.status ?? "notChecked";
  const nights = streak([...before, rec], state.demo);

  return (
    <section className="mt-6">
      <H1>{tonight === 0 ? `No misses tonight — well done, ${child.name}!` : `Nice work tonight, ${child.name}`}</H1>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Card className="!p-5">
          <p className="text-sm text-ink-soft">Tonight</p>
          <p className="font-display text-3xl font-semibold">{plural(tonight, "miss", "misses")}</p>
          {prev !== null && (
            <p className="mt-1 text-sm text-ink-soft">
              {tonight < prev ? `↓ down from ${prev}` : tonight === prev ? `same as last time (${prev})` : `last time: ${prev}`}
            </p>
          )}
        </Card>
        <Card className="!p-5">
          <p className="text-sm text-ink-soft">{SKILLS[focus].name}</p>
          <p className="font-display text-2xl font-semibold">{STATUS_LABEL[statusAfter]}</p>
          <p className="mt-1 text-sm text-ink-soft">
            {statusBefore === statusAfter ? "No change in status yet" : `was: ${STATUS_LABEL[statusBefore]}`}
          </p>
        </Card>
        <Card className="!p-5">
          <p className="text-sm text-ink-soft">Streak</p>
          <p className="font-display text-3xl font-semibold">
            <span aria-hidden>🔥 </span>
            {nights}
          </p>
          <p className="mt-1 text-sm text-ink-soft">{nights === 1 ? "night" : "nights in a row"}</p>
        </Card>
      </div>

      <Card className="mt-6 border-brand/30 bg-brand-soft">
        <p className="text-sm font-semibold tracking-wide text-brand-strong uppercase">Tomorrow</p>
        <p className="mt-1 font-display text-2xl font-semibold">
          {SKILLS[after.focus].name} — round {after.round}
        </p>
        <p className="mt-2 text-ink-soft">“{SKILLS[after.focus].scripts(child.name)[0]}”</p>
      </Card>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <LinkButton href="/journal">Back to the journal</LinkButton>
      </div>
    </section>
  );
}
