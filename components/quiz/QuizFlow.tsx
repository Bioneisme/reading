"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Grade } from "@/lib/engine";
import { store, type AppState } from "@/lib/client/store";
import { LearningPanel, type Fact } from "./LearningPanel";
import type { FooterCta } from "@/components/reading/StepFooter";
import { QuizShell } from "./QuizShell";
import { BuildingStep, EveningsStep, GoalStep, GradeStep, HeardStep, MinutesStep, NameStep } from "./steps";
import { SPOT, displayName, gradeLabel, pickedSkills, possessive } from "./copy";

interface Draft {
  name: string;
  grade: Grade | null;
  signs: string[];
  evenings: string | null;
  minutes: number | null;
  goal: string | null;
}

const BUILD_STEP = 6;

function draftFrom(real: AppState): Draft {
  return {
    name: real.child?.name ?? "",
    grade: real.child?.grade ?? null,
    signs: real.quiz?.signs ?? [],
    evenings: real.quiz?.evenings ?? null,
    minutes: real.quiz?.minutes ?? null,
    goal: real.quiz?.goal ?? null,
  };
}

function startStep(d: Draft): number {
  if (typeof window === "undefined") return 0;
  const n = Number(new URLSearchParams(window.location.search).get("step"));
  if (!Number.isInteger(n) || n < 1 || n > 6) return 0;
  const ok = [true, !!d.name.trim(), !!d.grade, d.signs.length > 0, !!d.evenings, d.minutes !== null];
  let s = 0;
  while (s < n - 1 && ok[s + 1]) s++;
  return s;
}

export function QuizFlow({ real }: { real: AppState }) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(() => draftFrom(real));
  const [step, setStep] = useState<number>(() => startStep(draftFrom(real)));
  const [t, setT] = useState(0);

  const name = displayName(draft.name);
  const poss = possessive(draft.name);
  const picked = pickedSkills(draft.signs);

  useEffect(() => {
    if (step !== BUILD_STEP) return;
    if (t >= 3) {
      const done = setTimeout(() => {
        if (!draft.grade || !draft.evenings || draft.minutes === null || !draft.goal) return;
        store.finishQuiz(
          { name: draft.name.trim(), grade: draft.grade },
          { signs: draft.signs, evenings: draft.evenings, minutes: draft.minutes, goal: draft.goal },
        );
        router.push("/start/profile");
      }, 450);
      return () => clearTimeout(done);
    }
    const id = setTimeout(() => setT((x) => x + 1), 700);
    return () => clearTimeout(id);
  }, [step, t, draft, router]);

  const patch = (p: Partial<Draft>, next?: number) => {
    setDraft((d) => ({ ...d, ...p }));
    if (next !== undefined) {
      if (next === BUILD_STEP) setT(0);
      setStep(next);
      if (typeof window !== "undefined") window.scrollTo({ top: 0 });
    }
  };

  const go = (s: number) => {
    setStep(s);
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  };

  const toggleSign = (id: string) =>
    setDraft((d) => {
      if (id === "unsure") return { ...d, signs: d.signs.includes("unsure") ? [] : ["unsure"] };
      const rest = d.signs.filter((s) => s !== "unsure");
      return { ...d, signs: rest.includes(id) ? rest.filter((s) => s !== id) : [...rest, id] };
    });

  const heardShort = picked.length
    ? picked.map((k) => (SPOT[k]?.name ?? k).split(":")[0]).join(", ")
    : draft.signs.includes("unsure")
      ? "Not sure yet"
      : null;

  const facts: Fact[] = [
    { k: "Name", v: draft.name.trim() || null },
    { k: "Grade", v: draft.grade ? gradeLabel(draft.grade) : null },
    { k: "You’ve heard", v: step >= 2 ? heardShort : null },
    { k: "Evenings", v: draft.evenings },
    { k: "Time", v: draft.minutes !== null ? `${draft.minutes} min a night` : null },
    { k: "Goal", v: draft.goal },
  ];

  const hasName = !!draft.name.trim();
  let hint = "Tap an answer to continue.";
  let cta: FooterCta | null = null;
  if (step === 0) {
    hint = hasName ? `Nice to meet you, ${name}.` : "Type a first name to continue.";
    cta = { label: "Continue", onClick: () => go(1), disabled: !hasName };
  } else if (step === 2) {
    const any = draft.signs.length > 0;
    hint = any
      ? picked.length
        ? `${picked.length} ${picked.length === 1 ? "skill" : "skills"} to check tonight.`
        : "Tonight’s check will show where to start."
      : "Pick at least one — or “Not sure yet”.";
    if (any) cta = { label: "Continue", onClick: () => go(3) };
  } else if (step === BUILD_STEP) {
    hint = t >= 3 ? "Done." : "Takes a couple of seconds.";
  }

  const gradeText = draft.grade ? gradeLabel(draft.grade) : "grade-level";
  const buildSteps = [
    "Matching what you’ve heard to 11 reading skills",
    `Choosing a ${gradeText} text for tonight`,
    `Fitting the plan into ${draft.minutes ?? 10} minutes a night`,
  ];
  const letters = (draft.name.trim().toLowerCase().replace(/[^a-z]/g, "") + "abc").slice(0, 3).split("");

  return (
    <QuizShell
      stepLabel={`${Math.min(step + 1, 6)} of 6`}
      done={Math.min(step + 1, 6)}
      onBack={step > 0 && step !== BUILD_STEP ? () => go(step - 1) : undefined}
      aside={<LearningPanel name={name} facts={facts} spots={picked} />}
      hint={hint}
      cta={cta}
    >
      <div key={step} className="animate-rise">
        {step === 0 && <NameStep name={draft.name} onName={(v) => patch({ name: v })} onSubmit={() => hasName && go(1)} />}
        {step === 1 && <GradeStep name={name} grade={draft.grade} onPick={(g) => patch({ grade: g }, 2)} />}
        {step === 2 && <HeardStep name={name} signs={draft.signs} onToggle={toggleSign} />}
        {step === 3 && <EveningsStep value={draft.evenings} onPick={(v) => patch({ evenings: v }, 4)} />}
        {step === 4 && <MinutesStep value={draft.minutes} onPick={(v) => patch({ minutes: v }, 5)} />}
        {step === 5 && <GoalStep name={name} value={draft.goal} onPick={(v) => patch({ goal: v }, BUILD_STEP)} />}
        {step === BUILD_STEP && <BuildingStep possessive={poss} letters={letters} steps={buildSteps} t={t} />}
      </div>
    </QuizShell>
  );
}
