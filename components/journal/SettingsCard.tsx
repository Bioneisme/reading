"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import type { Grade } from "@/lib/engine";
import { store, type AppState } from "@/lib/client/store";
import { GRADE_LABEL } from "@/lib/client/progress";
import { downloadReminderIcs } from "@/lib/client/ics";
import { SECTION } from "./TonightCard";

const SMALL_BTN =
  "tactile inline-flex min-h-11 flex-none cursor-pointer items-center justify-center rounded-xl border-2 border-line-strong bg-card px-3.5 text-sm font-extrabold text-ink";
const FIELD =
  "mt-1 block min-h-[46px] w-full rounded-xl border-2 border-line-strong bg-card px-3 text-base font-bold text-ink";
const PANEL_BTN = "inline-flex min-h-[46px] flex-[1_1_120px] cursor-pointer items-center justify-center rounded-xl text-sm font-extrabold";

function prettyTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return t;
  const suffix = h >= 12 ? "pm" : "am";
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${String(m).padStart(2, "0")} ${suffix}`;
}

function Row({ label, value, action, last, children }: { label: string; value: string; action?: ReactNode; last?: boolean; children?: ReactNode }) {
  return (
    <div className={last ? "pt-3.5" : "border-b-2 border-sand py-3.5"}>
      <div className="flex items-center gap-3">
        <span className="min-w-0 flex-auto">
          <span className="block text-[13px] font-extrabold text-ink-3">{label}</span>
          <span className="block text-base font-black">{value}</span>
        </span>
        {action}
      </div>
      {children}
    </div>
  );
}

export function SettingsCard({ state, locked }: { state: AppState; locked: boolean }) {
  const router = useRouter();
  const child = state.child!;
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(child.name);
  const [grade, setGrade] = useState<Grade>(child.grade);
  const [timeOpen, setTimeOpen] = useState(false);
  const [calDone, setCalDone] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  const planLine = state.demo ? "Demo — no subscription" : state.pro ? "Readly plan · active" : "Free plan";

  return (
    <section aria-labelledby="set-title" className={`${SECTION} p-6`}>
      <h2 id="set-title" className="text-[22px] font-black">
        Settings
      </h2>
      <div className="mt-2 flex flex-col">
        <Row
          label="Child"
          value={`${child.name} · ${GRADE_LABEL[child.grade]}`}
          action={
            <button
              type="button"
              aria-expanded={editing}
              onClick={() => {
                setName(child.name);
                setGrade(child.grade);
                setEditing((v) => !v);
              }}
              className={SMALL_BTN}
            >
              {editing ? "Close" : "Edit"}
            </button>
          }
        >
          {editing && (
            <form
              className="mt-3 flex flex-wrap gap-2.5"
              onSubmit={(e) => {
                e.preventDefault();
                const n = name.trim();
                if (!n) return;
                store.setChild({ name: n, grade });
                setEditing(false);
              }}
            >
              <label className="flex-[1_1_140px] text-[13px] font-extrabold text-ink-2">
                First name
                <input
                  type="text"
                  value={name}
                  maxLength={30}
                  required
                  autoComplete="off"
                  onChange={(e) => setName(e.target.value)}
                  className={FIELD}
                />
              </label>
              <label className="flex-[1_1_140px] text-[13px] font-extrabold text-ink-2">
                Grade
                <select value={grade} onChange={(e) => setGrade(e.target.value as Grade)} className={FIELD}>
                  {(Object.keys(GRADE_LABEL) as Grade[]).map((g) => (
                    <option key={g} value={g}>
                      {GRADE_LABEL[g]}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="submit"
                className="tactile min-h-12 flex-[1_1_100%] cursor-pointer rounded-[14px] bg-indigo text-[15px] font-extrabold text-white shadow-edge-indigo"
              >
                Save
              </button>
            </form>
          )}
        </Row>

        <Row
          label="Reminder"
          value={`Every night at ${prettyTime(state.reminderTime)}`}
          action={
            <button
              type="button"
              onClick={() => {
                downloadReminderIcs(state.reminderTime, child.name);
                setCalDone(true);
              }}
              className={SMALL_BTN}
            >
              Add to calendar
            </button>
          }
        >
          {timeOpen ? (
            <label className="mt-3 block max-w-[220px] text-[13px] font-extrabold text-ink-2">
              Reminder time
              <input
                type="time"
                value={state.reminderTime}
                onChange={(e) => {
                  if (e.target.value) {
                    store.setReminderTime(e.target.value);
                    setCalDone(false);
                  }
                }}
                className={FIELD}
              />
            </label>
          ) : (
            <button
              type="button"
              onClick={() => setTimeOpen(true)}
              className="text-link mt-1 cursor-pointer text-sm font-extrabold text-indigo underline"
            >
              Change time
            </button>
          )}
          {calDone && (
            <p role="status" className="mt-2.5 text-sm font-extrabold text-mastered-ink">
              Calendar file downloaded — open readly-reading-reminder.ics to add it.
            </p>
          )}
        </Row>

        <Row
          label="Plan"
          value={planLine}
          action={
            locked ? (
              <Link
                href="/plans"
                className="tactile inline-flex min-h-11 flex-none items-center rounded-xl bg-indigo px-3.5 text-sm font-extrabold text-white no-underline"
              >
                See plans
              </Link>
            ) : state.pro && !state.demo ? (
              <button type="button" aria-expanded={cancelOpen} onClick={() => setCancelOpen(true)} className={SMALL_BTN}>
                Cancel plan
              </button>
            ) : null
          }
        >
          {cancelOpen && state.pro && (
            <div role="alertdialog" aria-labelledby="cancel-q" className="mt-3 rounded-2xl border-2 border-line bg-paper p-4">
              <p id="cancel-q" className="text-base font-black">
                Cancel {child.name}&apos;s plan?
              </p>
              <p className="mt-1 text-sm font-bold leading-normal text-ink-2">
                No more charges. Nightly sessions lock, and {child.name}&apos;s nights stay in this browser.
              </p>
              <div className="mt-3 flex flex-wrap gap-2.5">
                <button
                  type="button"
                  autoFocus
                  onClick={() => setCancelOpen(false)}
                  className={`${PANEL_BTN} tactile bg-indigo text-white shadow-[0_3px_0_#3328B0]`}
                >
                  Keep plan
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCancelOpen(false);
                    store.setPro(false);
                  }}
                  className={`${PANEL_BTN} border-2 border-line-strong bg-card text-ink`}
                >
                  Cancel plan
                </button>
              </div>
            </div>
          )}
        </Row>

        <Row
          last
          label="Your data"
          value="Saved only in this browser"
          action={
            <button
              type="button"
              aria-expanded={resetOpen}
              onClick={() => setResetOpen(true)}
              className={`${SMALL_BTN} !text-needs-ink`}
            >
              Reset all data
            </button>
          }
        >
          {resetOpen && (
            <div role="alertdialog" aria-labelledby="reset-q" className="mt-3 rounded-2xl border-2 border-[#F5B98A] bg-needs-tint p-4">
              <p id="reset-q" className="text-base font-black">
                Reset everything?
              </p>
              <p className="mt-1 text-sm font-bold leading-normal text-[#6B3207]">
                {state.demo
                  ? "This removes the example nights from this browser. Your own child’s data isn’t touched."
                  : `This removes ${child.name}’s profile, nights and plan from this browser. It can’t be undone.`}
              </p>
              <div className="mt-3 flex flex-wrap gap-2.5">
                <button
                  type="button"
                  autoFocus
                  onClick={() => setResetOpen(false)}
                  className={`${PANEL_BTN} tactile bg-indigo text-white shadow-[0_3px_0_#3328B0]`}
                >
                  Keep my data
                </button>
                <button
                  type="button"
                  onClick={() => {
                    store.reset();
                    router.push("/");
                  }}
                  className={`${PANEL_BTN} border-2 border-[#E09A6A] bg-card text-needs-ink`}
                >
                  Yes, reset
                </button>
              </div>
            </div>
          )}
        </Row>
      </div>
    </section>
  );
}
