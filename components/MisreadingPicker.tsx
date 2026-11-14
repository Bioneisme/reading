"use client";

import { useState } from "react";
import { classifyMiss, getDistractors, type Miss } from "@/lib/engine";
import { Button, ProgressBar } from "@/components/ui";

export interface Answer {
  said: string | null;
  custom?: boolean;
}

export function answerToMiss(word: string, a: Answer): Miss {
  const said = a.said === null ? null : a.said.trim().toLowerCase() || null;
  return { word, said, skill: classifyMiss(word, said) };
}

export function misreadingOptions(word: string, extra?: string | null): string[] {
  let list: string[] = [];
  try {
    list = getDistractors(word).map((d) => d.said);
  } catch {
    list = [];
  }
  if (extra) list = [extra, ...list];
  const seen = new Set<string>([word.toLowerCase()]);
  return list.filter((s) => {
    const k = s.toLowerCase();
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  }).slice(0, 5);
}

const chip =
  "min-h-12 rounded-full border-2 px-5 py-2 font-reading text-xl transition-colors aria-pressed:border-brand aria-pressed:bg-brand aria-pressed:text-white";
const chipOff = "border-line bg-surface hover:border-brand/50";

export function MisreadingChoices({
  word,
  childName,
  value,
  onChange,
  compact = false,
}: {
  word: string;
  childName: string;
  value: Answer | undefined;
  onChange: (a: Answer) => void;
  compact?: boolean;
}) {
  const [options] = useState(() => misreadingOptions(word, value && !value.custom ? value.said : null));
  const [otherOpen, setOtherOpen] = useState(Boolean(value?.custom));
  const [otherText, setOtherText] = useState(value?.custom ? value.said ?? "" : "");
  const groupId = `said-${word}`;

  return (
    <div role="group" aria-labelledby={compact ? undefined : groupId}>
      {!compact && (
        <p id={groupId} className="mb-3 text-ink-soft">
          What did {childName} say?
        </p>
      )}
      <div className="flex flex-wrap gap-2.5">
        {options.map((o) => {
          const on = Boolean(value && !value.custom && value.said === o);
          return (
            <button
              key={o}
              type="button"
              aria-pressed={on}
              onClick={() => {
                setOtherOpen(false);
                onChange({ said: o });
              }}
              className={`${chip} ${on ? "" : chipOff}`}
            >
              “{o}”
            </button>
          );
        })}
        <button
          type="button"
          aria-pressed={Boolean(value?.custom) || otherOpen}
          onClick={() => setOtherOpen(true)}
          className={`${chip} font-sans text-base ${value?.custom || otherOpen ? "" : chipOff}`}
        >
          Something else…
        </button>
        <button
          type="button"
          aria-pressed={value?.said === null}
          onClick={() => {
            setOtherOpen(false);
            onChange({ said: null });
          }}
          className={`${chip} font-sans text-base ${value?.said === null ? "" : chipOff}`}
        >
          Skipped it
        </button>
      </div>
      {otherOpen && (
        <form
          className="mt-3 flex flex-wrap gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (otherText.trim()) onChange({ said: otherText.trim(), custom: true });
          }}
        >
          <label className="sr-only" htmlFor={`${groupId}-other`}>
            What {childName} said instead of {word}
          </label>
          <input
            id={`${groupId}-other`}
            autoFocus
            value={otherText}
            onChange={(e) => {
              setOtherText(e.target.value);
              if (e.target.value.trim()) onChange({ said: e.target.value.trim(), custom: true });
            }}
            placeholder="Type what they said"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            className="min-h-12 min-w-0 flex-1 rounded-2xl border-2 border-line bg-surface px-4 font-reading text-xl focus:border-brand focus:outline-none"
          />
        </form>
      )}
    </div>
  );
}

export function MisreadingFlow({
  words,
  childName,
  answers,
  onAnswer,
  onFinish,
  finishLabel,
  onBack,
}: {
  words: { key: string; word: string; display: string }[];
  childName: string;
  answers: Record<string, Answer | undefined>;
  onAnswer: (key: string, a: Answer) => void;
  onFinish: () => void;
  finishLabel: string;
  onBack?: () => void;
}) {
  const [i, setI] = useState(0);
  const cur = words[Math.min(i, words.length - 1)];
  if (!cur) return null;
  const last = i >= words.length - 1;
  const answered = answers[cur.key] !== undefined;
  const allAnswered = words.every((w) => answers[w.key] !== undefined);

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-4 text-sm font-semibold text-ink-soft">
        <span aria-live="polite">
          {i + 1} of {words.length}
        </span>
        <div className="w-40">
          <ProgressBar value={(i + 1) / words.length} label="Words answered" />
        </div>
      </div>
      <p className="text-sm text-ink-soft">The word was</p>
      <p className="reading-text mb-4 font-bold">{cur.display}</p>
      <MisreadingChoices
        key={cur.key}
        word={cur.word}
        childName={childName}
        value={answers[cur.key]}
        onChange={(a) => onAnswer(cur.key, a)}
      />
      <div className="mt-8 flex flex-wrap gap-3">
        <Button
          variant="secondary"
          onClick={() => (i === 0 ? onBack?.() : setI(i - 1))}
          disabled={i === 0 && !onBack}
        >
          Back
        </Button>
        {last ? (
          <Button onClick={onFinish} disabled={!allAnswered}>
            {finishLabel}
          </Button>
        ) : (
          <Button onClick={() => setI(i + 1)} disabled={!answered}>
            Next word
          </Button>
        )}
      </div>
      {!allAnswered && last && (
        <p className="mt-3 text-sm text-ink-soft">Pick an answer for every word (or “Skipped it”).</p>
      )}
    </div>
  );
}
