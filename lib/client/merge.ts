import type { SessionRecord } from "@/lib/engine";
import type { Child, QuizAnswers } from "./store";

export interface SyncedState {
  child: Child | null;
  quiz: QuizAnswers | null;
  sessions: SessionRecord[];
  reminderTime: string;
}

const same = (a: Child, b: Child) => a.name.trim().toLowerCase() === b.name.trim().toLowerCase();

export function mergeStates(local: SyncedState, remote: SyncedState | null): SyncedState {
  if (!remote || !remote.child) return local;
  if (!local.child || !same(local.child, remote.child)) return remote;
  const byId = new Map<string, SessionRecord>();
  for (const s of local.sessions) byId.set(s.id, s);
  for (const s of remote.sessions) byId.set(s.id, s);
  const sessions = [...byId.values()].sort((a, b) => a.date.localeCompare(b.date) || a.day - b.day);
  return {
    child: remote.child,
    quiz: remote.quiz ?? local.quiz,
    sessions,
    reminderTime: remote.reminderTime || local.reminderTime,
  };
}

export function syncSignature(s: SyncedState): string {
  return JSON.stringify([s.child, s.quiz, s.sessions, s.reminderTime]);
}
