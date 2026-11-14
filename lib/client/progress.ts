import type { Grade, Miss, SessionRecord } from "@/lib/engine";

export const GRADE_LABEL: Record<Grade, string> = {
  K: "Kindergarten",
  "1": "1st grade",
  "2": "2nd grade",
  "3": "3rd grade",
};

function dayKey(iso: string): number {
  const d = new Date(iso);
  return Math.floor(new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() / 86400000);
}

function todayKey(): number {
  return dayKey(new Date().toISOString());
}

export function currentDay(sessions: SessionRecord[], demo = false): number {
  if (!sessions.length) return 1;
  const last = sessions[sessions.length - 1];
  const lastDay = Math.max(...sessions.map((s) => s.day || 0), 1);
  if (demo || dayKey(last.date) === todayKey()) return lastDay;
  return lastDay + 1;
}

export function nextDay(sessions: SessionRecord[]): number {
  if (!sessions.length) return 1;
  return Math.max(...sessions.map((s) => s.day || 0)) + 1;
}

export function doneToday(sessions: SessionRecord[]): boolean {
  return sessions.some((s) => dayKey(s.date) === todayKey());
}

export function streak(sessions: SessionRecord[], demo = false): number {
  if (!sessions.length) return 0;
  const keys = Array.from(new Set(sessions.map((s) => dayKey(s.date)))).sort((a, b) => b - a);
  if (!demo && todayKey() - keys[0] > 1) return 0;
  let n = 1;
  for (let i = 1; i < keys.length; i++) {
    if (keys[i - 1] - keys[i] === 1) n++;
    else break;
  }
  return n;
}

export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  } catch {
    return iso.slice(0, 10);
  }
}

export function missExample(m: Miss): string {
  return m.said === null ? `${m.word} → skipped` : `${m.word} → “${m.said}”`;
}

export function plural(n: number, one: string, many = `${one}s`): string {
  return `${n} ${n === 1 ? one : many}`;
}
