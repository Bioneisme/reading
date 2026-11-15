"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Grade } from "@/lib/engine";
import { store, type AppState } from "@/lib/client/store";
import { changeSubscription, signOut, useAccount, type Account } from "@/lib/client/account";
import type { PlanId } from "@/lib/client/api";
import { GRADE_LABEL } from "@/lib/client/progress";
import { downloadReminderIcs } from "@/lib/client/ics";
import { Collapse } from "./motion";
import { sortSessions } from "./derive";
import { SECTION } from "./TonightCard";

const DAY_MS = 86400000;

const SMALL_BTN =
  "tactile inline-flex min-h-11 flex-none cursor-pointer items-center justify-center rounded-xl border-2 border-line-strong bg-card px-3.5 text-sm font-extrabold text-ink shadow-[0_3px_0_#DCD3C3]";
const SMALL_PRIMARY =
  "tactile inline-flex min-h-11 flex-none items-center rounded-xl bg-indigo px-3.5 text-sm font-extrabold text-white no-underline shadow-[0_3px_0_#3328B0]";
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

function shortDate(d: Date, year: boolean): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", ...(year ? { year: "numeric" } : {}) });
}

function planText(id: PlanId, since: string): string {
  const start = new Date(since);
  const base = Number.isNaN(start.getTime()) ? new Date() : start;
  const at = (days: number) => new Date(base.getTime() + days * DAY_MS);
  if (id === "year") return `1 year · renews ${shortDate(at(365), true)}`;
  if (id === "month") return `Every 4 weeks · renews ${shortDate(at(28), false)}`;
  return `1 week · then every 4 weeks from ${shortDate(at(7), false)}`;
}

const PLAN_NAME: Record<PlanId, string> = { week: "Weekly start", month: "Every 4 weeks", year: "1 year" };

function planLineFor(state: AppState, account: Account): string {
  const sub = account.status === "signed" ? account.subscription : null;
  if (!state.demo && sub) {
    if (!sub.pro) return "Free plan";
    const name = sub.plan ? PLAN_NAME[sub.plan] : "Readly plan";
    if (!sub.renewsAt) return `${name} · active`;
    return `${name} · ${sub.cancelAtPeriodEnd ? "ends" : "renews"} ${shortDate(new Date(sub.renewsAt), true)}`;
  }
  if (state.demo) {
    const first = sortSessions(state.sessions)[0]?.date ?? new Date().toISOString();
    return `Example · ${planText("year", first)}`;
  }
  if (!state.pro) return "Free plan";
  return state.plan ? planText(state.plan.id, state.plan.since) : "Readly plan · active";
}

function Row({
  label,
  value,
  action,
  last,
  truncate,
  children,
}: {
  label: string;
  value: string;
  action?: ReactNode;
  last?: boolean;
  truncate?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className={last ? "pt-3.5" : "border-b-2 border-sand py-3.5"}>
      <div className="flex flex-col items-start gap-2.5 @[300px]:flex-row @[300px]:items-center @[300px]:gap-3">
        <span className="w-full min-w-0 @[300px]:w-auto @[300px]:flex-1">
          <span className="block text-[13px] font-extrabold text-ink-3">{label}</span>
          <span title={truncate ? value : undefined} className={`block text-base font-black ${truncate ? "truncate" : "text-balance"}`}>
            {value}
          </span>
        </span>
        {action}
      </div>
      {children}
    </div>
  );
}

