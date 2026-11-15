import { useSyncExternalStore } from "react";
import type { Grade, SessionRecord } from "@/lib/engine";
import { DEMO_CHILD, DEMO_SESSIONS } from "@/lib/demo";
import type { SyncedState } from "./merge";

export interface Child {
  name: string;
  grade: Grade;
}

export interface QuizAnswers {
  signs: string[];
  evenings: string;
  minutes: number;
  goal: string;
}

export interface AppState {
  anonId: string;
  child: Child | null;
  quiz: QuizAnswers | null;
  sessions: SessionRecord[];
  pro: boolean;
  plan: { id: "week" | "month" | "year"; since: string } | null;
  reminderTime: string;
  demo: boolean;
}

export interface Snapshot {
  state: AppState;
  real: AppState;
  mode: "real" | "demo";
}

export interface Repository {
  load(): AppState;
  save(state: AppState): void;
  clear(): void;
}

const mem = new Map<string, string | null>();

function rawGet(key: string): string | null {
  if (mem.has(key)) return mem.get(key) ?? null;
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function rawSet(key: string, value: string | null) {
  mem.set(key, value);
  if (typeof window === "undefined") return;
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
  }
}

let fallbackId: string | null = null;
function newId(): string {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  } catch {
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
function defaultAnonId() {
  if (!fallbackId) fallbackId = newId();
  return fallbackId;
}

const GRADES: Grade[] = ["K", "1", "2", "3"];

function demoChild(): Child {
  return { name: String(DEMO_CHILD.name), grade: DEMO_CHILD.grade as Grade };
}

function defaults(demo: boolean): AppState {
  return {
    anonId: defaultAnonId(),
    child: null,
    quiz: null,
    sessions: [],
    pro: false,
    plan: null,
    reminderTime: "19:30",
    demo,
  };
}

function parse(raw: string | null, demo: boolean): AppState {
  const base = defaults(demo);
  if (!raw) return base;
  try {
    const v = JSON.parse(raw) as Partial<AppState>;
    const child =
      v.child && typeof v.child.name === "string" && GRADES.includes(v.child.grade as Grade)
        ? { name: v.child.name, grade: v.child.grade as Grade }
        : null;
    return {
      anonId: typeof v.anonId === "string" && v.anonId ? v.anonId : base.anonId,
      child,
      quiz: v.quiz && Array.isArray(v.quiz.signs) ? v.quiz : null,
      sessions: Array.isArray(v.sessions) ? v.sessions : [],
      pro: Boolean(v.pro),
      plan:
        v.plan && ["week", "month", "year"].includes(v.plan.id) && typeof v.plan.since === "string"
          ? { id: v.plan.id, since: v.plan.since }
          : null,
      reminderTime:
        typeof v.reminderTime === "string" && /^\d{2}:\d{2}$/.test(v.reminderTime)
          ? v.reminderTime
          : base.reminderTime,
      demo,
    };
  } catch {
    return base;
  }
}

export function localStorageRepository(key: string, demo: boolean): Repository {
  return {
    load: () => parse(rawGet(key), demo),
    save: (state) => rawSet(key, JSON.stringify({ ...state, demo })),
    clear: () => rawSet(key, null),
  };
}

const REAL_KEY = "readly:v1";
const DEMO_KEY = "readly:demo:v1";
const MODE_KEY = "readly:mode";

const LEGACY_KEYS: [string, string][] = [
  ["soundout:v1", REAL_KEY],
  ["soundout:demo:v1", DEMO_KEY],
  ["soundout:mode", MODE_KEY],
];

function migrateLegacyKeys() {
  if (typeof window === "undefined") return;
  try {
    for (const [from, to] of LEGACY_KEYS) {
      const value = window.localStorage.getItem(from);
      if (value !== null && window.localStorage.getItem(to) === null) window.localStorage.setItem(to, value);
      window.localStorage.removeItem(from);
    }
  } catch {}
}
migrateLegacyKeys();

const realRepo = localStorageRepository(REAL_KEY, false);
const demoRepo = localStorageRepository(DEMO_KEY, true);

const listeners = new Set<() => void>();
function emit() {
  cache = null;
  listeners.forEach((l) => l());
}

function getMode(): "real" | "demo" {
  return rawGet(MODE_KEY) === "demo" ? "demo" : "real";
}

let cache: { sig: string; snap: Snapshot } | null = null;

function getSnapshot(): Snapshot {
  const sig = `${rawGet(MODE_KEY)}\u0000${rawGet(REAL_KEY)}\u0000${rawGet(DEMO_KEY)}`;
  if (cache && cache.sig === sig) return cache.snap;
  const mode = getMode();
  const real = realRepo.load();
  const state = mode === "demo" ? demoRepo.load() : real;
  const snap: Snapshot = { state, real, mode };
  cache = { sig, snap };
  return snap;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key) mem.delete(e.key);
    cache = null;
    cb();
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

export function useStore(): Snapshot | null {
  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}

function activeRepo(): Repository {
  return getMode() === "demo" ? demoRepo : realRepo;
}

function update(fn: (s: AppState) => AppState) {
  const repo = activeRepo();
  repo.save(fn(repo.load()));
  emit();
}

export const store = {
  get: (): Snapshot => getSnapshot(),
  update,

  finishQuiz(child: Child, quiz: QuizAnswers) {
    rawSet(MODE_KEY, "real");
    const s = realRepo.load();
    const sameChild = s.child && s.child.name.trim().toLowerCase() === child.name.trim().toLowerCase();
    realRepo.save({ ...s, child, quiz, sessions: sameChild ? s.sessions : [] });
    emit();
  },

  addSession(rec: SessionRecord) {
    update((s) => ({ ...s, sessions: [...s.sessions, rec] }));
  },

  putSession(rec: SessionRecord) {
    update((s) => {
      const i = s.sessions.findIndex((x) => x.id === rec.id);
      if (i < 0) return { ...s, sessions: [...s.sessions, rec] };
      const sessions = s.sessions.slice();
      sessions[i] = rec;
      return { ...s, sessions };
    });
  },

  setSessions(sessions: SessionRecord[]) {
    update((s) => ({ ...s, sessions }));
  },

  setChild(child: Child) {
    update((s) => ({ ...s, child }));
  },

  setPro(pro: boolean, planId?: "week" | "month" | "year") {
    update((s) => ({
      ...s,
      pro,
      plan: pro ? (planId ? { id: planId, since: new Date().toISOString() } : s.plan) : null,
    }));
  },

  setReminderTime(reminderTime: string) {
    update((s) => ({ ...s, reminderTime }));
  },

  reset() {
    if (getMode() === "demo") {
      demoRepo.clear();
      rawSet(MODE_KEY, "real");
    } else {
      realRepo.clear();
    }
    emit();
  },

  startDemo() {
    demoRepo.save({ ...defaults(true), child: demoChild() });
    rawSet(MODE_KEY, "demo");
    emit();
  },

  simulateWeek() {
    if (getMode() !== "demo") rawSet(MODE_KEY, "demo");
    const s = demoRepo.load();
    demoRepo.save({
      ...s,
      child: s.child ?? demoChild(),
      sessions: DEMO_SESSIONS.map((x) => ({ ...x })),
    });
    emit();
  },

  exitDemo() {
    rawSet(MODE_KEY, "real");
    emit();
  },

  newId,

  subscribe,

  synced(): SyncedState {
    const s = realRepo.load();
    return { child: s.child, quiz: s.quiz, sessions: s.sessions, reminderTime: s.reminderTime };
  },

  replaceSynced(next: SyncedState) {
    realRepo.save({ ...realRepo.load(), ...next });
    emit();
  },

  applySubscription(pro: boolean, plan: "week" | "month" | "year" | null, since: string | null) {
    const s = realRepo.load();
    realRepo.save({ ...s, pro, plan: pro && plan ? { id: plan, since: since ?? s.plan?.since ?? new Date().toISOString() } : null });
    emit();
  },

  signedOut() {
    realRepo.clear();
    rawSet(MODE_KEY, "real");
    emit();
  },
};
