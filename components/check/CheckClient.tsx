"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  coreLexicon,
  extendLexicon,
  passageForGrade,
  wordsOf,
  type Grade,
  type Miss,
  type SessionRecord,
} from "@/lib/engine";
import { store, useStore, type Child } from "@/lib/client/store";
import { fetchLexicon } from "@/lib/client/api";
import { GRADE_LABEL, nextDay } from "@/lib/client/progress";
import { DEMO_DAY1_PICKS } from "@/lib/demo";
import { AppHeader, ChildChip, Icon, buttonClass } from "@/components/kit";
import { SaidPicker } from "@/components/reading/SaidPicker";
import { StepFooter, type FooterCta } from "@/components/reading/StepFooter";
import { passageUnits, sentenceAround } from "@/components/reading/words";
import { CheckProgress } from "./CheckProgress";
import { IntroPhase, type ReadMode } from "./IntroPhase";
import { NoMissPhase } from "./NoMissPhase";
import { OwnTextPhase, ownStatus } from "./OwnTextPhase";
import { PrintSheet } from "./PrintSheet";
import { ReadingPhase } from "./ReadingPhase";

type Phase = "intro" | "own" | "reading" | "said" | "nomiss";

const HARDER: Record<Grade, Grade | null> = {
  K: "1",
  "1": "2",
  "2": "3",
  "3": null,
};

function demoMarks(text: string): {
  marked: Set<number>;
  picks: Map<number, string>;
} {
  const units = passageUnits(text);
  const marked = new Set<number>();
  const picks = new Map<number, string>();
  for (const p of DEMO_DAY1_PICKS) {
    const u = units.find((x) => x.word === p.word && !marked.has(x.index));
    if (!u) continue;
    marked.add(u.index);
    picks.set(u.index, p.said);
  }
  return { marked, picks };
}

function NoChild() {
  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      <AppHeader />
      <main className="mx-auto w-full max-w-[680px] flex-[1_0_auto] px-6 pb-10 pt-12">
        <h1 className="text-[30px] font-black leading-[1.1] tracking-[-0.02em] md:text-[40px]">
          First, a few quick questions
        </h1>
        <p className="mt-3 text-lg font-semibold leading-normal text-ink-2">
          Six questions about your child, about one minute. Then tonight&apos;s
          check, written for their grade.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/start" className={buttonClass("primary", "lg")}>
            Start with my child
            <Icon name="next" size={18} strokeWidth={2.4} />
          </Link>
          <button
            type="button"
            onClick={() => store.startDemo()}
            className={buttonClass("secondary", "lg")}
          >
            See an example first
          </button>
        </div>
      </main>
    </div>
  );
}

export function CheckClient() {
  const snap = useStore();
  if (!snap) return <div className="min-h-dvh bg-paper" />;
  const child = snap.state.child;
  if (!child) return <NoChild />;
  const demo = snap.mode === "demo";
  return (
    <Check
      key={`${snap.mode}-${child.name}-${child.grade}`}
      child={child}
      demo={demo}
    />
  );
}

