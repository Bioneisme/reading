"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { QUIZ_SIGNS, type Grade } from "@/lib/engine";
import { store, useStore } from "@/lib/client/store";
import { GRADE_LABEL } from "@/lib/client/progress";
import { Shell } from "@/components/Shell";
import { Button, H1, Loading, ProgressBar } from "@/components/ui";

const EVENINGS = ["Easy", "Some frustration", "Tears or avoidance"];
const MINUTES = [5, 10, 15];
const GOALS = ["Read on their own", "Catch up with the class", "Less stress at bedtime"];
const TOTAL = 6;

function Option({
  selected,
  onClick,
  children,
  multi = false,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  multi?: boolean;
}) {
  return (
    <button
      type="button"
      role={multi ? "checkbox" : "radio"}
      aria-checked={selected}
      onClick={onClick}
      className={`flex min-h-14 w-full items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left text-lg transition-colors ${
        selected ? "border-brand bg-brand-soft font-semibold" : "border-line bg-surface hover:border-brand/50"
      }`}
    >
      <span
        aria-hidden
        className={`flex h-6 w-6 shrink-0 items-center justify-center border-2 text-sm ${multi ? "rounded-md" : "rounded-full"} ${
          selected ? "border-brand bg-brand text-white" : "border-ink-soft/40"
        }`}
      >
        {selected ? "✓" : ""}
      </span>
      {children}
    </button>
  );
}

export default function QuizPage() {
  const snap = useStore();
  if (!snap) return <Shell nav={false}><Loading /></Shell>;
  return <Quiz initialName={snap.real.child?.name ?? ""} initialGrade={snap.real.child?.grade ?? null} />;
}

function Quiz({ initialName, initialGrade }: { initialName: string; initialGrade: Grade | null }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(initialName);
  const [grade, setGrade] = useState<Grade | null>(initialGrade);
  const [signs, setSigns] = useState<string[]>([]);
  const [evenings, setEvenings] = useState<string | null>(null);
  const [minutes, setMinutes] = useState<number | null>(null);
  const [goal, setGoal] = useState<string | null>(null);

  const kid = name.trim() || "your child";
  const next = () => setStep((s) => Math.min(TOTAL - 1, s + 1));
  const back = () => (step === 0 ? router.push("/") : setStep((s) => s - 1));

  const finish = (g: string) => {
    setGoal(g);
    store.finishQuiz(
      { name: name.trim(), grade: grade ?? "1" },
      { signs, evenings: evenings ?? "", minutes: minutes ?? 10, goal: g },
    );
    router.push("/start/profile");
  };

  const pick = <T,>(set: (v: T) => void, v: T) => {
    set(v);
    setTimeout(next, 180);
  };

  const toggleSign = (id: string) => {
    setSigns((cur) => {
      if (id === "unsure") return cur.includes("unsure") ? [] : ["unsure"];
      const without = cur.filter((x) => x !== "unsure");
      return without.includes(id) ? without.filter((x) => x !== id) : [...without, id];
    });
  };

  let title: ReactNode;
  let body: ReactNode;
  let canNext = true;
  let showNext = false;

  switch (step) {
    case 0:
      title = "What's your child's first name?";
      canNext = name.trim().length > 0;
      showNext = true;
      body = (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (canNext) next();
          }}
        >
          <label htmlFor="child-name" className="sr-only">
            Child&apos;s first name
          </label>
          <input
            id="child-name"
            autoFocus
            value={name}
            maxLength={30}
            onChange={(e) => setName(e.target.value)}
            placeholder="First name"
            autoComplete="off"
            className="min-h-14 w-full rounded-2xl border-2 border-line bg-surface px-4 text-xl focus:border-brand focus:outline-none"
          />
          <p className="mt-2 text-sm text-ink-soft">Only used on this device, to personalize the plan.</p>
        </form>
      );
      break;
    case 1:
      title = `What grade is ${kid} in?`;
      body = (
        <div role="radiogroup" aria-label="Grade" className="grid gap-3">
          {(Object.keys(GRADE_LABEL) as Grade[]).map((g) => (
            <Option key={g} selected={grade === g} onClick={() => pick(setGrade, g)}>
              {GRADE_LABEL[g]}
            </Option>
          ))}
        </div>
      );
      canNext = grade !== null;
      showNext = grade !== null;
      break;
    case 2:
      title = `Which of these have you heard when ${kid} reads?`;
      showNext = true;
      body = (
        <div className="grid gap-3">
          <p className="-mt-2 mb-1 text-ink-soft">Pick all that apply.</p>
          {QUIZ_SIGNS.map((s) => (
            <Option key={s.id} multi selected={signs.includes(s.id)} onClick={() => toggleSign(s.id)}>
              {s.label}
            </Option>
          ))}
        </div>
      );
      break;
    case 3:
      title = "How do reading evenings usually go?";
      showNext = evenings !== null;
      body = (
        <div role="radiogroup" aria-label="Reading evenings" className="grid gap-3">
          {EVENINGS.map((o) => (
            <Option key={o} selected={evenings === o} onClick={() => pick(setEvenings, o)}>
              {o}
            </Option>
          ))}
        </div>
      );
      break;
    case 4:
      title = "How many minutes can you do most nights?";
      showNext = minutes !== null;
      body = (
        <div role="radiogroup" aria-label="Minutes per night" className="grid gap-3">
          {MINUTES.map((o) => (
            <Option key={o} selected={minutes === o} onClick={() => pick(setMinutes, o)}>
              {o} minutes
            </Option>
          ))}
        </div>
      );
      break;
    default:
      title = "What's your goal?";
      body = (
        <div role="radiogroup" aria-label="Goal" className="grid gap-3">
          {GOALS.map((o) => (
            <Option key={o} selected={goal === o} onClick={() => finish(o)}>
              {o}
            </Option>
          ))}
        </div>
      );
  }

  return (
    <Shell nav={false} width="max-w-xl">
      <div className="mb-8">
        <div className="mb-2 flex justify-between text-sm font-semibold text-ink-soft">
          <span>
            Question {step + 1} of {TOTAL}
          </span>
        </div>
        <ProgressBar value={(step + 1) / TOTAL} label="Quiz progress" />
      </div>
      <H1 className="mb-6">{title}</H1>
      {body}
      <div className="mt-8 flex gap-3">
        <Button variant="secondary" onClick={back}>
          Back
        </Button>
        {showNext && (
          <Button onClick={next} disabled={!canNext}>
            Next
          </Button>
        )}
      </div>
    </Shell>
  );
}
