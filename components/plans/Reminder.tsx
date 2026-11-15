"use client";

import { useState } from "react";
import { Button, Glim, Icon } from "@/components/kit";
import { downloadReminderIcs } from "@/lib/client/ics";
import { store } from "@/lib/client/store";

const TIMES = [
  { value: "19:00", label: "7:00 pm" },
  { value: "19:30", label: "7:30 pm" },
  { value: "20:00", label: "8:00 pm" },
  { value: "20:30", label: "8:30 pm" },
];

export function Reminder({ name, initial }: { name: string; initial: string }) {
  const [time, setTime] = useState(TIMES.some((t) => t.value === initial) ? initial : "19:30");
  const [done, setDone] = useState(false);
  const label = TIMES.find((t) => t.value === time)?.label ?? time;

  const add = () => {
    store.setReminderTime(time);
    downloadReminderIcs(time, name);
    setDone(true);
  };

  return (
    <section aria-labelledby="rem-title" className="mt-7 rounded-card border-2 border-line bg-card p-[22px] shadow-edge">
      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <h2 id="rem-title" className="text-[19px] font-black">
            Add a nightly reading reminder
          </h2>
          <p className="mt-1 text-[15px] font-semibold leading-normal text-ink-2">
            Pick a time. We&apos;ll download a calendar file that works with most calendar apps.
          </p>
        </div>
        <Glim pose="sleepy" size={84} className="-mt-2 -mr-1 flex-none max-[400px]:hidden" />
      </div>
      <div role="radiogroup" aria-label="Reminder time" className="mt-3.5 flex flex-wrap gap-2">
        {TIMES.map((t) => (
          <button
            key={t.value}
            type="button"
            role="radio"
            aria-checked={time === t.value}
            onClick={() => {
              setTime(t.value);
              setDone(false);
            }}
            className="option min-h-11 cursor-pointer rounded-full border-2 border-edge bg-card px-4 text-[15px] font-extrabold text-ink aria-checked:border-indigo aria-checked:bg-indigo-tint"
          >
            {t.label}
          </button>
        ))}
      </div>
      <Button variant="secondary" size="md" onClick={add} className="mt-3.5 min-h-[50px] rounded-chip px-[18px]">
        <Icon name="calendar" size={18} strokeWidth={2.2} />
        Add to my calendar
      </Button>
      {done && (
        <p role="status" className="mt-3 text-sm font-extrabold text-mastered-ink">
          Downloaded readly-reading-reminder.ics. Open it to add {label} every night.
        </p>
      )}
    </section>
  );
}
