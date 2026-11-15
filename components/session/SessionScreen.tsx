"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  allowedSkills,
  analyzeWord,
  buildPlan,
  classifyMiss,
  computeProfile,
  getStory,
  normalizeWord,
  storyForSkill,
  validateStory,
  type Miss,
  type SessionRecord,
  type SkillId,
  type Story,
  type StoryToken,
} from "@/lib/engine";
import { STORY_NAMES } from "@/data/wordbank";
import { generateStory } from "@/lib/client/api";
import { store, useStore, type AppState } from "@/lib/client/store";
import { nextDay, plural } from "@/lib/client/progress";
import { SaidPicker } from "@/components/reading/SaidPicker";
import { StepFooter } from "@/components/reading/StepFooter";
import { passageUnits, sentenceAround } from "@/components/reading/words";
import { nightsInARow, sortSessions } from "@/components/journal/derive";
import { SKILL_SHORT } from "@/components/journal/skillCopy";
import { AnnotatedPassage, PracticeToggle } from "@/components/story/AnnotatedPassage";
import { storyTokens } from "@/components/story/annotate";
import { SayThis, SessionHeader, Stepper, StepMain, StepTitle, type StepId } from "./parts";
import { SessionSummary } from "./SessionSummary";
import { PairsGrid, StoryLoading, WordListGrid } from "./steps";

export function SessionScreen() {
  const snap = useStore();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!snap || ready) return;
    const s = snap.state;
    if (!s.child) router.replace("/start");
    else if (!s.demo && !s.pro) router.replace("/plans");
    else if (!s.sessions.length) router.replace("/check");
    else setReady(true);
  }, [snap, ready, router]);

  if (!snap || !ready || !snap.state.child) return <div className="min-h-screen bg-paper" aria-busy="true" />;
  return <Session state={snap.state} />;
}

function missFor(word: string, focus: SkillId): Miss {
  const w = normalizeWord(word);
  const practices = analyzeWord(w)?.practices ?? [];
  const skill = practices.includes(focus) ? focus : classifyMiss(w, null);
  return { word: w, said: null, skill };
}

function toggled<T>(set: ReadonlySet<T>, key: T): Set<T> {
  const next = new Set(set);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  return next;
}

type Ready = { story: Story; tokens: StoryToken[]; checked: boolean };

