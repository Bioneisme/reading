import { useSyncExternalStore } from "react";
import { readJson, type PlanId } from "./api";
import { mergeStates, syncSignature, type SyncedState } from "./merge";
import { store } from "./store";

export interface Subscription {
  pro: boolean;
  plan: PlanId | null;
  since: string | null;
  renewsAt: string | null;
  cancelAtPeriodEnd: boolean;
}

export interface Account {
  status: "loading" | "anon" | "signed";
  email: string | null;
  subscription: Subscription | null;
}

const LOADING: Account = { status: "loading", email: null, subscription: null };
let current: Account = LOADING;
const listeners = new Set<() => void>();

let epoch = 0;

function set(next: Account) {
  current = next;
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useAccount(): Account {
  return useSyncExternalStore(subscribe, () => current, () => LOADING);
}

function applySubscription(sub: Subscription | null): void {
  if (sub) store.applySubscription(sub.pro, sub.plan, sub.since);
}

async function refreshAccount(): Promise<Account> {
  const at = epoch;
  try {
    const res = await fetch("/api/auth/me", { cache: "no-store" });
    const data = await readJson<{ user: { email: string } | null; subscription: Subscription | null }>(res);
    if (at !== epoch) return current;
    const next: Account = data.user
      ? { status: "signed", email: data.user.email, subscription: data.subscription }
      : { status: "anon", email: null, subscription: null };
    set(next);
    if (next.status === "signed") applySubscription(next.subscription);
    return next;
  } catch {
    if (current.status === "loading") set({ status: "anon", email: null, subscription: null });
    return current;
  }
}

let lastSynced = "";
let timer: ReturnType<typeof setTimeout> | null = null;
let unsubscribeStore: (() => void) | null = null;
let syncing: Promise<void> | null = null;

async function push(state: SyncedState): Promise<void> {
  const sig = syncSignature(state);
  if (sig === lastSynced) return;
  const res = await fetch("/api/state", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ state }),
    keepalive: true,
  });
  if (res.ok) lastSynced = sig;
  if (res.status === 401) stopSync();
}

function schedulePush(): void {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    timer = null;
    void push(store.synced()).catch(() => {});
  }, 1200);
}

function stopSync(): void {
  epoch++;
  unsubscribeStore?.();
  unsubscribeStore = null;
  if (timer) clearTimeout(timer);
  timer = null;
  lastSynced = "";
}

async function pullAndMerge(at: number): Promise<void> {
  const res = await fetch("/api/state", { cache: "no-store" });
  if (!res.ok) return;
  const data = (await res.json()) as { state: SyncedState | null };
  if (at !== epoch) return;
  const local = store.synced();
  const merged = mergeStates(local, data.state);
  if (syncSignature(merged) !== syncSignature(local)) store.replaceSynced(merged);
  if (data.state) lastSynced = syncSignature(data.state);
  await push(merged);
}

export function startSync(): Promise<void> {
  if (syncing) return syncing;
  const at = epoch;
  syncing = (async () => {
    const acc = await refreshAccount();
    if (acc.status !== "signed" || at !== epoch) return;
    await pullAndMerge(at).catch(() => {});
    if (at === epoch && !unsubscribeStore) unsubscribeStore = store.subscribe(schedulePush);
  })().finally(() => {
    syncing = null;
  });
  return syncing;
}

export async function requestSignIn(email: string, next?: string): Promise<{ devLink?: string }> {
  const res = await fetch("/api/auth/request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, next }),
  });
  const data = await readJson<{ devLink?: string }>(res, "Something went wrong. Try again.");
  return { devLink: data.devLink };
}

export async function signOut(): Promise<void> {
  stopSync();
  await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
  store.signedOut();
  set({ status: "anon", email: null, subscription: null });
}

export async function changeSubscription(action: "cancel" | "resume"): Promise<Subscription> {
  const res = await fetch("/api/subscription", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action }),
  });
  const data = await readJson<{ subscription?: Subscription }>(res, "Could not update your plan.");
  if (!data.subscription) throw new Error("Could not update your plan.");
  set({ ...current, subscription: data.subscription });
  applySubscription(data.subscription);
  return data.subscription;
}