function Check({ child, demo }: { child: Child; demo: boolean }) {
  const router = useRouter();
  const name = child.name;
  const [phase, setPhase] = useState<Phase>(demo ? "reading" : "intro");
  const [mode, setMode] = useState<ReadMode>("screen");
  const [src, setSrc] = useState<"passage" | "own">("passage");
  const [grade, setGrade] = useState<Grade>(child.grade);
  const [ownText, setOwnText] = useState("");
  const [entries, setEntries] = useState<Record<string, string[]>>({});
  const [busy, setBusy] = useState(false);
  const asked = useRef(new Set<string>());

  const passage = passageForGrade(grade);
  const text = src === "own" ? ownText : passage.text;
  const units = useMemo(() => passageUnits(text), [text]);
  const demoSeed = useMemo(
    () => (demo ? demoMarks(passage.text) : null),
    [demo, passage.text],
  );
  const [marked, setMarked] = useState<Set<number>>(
    () => new Set(demoSeed?.marked ?? []),
  );
  const lex = useMemo(
    () =>
      Object.keys(entries).length
        ? extendLexicon(coreLexicon, entries)
        : coreLexicon,
    [entries],
  );
  const ownCount = useMemo(() => wordsOf(ownText).length, [ownText]);
  const ownOk = ownStatus(ownCount).ok;
  const usingDemoMarks = demo && src === "passage" && grade === child.grade;

  useEffect(() => {
    if (phase !== "own") return;
    const missing = [...new Set(wordsOf(ownText))].filter(
      (w) => !coreLexicon.get(w) && !asked.current.has(w),
    );
    if (!missing.length) return;
    const id = setTimeout(() => {
      missing.forEach((w) => asked.current.add(w));
      fetchLexicon(missing).then((e) => {
        if (Object.keys(e).length) setEntries((prev) => ({ ...prev, ...e }));
      });
    }, 700);
    return () => clearTimeout(id);
  }, [ownText, phase]);

  const goto = (p: Phase) => {
    setPhase(p);
    window.scrollTo({ top: 0 });
  };

  const toggle = (i: number) =>
    setMarked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  const save = (misses: Miss[]) => {
    const s = store.get().state;
    const onlyChecks = s.sessions.every((x) => x.kind === "check");
    const rec: SessionRecord = {
      id: store.newId(),
      date: new Date().toISOString(),
      day: onlyChecks ? 1 : nextDay(s.sessions),
      kind: "check",
      words: wordsOf(text),
      misses,
    };
    if (onlyChecks) store.setSessions([rec]);
    else store.addSession(rec);
  };

  const useOwn = async () => {
    if (!ownOk || busy) return;
    const missing = [...new Set(wordsOf(ownText))].filter(
      (w) => !coreLexicon.get(w) && !entries[w],
    );
    if (missing.length) {
      setBusy(true);
      const e = await fetchLexicon(missing);
      missing.forEach((w) => asked.current.add(w));
      if (Object.keys(e).length) setEntries((prev) => ({ ...prev, ...e }));
      setBusy(false);
    }
    setSrc("own");
    setMarked(new Set());
    goto("reading");
  };

  const print = () => {
    window.print();
  };

  const items = useMemo(
    () =>
      [...marked]
        .filter((i) => i < units.length)
        .sort((a, b) => a - b)
        .map((i) => ({
          word: units[i].text,
          context: sentenceAround(text, i),
          preset: usingDemoMarks ? (demoSeed?.picks.get(i) ?? null) : null,
        })),
    [marked, units, text, usingDemoMarks, demoSeed],
  );

  const gradeText = GRADE_LABEL[grade];
  const harder = HARDER[grade];
  const words = units.length;
  const sample = passageUnits(passage.text)
    .slice(0, 5)
    .map((u) => u.pre + u.text + u.post)
    .join(" ");

  let back: { label: string; onClick: () => void; desktopOnly?: boolean } | null = null;
  let hint = "";
  let cta: FooterCta | null = null;

  if (phase === "intro") {
    hint =
      mode === "paper"
        ? `Print one page, then tap words here while ${name} reads.`
        : `You will tap words on this screen while ${name} reads.`;
    cta =
      mode === "paper"
        ? {
            label: "Print the text",
            onClick: () => {
              print();
              goto("reading");
            },
          }
        : { label: "Show the text", onClick: () => goto("reading") };
  } else if (phase === "own") {
    hint = ownOk
      ? `${name} reads it, you tap — same as always.`
      : "Aim for 20–80 words.";
    cta = {
      label: busy ? "Checking words…" : "Use this text",
      onClick: useOwn,
      disabled: !ownOk || busy,
    };
  } else if (phase === "reading") {
    back = { label: "Before reading", onClick: () => goto("intro"), desktopOnly: true };
    hint =
      marked.size > 0
        ? `Next: pick what ${name} said for each marked word.`
        : "No misses? That is great — tap Done reading.";
    cta = {
      label: "Done reading",
      onClick: () => {
        if (marked.size > 0) goto("said");
        else {
          save([]);
          goto("nomiss");
        }
      },
    };
  } else if (phase === "nomiss") {
    if (harder) {
      back = {
        label: "Done for tonight",
        onClick: () => router.push("/result"),
      };
      hint = "Tomorrow starts with a harder text.";
      cta = {
        label: "Try a harder text now",
        onClick: () => {
          setSrc("passage");
          setGrade(harder);
          setMarked(new Set());
          goto("reading");
        },
      };
    } else {
      hint = "Tomorrow starts with a longer text.";
      cta = { label: "See results", href: "/result" };
    }
  }

  const lead =
    src === "own"
      ? `Tonight's check uses ${words} words from ${name}'s own book.`
      : `Tonight's check takes about 3 minutes: one short text, ${words} words, written for ${gradeText}.`;
  const tomorrow = harder
    ? `A slightly harder text: a ${GRADE_LABEL[harder]} story with more letter teams (sh, ch, th).`
    : "A longer story with more vowel teams and bossy r words.";
  const step = phase === "said" ? 1 : phase === "nomiss" ? 2 : 0;

  return (
    <div className="bg-paper text-ink">
      <div className="no-print flex min-h-dvh flex-col">
        <AppHeader
          right={<ChildChip name={name} grade={GRADE_LABEL[child.grade]} demo={demo} />}
        />
        <CheckProgress name={name} step={step} demo={demo} />

        {phase === "intro" && (
          <IntroPhase
            name={name}
            lead={lead}
            sample={sample}
            mode={mode}
            onMode={setMode}
            onOwn={() => goto("own")}
            ownActive={src === "own"}
          />
        )}
        {phase === "own" && (
          <OwnTextPhase
            name={name}
            text={ownText}
            onText={setOwnText}
            count={ownCount}
            lex={lex}
            onBack={() => {
              setSrc("passage");
              setMarked(
                new Set(
                  demo && grade === child.grade ? (demoSeed?.marked ?? []) : [],
                ),
              );
              goto("intro");
            }}
          />
        )}
        {phase === "reading" && (
          <ReadingPhase
            key={text}
            name={name}
            text={text}
            marked={marked}
            onToggle={toggle}
            onPrint={print}
            hint={
              usingDemoMarks
                ? "Example: 4 words are already marked. Tap any word to change it."
                : `Tap again to undo. Don’t correct ${name} while reading.`
            }
          />
        )}
        {phase === "said" && (
          <SaidPicker
            items={items}
            childName={name}
            lex={lex}
            demo={usingDemoMarks}
            onBack={() => goto("reading")}
            onDone={(misses) => {
              save(misses);
              router.push("/result");
            }}
          />
        )}
        {phase === "nomiss" && (
          <NoMissPhase name={name} words={words} tomorrow={tomorrow} />
        )}

        {phase !== "said" && <StepFooter back={back} hint={hint} cta={cta} />}
      </div>

      <PrintSheet
        name={name}
        grade={gradeText}
        text={text}
        words={words}
        own={src === "own"}
      />
    </div>
  );
}
