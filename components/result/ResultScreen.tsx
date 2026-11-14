"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { classifyMiss, coreLexicon, extendLexicon, SKILLS, type Lexicon, type SessionRecord } from "@/lib/engine";
import { fetchLexicon } from "@/lib/client/api";
import { store, useStore, type AppState } from "@/lib/client/store";
import { ChildHeader } from "./ChildHeader";
import { Evidence } from "./Evidence";
import { buildModel } from "./model";
import { SayThis, TomorrowPlan } from "./PlanCards";
import { SideCards } from "./SideCards";
import { SimulateOverlay } from "./SimulateOverlay";
import { NoPatternHero, WeakSpotHero } from "./WeakSpotHero";

const GRID2 = "grid grid-cols-[repeat(auto-fit,minmax(min(440px,100%),1fr))] gap-5";

function latestCheck(sessions: SessionRecord[]): SessionRecord | undefined {
  return [...sessions].reverse().find((s) => s.kind === "check");
}

function StepNav({ name, demo }: { name: string; demo: boolean }) {
  const steps = ["Read", `What ${name} said`, "Results"];
  return (
    <nav aria-label="Check progress" className="mx-auto flex w-full max-w-[1120px] flex-wrap items-center gap-x-5 gap-y-2.5 px-6 pt-4">
      <ol className="flex flex-[1_1_280px] gap-2">
        {steps.map((s, i) => (
          <li key={s} className="min-w-0 flex-1" aria-current={i === steps.length - 1 ? "step" : undefined}>
            <div aria-hidden="true" className="h-2 rounded-full bg-indigo" />
            <div className="mt-1.5 truncate text-xs font-black text-[#2B2290]">{s}</div>
          </li>
        ))}
      </ol>
      {demo && (
        <Link href="/start" className="flex-none text-sm font-extrabold text-indigo underline underline-offset-2">
          Start with my child
        </Link>
      )}
    </nav>
  );
}

function Frame({ state, children }: { state: AppState | null; children: ReactNode }) {
  return (
    <div className="@container min-h-screen bg-paper pb-12">
      <ChildHeader state={state} />
      {children}
    </div>
  );
}

export function ResultScreen() {
  const snap = useStore();
  const router = useRouter();
  const state = snap?.state ?? null;
  const check = state ? latestCheck(state.sessions) : undefined;
  const missing = state ? (!state.child ? "/start" : !check ? "/check" : null) : null;

  useEffect(() => {
    if (missing) router.replace(missing);
  }, [missing, router]);

  if (!state || !state.child || !check) {
    return (
      <Frame state={state}>
        <div className="mx-auto max-w-[1120px] px-6 pt-10" aria-busy="true">
          <div className="h-[340px] animate-pulse rounded-hero bg-sand" />
        </div>
      </Frame>
    );
  }

  return (
    <Frame state={state}>
      <Result state={state} name={state.child.name} check={check} />
    </Frame>
  );
}

function Result({ state, name, check }: { state: AppState; name: string; check: SessionRecord }) {
  const [lex, setLex] = useState<Lexicon | undefined>(undefined);
  const [sim, setSim] = useState(false);
  const model = useMemo(() => buildModel(check, state.sessions, name), [check, state.sessions, name]);
  const wordsKey = check.misses.map((m) => m.word).join(" ");

  useEffect(() => {
    let alive = true;
    const words = wordsKey.split(" ").filter(Boolean);
    if (!words.length) return;
    fetchLexicon(words).then((entries) => {
      if (alive && Object.keys(entries).length) setLex(extendLexicon(coreLexicon, entries));
    });
    return () => {
      alive = false;
    };
  }, [wordsKey]);

  const pick = (index: number, said: string | null) => {
    const misses = check.misses.slice();
    const word = misses[index].word;
    misses[index] = { word, said, skill: classifyMiss(word, said, lex) };
    store.putSession({ ...check, misses });
  };

  const closeSim = useCallback(() => setSim(false), []);
  const openSim = () => {
    window.scrollTo({ top: 0 });
    setSim(true);
  };

  const { summary, weak, plan } = model;
  const scripts = weak ? SKILLS[weak].scripts(name) : plan.scripts;

  return (
    <>
      <StepNav name={name} demo={state.demo} />
      <main className="mx-auto max-w-[1120px] px-6 pt-5">
        {weak ? (
          <WeakSpotHero
            name={name}
            weak={weak}
            weakCount={model.weakCount}
            total={summary.totalMisses}
            examples={model.examples}
            second={model.second}
          />
        ) : (
          <NoPatternHero name={name} totalWords={summary.totalWords} totalMisses={summary.totalMisses} />
        )}

        <div className={`mt-5 ${GRID2}`}>
          <SayThis scripts={scripts} />
          <TomorrowPlan plan={plan} pro={state.pro} />
        </div>

        <div className={`mt-5 items-start ${GRID2}`}>
          <Evidence
            key={check.id}
            name={name}
            demo={state.demo}
            groups={model.groups}
            initialSaid={check.misses.map((m) => m.said)}
            lex={lex}
            onPick={pick}
          />
          <SideCards name={name} pro={state.pro} demo={state.demo} onSimulate={openSim} />
        </div>

        <p className="mt-7 text-[13px] font-bold leading-[1.6] text-ink-3">
          Readly is a coaching tool, not a medical or dyslexia test. If you&apos;re worried, talk to {name}&apos;s teacher.
        </p>
      </main>
      {sim && <SimulateOverlay name={name} onClose={closeSim} />}
    </>
  );
}
