"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { passageForGrade, tokenize, type Miss, type SessionRecord } from "@/lib/engine";
import { store, useStore, type AppState } from "@/lib/client/store";
import { DEMO_DAY1_PICKS } from "@/lib/demo";
import { GRADE_LABEL } from "@/lib/client/progress";
import { Shell } from "@/components/Shell";
import { MarkedCount, TappableText } from "@/components/TappableText";
import { answerToMiss, MisreadingFlow, type Answer } from "@/components/MisreadingPicker";
import { Button, Card, Eyebrow, H1, LinkButton, Loading } from "@/components/ui";

const DEMO_MARKS: Record<string, string> = Object.fromEntries(DEMO_DAY1_PICKS.map((p) => [p.word, p.said]));

export default function CheckPage() {
  const snap = useStore();
  if (!snap) return <Shell><Loading /></Shell>;
  const { state } = snap;
  if (!state.child) {
    return (
      <Shell>
        <H1>First, tell us about your child</H1>
        <p className="mt-3 text-ink-soft">Six quick questions, then tonight&apos;s check.</p>
        <LinkButton href="/start" className="mt-6">Start the quiz</LinkButton>
      </Shell>
    );
  }
  return <Check state={state} />;
}

type Phase = "intro" | "reading" | "said" | "none";