function Session({ state }: { state: AppState }) {
  const child = state.child!;
  const name = child.name;
  const [setup] = useState(() => {
    const before = sortSessions(state.sessions);
    const profile = computeProfile(before);
    const plan = buildPlan(profile, name);
    return { before, profile, plan, night: nextDay(before) };
  });
  const { before, profile, plan, night } = setup;
  const focusName = SKILL_SHORT[plan.focus];

  const [step, setStep] = useState<StepId>("pairs");
  const [pairMarks, setPairMarks] = useState<ReadonlySet<string>>(new Set());
  const [listMarks, setListMarks] = useState<ReadonlySet<number>>(new Set());
  const [storyMarks, setStoryMarks] = useState<ReadonlySet<number>>(new Set());
  const [labels, setLabels] = useState(false);
  const [ready, setReady] = useState<Ready | null>(null);
  const [saved, setSaved] = useState<SessionRecord | null>(null);
  const request = useRef<Promise<Ready> | null>(null);

  const allowed = useMemo(() => allowedSkills(profile), [profile]);
  const prepare = useMemo(() => {
    const names = [...STORY_NAMES, name];
    return (story: Story, server: StoryToken[] | null): Ready => ({
      story,
      tokens: storyTokens(story.text, server, allowed),
      checked: validateStory(story.text, [...allowed, plan.focus], { names }).ok,
    });
  }, [allowed, name, plan.focus]);

  const fallback = useMemo(
    (): Ready => prepare(getStory(plan.story.id) ?? storyForSkill(plan.focus), null),
    [plan, prepare],
  );

  useEffect(() => {
    let alive = true;
    if (!request.current) {
      request.current = generateStory({ focus: plan.focus, allowed, childName: name }, { timeoutMs: 45000 })
        .then(({ story, tokens }) => (story.text.trim() ? prepare(story, tokens) : fallback))
        .catch(() => fallback);
    }
    request.current.then((r) => {
      if (alive) setReady((cur) => cur ?? r);
    });
    return () => {
      alive = false;
    };
  }, [plan, allowed, name, fallback, prepare]);

  const units = useMemo(() => (ready ? passageUnits(ready.story.text) : []), [ready]);
  const storyWords = useMemo(() => units.map((u) => u.word), [units]);

  const go = (s: StepId) => {
    setStep(s);
    window.scrollTo({ top: 0 });
  };

  const save = (storyMisses: Miss[] | null) => {
    if (saved || !ready) return;
    const pairMisses = plan.pairs.flatMap((p, i) =>
      p.filter((_, j) => pairMarks.has(`${i}-${j}`)).map((w) => missFor(w, plan.focus)),
    );
    const listMisses = plan.wordList.filter((_, i) => listMarks.has(i)).map((w) => missFor(w, plan.focus));
    const marked = units.filter((u) => storyMarks.has(u.index));
    const fromStory = storyMisses ?? marked.map((u) => missFor(u.word, plan.focus));
    const rec: SessionRecord = {
      id: store.newId(),
      date: new Date().toISOString(),
      day: nextDay(store.get().state.sessions),
      kind: "nightly",
      focus: plan.focus,
      words: [...plan.pairs.flat().map(normalizeWord), ...plan.wordList.map(normalizeWord), ...storyWords],
      misses: [...pairMisses, ...listMisses, ...fromStory],
    };
    store.addSession(rec);
    setSaved(rec);
    go("summary");
  };

  const saidItems = useMemo(
    () =>
      ready
        ? units
            .filter((u) => storyMarks.has(u.index))
            .map((u) => ({ word: u.word, context: sentenceAround(ready.story.text, u.index) }))
        : [],
    [ready, units, storyMarks],
  );

  const marked = (n: number, minutes: number) => `${plural(n, "word")} marked · about ${minutes} minutes`;
  const stepTitle = `${focusName} — round ${plan.round}`;

  let body: ReactNode = null;
  let footer: ReactNode = null;

  if (step === "pairs") {
    body = (
      <StepMain>
        <StepTitle
          title="Warm-up: word pairs"
          sub={`${name} reads each pair out loud. Tap any word ${name} misses — tap again to undo.`}
        />
        <PairsGrid pairs={plan.pairs} marked={pairMarks} onToggle={(k) => setPairMarks((m) => toggled(m, k))} />
        <SayThis name={name} script={plan.scripts[0]} />
      </StepMain>
    );
    footer = <StepFooter hint={marked(pairMarks.size, 2)} cta={{ label: "Next: word list", onClick: () => go("list") }} />;
  } else if (step === "list") {
    body = (
      <StepMain>
        <StepTitle title="Word list" sub={`${name} reads down the list. Tap any word ${name} misses.`} />
        <WordListGrid words={plan.wordList} marked={listMarks} onToggle={(i) => setListMarks((m) => toggled(m, i))} />
        <SayThis name={name} script={plan.scripts[1]} />
      </StepMain>
    );
    footer = (
      <StepFooter
        hint={marked(listMarks.size, 3)}
        cta={{ label: "Next: tonight’s story", onClick: () => go("story") }}
      />
    );
  } else if (step === "story" && !ready) {
    body = <StoryLoading name={name} focus={focusName} word={plan.pairs[0]?.[1] ?? plan.wordList[0] ?? "read"} />;
    footer = (
      <StepFooter
        hint="If it takes too long, we open a ready-made story."
        cta={{ label: "Open the story", onClick: () => setReady(fallback) }}
      />
    );
  } else if (step === "story" && ready) {
    body = (
      <StepMain>
        <div className="flex flex-wrap items-end justify-between gap-x-5 gap-y-3.5">
          <div className="flex-[1_1_300px]">
            <div className="text-[13px] font-black uppercase tracking-[0.1em] text-indigo">Tonight&apos;s story</div>
            <h1 className="mt-1 font-read text-[clamp(34px,3.6vw,48px)] font-bold leading-[1.1]">{ready.story.title}</h1>
            <p className="mt-1.5 text-[15px] font-bold text-ink-2">
              {storyWords.length} words · built for {focusName}
              {ready.checked && " · every word checked"}
            </p>
          </div>
          <PracticeToggle on={labels} onChange={setLabels} />
        </div>
        <div className="mt-[18px] rounded-[28px] border-2 border-line bg-card p-[clamp(18px,3.2vw,40px)] shadow-edge">
          <AnnotatedPassage
            text={ready.story.text}
            tokens={ready.tokens}
            focus={plan.focus}
            labels={labels}
            size="session"
            marked={storyMarks}
            onToggle={(i) => setStoryMarks((m) => toggled(m, i))}
          />
        </div>
        <SayThis name={name} script={plan.scripts[2]} />
      </StepMain>
    );
    footer = (
      <StepFooter
        hint={marked(storyMarks.size, 5)}
        cta={{ label: "Done reading", onClick: () => (storyMarks.size ? go("said") : save(null)) }}
      />
    );
  } else if (step === "said" && ready) {
    body = (
      <>
        <div className="mx-auto w-full max-w-[780px] px-6 pt-5">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl bg-indigo-tint px-4 py-3 text-[15px] font-bold leading-normal text-ink-2">
            <span>Optional: it makes tomorrow&apos;s plan sharper.</span>
            <button
              type="button"
              onClick={() => save(null)}
              className="text-link inline-flex min-h-11 cursor-pointer items-center gap-1.5 font-extrabold text-indigo"
            >
              Skip and finish
            </button>
          </p>
        </div>
        <SaidPicker
          items={saidItems}
          childName={name}
          onDone={(misses) => save(misses)}
          onBack={() => go("story")}
          doneLabel="Finish tonight"
        />
      </>
    );
  } else if (step === "summary" && saved) {
    const run = nightsInARow([...before, saved], state.demo);
    body = (
      <SessionSummary
        before={before}
        rec={saved}
        storyWords={storyWords}
        name={name}
        demo={state.demo}
        beforeProfile={profile}
      />
    );
    footer = <StepFooter hint={`Streak updated: ${plural(run, "night")}.`} cta={{ label: `Back to ${name}’s journal`, href: "/journal" }} />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <SessionHeader name={name} night={saved?.day ?? night} demo={state.demo} />
      <Stepper title={stepTitle} step={step} />
      <div key={step === "story" && ready ? "story-ready" : step} className="flex flex-[1_0_auto] animate-rise flex-col">
        {body}
      </div>
      {footer}
    </div>
  );
}