export function SettingsCard({ state, locked }: { state: AppState; locked: boolean }) {
  const router = useRouter();
  const account = useAccount();
  const signed = account.status === "signed" && !state.demo;
  const sub = signed ? account.subscription : null;
  const [planBusy, setPlanBusy] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);
  const child = state.child!;
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(child.name);
  const [grade, setGrade] = useState<Grade>(child.grade);
  const [timeOpen, setTimeOpen] = useState(false);
  const [calDone, setCalDone] = useState(false);
  const [cancelled, setCancelled] = useState<{ plan: PlanId | null } | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const keepRef = useRef<HTMLButtonElement>(null);
  const resetRef = useRef<HTMLDivElement>(null);
  const planRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!resetOpen) return;
    keepRef.current?.focus({ preventScroll: true });
    const t = window.setTimeout(() => resetRef.current?.scrollIntoView({ block: "nearest" }), 320);
    return () => window.clearTimeout(t);
  }, [resetOpen]);

  const planLine = planLineFor(state, account);
  const showCancelled = signed ? !!sub?.cancelAtPeriodEnd : !!cancelled && !state.pro && !state.demo;
  const endsOn = sub?.renewsAt ? shortDate(new Date(sub.renewsAt), true) : null;

  const remotePlan = async (action: "cancel" | "resume") => {
    setPlanBusy(true);
    setPlanError(null);
    try {
      await changeSubscription(action);
    } catch (err) {
      setPlanError(err instanceof Error ? err.message : "Could not update your plan.");
    } finally {
      setPlanBusy(false);
    }
  };

  return (
    <section aria-labelledby="set-title" className={`${SECTION} p-6`}>
      <h2 id="set-title" className="text-[22px] font-black">
        Settings
      </h2>
      <div className="@container mt-2 flex flex-col">
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
          <Collapse open={editing}>
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
          </Collapse>
        </Row>

        <Row
          label="Reminder"
          value={`Nightly at ${prettyTime(state.reminderTime)}`}
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
            <label className="mt-3 block max-w-[220px] animate-fade text-[13px] font-extrabold text-ink-2">
              Reminder time
              <input
                type="time"
                autoFocus
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
              className="text-link mt-1 inline-flex min-h-9 cursor-pointer items-center text-sm font-extrabold text-indigo"
            >
              Change time
            </button>
          )}
          {calDone && (
            <p role="status" className="mt-2.5 animate-fade text-sm font-extrabold text-mastered-ink">
              Calendar file downloaded. Open readly-reading-reminder.ics to add it.
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
                className={SMALL_PRIMARY}
              >
                See plans
              </Link>
            ) : state.pro && !state.demo && !showCancelled ? (
              <button
                type="button"
                disabled={planBusy}
                onClick={() => {
                  if (signed) return void remotePlan("cancel");
                  setCancelled({ plan: state.plan?.id ?? null });
                  store.setPro(false);
                }}
                className={`${SMALL_BTN} disabled:opacity-60`}
              >
                {planBusy ? "Cancelling..." : "Cancel plan"}
              </button>
            ) : null
          }
        >
          <div ref={planRef} role="status">
            {planError && <p className="mt-2.5 text-sm font-extrabold text-needs-ink">{planError}</p>}
            {showCancelled && (
              <div className="mt-3 flex animate-rise flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border-2 border-line bg-paper px-4 py-3">
                <p className="min-w-0 flex-[1_1_200px] text-sm font-bold leading-normal text-ink-2">
                  <span className="block text-base font-black text-ink">Plan cancelled. No more charges.</span>
                  {signed
                    ? `Everything stays open until ${endsOn ?? "the end of this period"}. ${child.name}'s nights stay in your account.`
                    : `${child.name}'s nights stay in this browser.`}
                </p>
                <button
                  type="button"
                  disabled={planBusy}
                  onClick={() => {
                    if (signed) return void remotePlan("resume");
                    store.setPro(true, cancelled?.plan ?? undefined);
                    setCancelled(null);
                    requestAnimationFrame(() => planRef.current?.scrollIntoView({ block: "center" }));
                  }}
                  className={SMALL_BTN}
                >
                  Undo
                </button>
              </div>
            )}
          </div>
        </Row>

        {!state.demo && (
          <Row
            label="Account"
            truncate={signed}
            value={signed ? account.email ?? "" : "Not signed in"}
            action={
              signed ? (
                <button type="button" onClick={() => void signOut().then(() => router.push("/"))} className={SMALL_BTN}>
                  Sign out
                </button>
              ) : (
                <Link
                  href="/signin?next=/journal"
                  className={SMALL_PRIMARY}
                >
                  Save to account
                </Link>
              )
            }
          >
            {!signed && (
              <p className="mt-1 text-sm font-bold leading-normal text-ink-3">
                Sign in with email to keep {child.name}&apos;s progress and your plan on any device.
              </p>
            )}
          </Row>
        )}

        <Row
          last
          label="Your data"
          value={signed ? "Saved to your account" : "Saved in this browser"}
          action={
            <button
              type="button"
              aria-expanded={resetOpen}
              onClick={() => setResetOpen((v) => !v)}
              className={`${SMALL_BTN} !text-needs-ink`}
            >
              Reset all data
            </button>
          }
        >
          <Collapse open={resetOpen}>
            <div ref={resetRef} role="alertdialog" aria-labelledby="reset-q" className="mt-3 rounded-2xl border-2 border-[#F5B98A] bg-needs-tint p-4">
              <p id="reset-q" className="text-base font-black">
                Reset everything?
              </p>
              <p className="mt-1 text-sm font-bold leading-normal text-[#6B3207]">
                {state.demo
                  ? "This removes the example nights from this browser. Your own child’s data isn’t touched."
                  : signed
                    ? `This removes ${child.name}’s profile and nights from your account and this browser. Your paid plan stays. It can’t be undone.`
                    : `This removes ${child.name}’s profile, nights and plan from this browser. It can’t be undone.`}
              </p>
              <div className="mt-3 flex flex-wrap gap-2.5">
                <button
                  ref={keepRef}
                  type="button"
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
          </Collapse>
        </Row>
      </div>
    </section>
  );
}