function Check({ state }: { state: AppState }) {
  const router = useRouter();
  const child = state.child!;
  const demo = state.demo;
  const passage = useMemo(() => passageForGrade(child.grade), [child.grade]);
  const tokens = useMemo(() => tokenize(passage.text), [passage.text]);

  const [phase, setPhase] = useState<Phase>(demo ? "reading" : "intro");
  const [marked, setMarked] = useState<Set<number>>(() => {
    if (!demo) return new Set();
    const s = new Set<number>();
    const seen = new Set<string>();
    tokens.forEach((t, i) => {
      if (t.word && DEMO_MARKS[t.word] && !seen.has(t.word)) {
        seen.add(t.word);
        s.add(i);
      }
    });
    return s;
  });
  const [answers, setAnswers] = useState<Record<string, Answer | undefined>>(() => {
    if (!demo) return {};
    const a: Record<string, Answer> = {};
    tokens.forEach((t, i) => {
      if (t.word && DEMO_MARKS[t.word]) a[String(i)] = { said: DEMO_MARKS[t.word] };
    });
    return a;
  });

  const toggle = (i: number) =>
    setMarked((cur) => {
      const n = new Set(cur);
      if (n.has(i)) n.delete(i);
      else n.add(i);
      return n;
    });

  const markedList = Array.from(marked)
    .sort((a, b) => a - b)
    .map((i) => ({ key: String(i), word: tokens[i].word!, display: tokens[i].text }));

  const save = (misses: Miss[]) => {
    const words = tokens.filter((t) => t.word).map((t) => t.word as string);
    const s = store.get().state;
    const onlyChecks = s.sessions.every((x) => x.kind === "check");
    const rec: SessionRecord = {
      id: store.newId(),
      date: new Date().toISOString(),
      day: onlyChecks ? 1 : Math.max(...s.sessions.map((x) => x.day)) + 1,
      kind: "check",
      words,
      misses,
    };
    if (onlyChecks) store.setSessions([rec]);
    else store.addSession(rec);
  };

  const finish = () => {
    save(markedList.map((m) => answerToMiss(m.word, answers[m.key] ?? { said: null })));
    router.push("/result");
  };

  const doneReading = () => {
    if (marked.size === 0) {
      save([]);
      setPhase("none");
    } else setPhase("said");
    window.scrollTo({ top: 0 });
  };

  const demoReady = demo && markedList.every((m) => answers[m.key] !== undefined) && markedList.length > 0;

  if (phase === "intro") {
    return (
      <Shell width="max-w-2xl">
        <Eyebrow>Tonight&apos;s check · {GRADE_LABEL[child.grade]}</Eyebrow>
        <H1 className="mt-2">Before {child.name} starts reading</H1>
        <ol className="mt-6 grid gap-3 text-lg">
          {[
            `Let ${child.name} read aloud, from the screen or a printout.`,
            "Don't correct during reading. Just listen.",
            "Tap any word they miss or stumble on. Tap again to unmark.",
          ].map((t, i) => (
            <li key={i} className="flex gap-3 rounded-2xl border border-line bg-surface p-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand font-semibold text-white">{i + 1}</span>
              {t}
            </li>
          ))}
        </ol>
        <p className="mt-4 text-ink-soft">It takes about 3 minutes. Afterwards you&apos;ll pick what {child.name} said for each marked word.</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button onClick={() => setPhase("reading")}>Read from the screen</Button>
          <Button
            variant="secondary"
            onClick={() => {
              setPhase("reading");
              setTimeout(() => window.print(), 100);
            }}
          >
            Print the text
          </Button>
        </div>
      </Shell>
    );
  }

  if (phase === "none") {
    return (
      <Shell width="max-w-2xl">
        <Card className="text-center">
          <p className="text-5xl" aria-hidden>🌟</p>
          <H1 className="mt-3">No misses tonight!</H1>
          <p className="mt-3 text-lg text-ink-soft">
            {child.name} read every word. That&apos;s a great sign. Tomorrow we&apos;ll try a harder text to find the next skill to work on.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <LinkButton href="/result">See tomorrow&apos;s plan</LinkButton>
            <Button variant="secondary" onClick={() => setPhase("reading")}>Back to the text</Button>
          </div>
        </Card>
      </Shell>
    );
  }

  if (phase === "said") {
    return (
      <Shell width="max-w-2xl">
        <Eyebrow>Almost done</Eyebrow>
        <H1 className="mt-2 mb-6">What did {child.name} say?</H1>
        <Card>
          <MisreadingFlow
            words={markedList}
            childName={child.name}
            answers={answers}
            onAnswer={(k, a) => setAnswers((cur) => ({ ...cur, [k]: a }))}
            onFinish={finish}
            finishLabel="See results"
            onBack={() => setPhase("reading")}
          />
        </Card>
        {demoReady && (
          <p className="mt-4 text-sm text-ink-soft">
            In this example the answers are already picked. You can change any of them, or{" "}
            <button type="button" onClick={finish} className="font-semibold text-brand-strong underline">
              go straight to results
            </button>
            .
          </p>
        )}
      </Shell>
    );
  }

  return (
    <Shell width="max-w-3xl">
      <div className="print:hidden">
        <Eyebrow>Tonight&apos;s check · {GRADE_LABEL[child.grade]}</Eyebrow>
        <p className="mt-2 text-lg text-ink-soft">
          {demo
            ? `We've marked the 4 words ${child.name} missed. Tap any word to change it, then tap Done reading.`
            : `Tap every word ${child.name} misses or stumbles on. Tap again to unmark.`}
        </p>
      </div>

      <Card className="print-area mt-5">
        <h1 className="print-only mb-6 font-display text-3xl font-semibold">{passage.title}</h1>
        <TappableText tokens={tokens} marked={marked} onToggle={toggle} />
      </Card>

      <div className="sticky bottom-0 z-10 -mx-4 mt-5 border-t border-line bg-paper/95 px-4 py-3 backdrop-blur print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <MarkedCount n={marked.size} />
          <div className="flex gap-2">
            <span className="hidden sm:block">
              <Button variant="secondary" onClick={() => window.print()}>
                Print
              </Button>
            </span>
            <Button onClick={doneReading}>Done reading →</Button>
          </div>
        </div>
        {demoReady && (
          <button type="button" onClick={finish} className="mt-2 text-sm font-semibold text-brand-strong underline">
            Skip ahead: see {child.name}&apos;s results now
          </button>
        )}
      </div>
      <button type="button" onClick={() => window.print()} className="mt-4 text-sm font-semibold text-brand-strong underline sm:hidden print:hidden">
        Print the text
      </button>
    </Shell>
  );
}
