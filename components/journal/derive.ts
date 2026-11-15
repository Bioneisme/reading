import type { Profile, SessionRecord, SkillId } from "@/lib/engine";
import { currentDay, nextDay, plural, streak } from "@/lib/client/progress";
import { SKILL_SHORT, SKILL_WITH_EXAMPLES, STATUS_LABEL } from "./skillCopy";

const DAY_MS = 86400000;
const WEEKDAY_LETTER = ["S", "M", "T", "W", "T", "F", "S"];
const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function dayKey(iso: string | Date): number {
  const d = new Date(iso);
  return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY_MS);
}

function keyToDate(key: number): Date {
  const d = new Date(key * DAY_MS);
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

export function sortSessions(sessions: SessionRecord[]): SessionRecord[] {
  return [...sessions].sort((a, b) => a.day - b.day || a.date.localeCompare(b.date));
}

export function journalDay(sessions: SessionRecord[], demo: boolean): number {
  return demo ? nextDay(sessions) : currentDay(sessions, false);
}

function doneTonight(sessions: SessionRecord[], demo: boolean): boolean {
  if (demo) return false;
  const today = dayKey(new Date());
  return sessions.some((s) => dayKey(s.date) === today);
}

export function nightlyDoneTonight(sessions: SessionRecord[], demo: boolean): boolean {
  if (demo) return false;
  const today = dayKey(new Date());
  return sessions.some((s) => s.kind === "nightly" && dayKey(s.date) === today);
}

export function nightsInARow(sessions: SessionRecord[], demo: boolean): number {
  return demo ? sessions.length : streak(sessions, false);
}

export function streakLine(sessions: SessionRecord[], demo: boolean): string {
  const run = nightsInARow(sessions, demo);
  if (run >= 2) return `${run}-night streak`;
  const nights = new Set(sessions.map((s) => dayKey(s.date))).size;
  return nights === 0 ? "Night 1 is tonight" : `${plural(nights, "night")} so far`;
}

export type MoonState = "read" | "tonight" | "none";

export function weekStrip(sessions: SessionRecord[], demo: boolean): { letter: string; state: MoonState }[] {
  const today = dayKey(new Date());
  const keys = sessions.map((s) => dayKey(s.date));
  let tonight = today;
  let read = new Set(keys);
  if (demo && sessions.length) {
    tonight = Math.max(today, Math.max(...keys) + 1);
    const ordered = sortSessions(sessions);
    read = new Set(ordered.map((_, i) => tonight - ordered.length + i));
  }
  const done = read.has(tonight);
  return Array.from({ length: 7 }, (_, i) => {
    const key = tonight - 6 + i;
    const letter = WEEKDAY_LETTER[keyToDate(key).getDay()];
    if (key === tonight) return { letter, state: done ? "read" : "tonight" };
    return { letter, state: read.has(key) ? "read" : "none" };
  });
}

export function sessionTitle(sessions: SessionRecord[], rec: SessionRecord): string {
  if (rec.kind === "check") return rec.day <= 1 ? "First reading check" : "Reading check";
  const ordered = sortSessions(sessions);
  const i = ordered.findIndex((s) => s.id === rec.id);
  let round = 1;
  for (let k = i - 1; k >= 0 && ordered[k].kind === "nightly" && ordered[k].focus === rec.focus; k--) round++;
  return rec.focus ? `${SKILL_SHORT[rec.focus]} — round ${round}` : `Night ${rec.day}`;
}

export function weekdayShort(iso: string): string {
  return WEEKDAY_SHORT[new Date(iso).getDay()];
}

export function missLabel(n: number): string {
  return plural(n, "miss", "misses");
}

export function headerLine(profile: Profile, sessions: SessionRecord[], demo: boolean, locked: boolean): string {
  if (!sessions.length) return "Tonight starts with a 3-minute reading check.";
  const checkedToday = doneTonight(sessions, demo);
  if (locked) return checkedToday ? "Tonight’s check is done. Tomorrow’s plan is free." : "Tomorrow’s plan is free.";
  const focus = SKILL_SHORT[profile.focus];
  const hasNightly = sessions.some((s) => s.kind === "nightly");
  if (!hasNightly) return `First check done — ${focus} is the place to start.`;
  const status = profile.skills[profile.focus].status;
  const lead = status === "improving" ? `${focus} is improving.` : `${focus} is tonight’s focus.`;
  return profile.nextUp ? `${lead} Next up: ${SKILL_SHORT[profile.nextUp]}.` : lead;
}

function skillTrend(skill: SkillId, profile: Profile): { first: number; last: number; total: number } {
  const hist = profile.skills[skill].history.slice(-7);
  const total = hist.reduce((a, b) => a + b, 0);
  const first = hist.find((h) => h > 0) ?? hist[0] ?? 0;
  const last = hist[hist.length - 1] ?? 0;
  return { first, last, total };
}

function trendText(first: number, last: number): string {
  return `${missLabel(first)} → ${last === 0 ? "0" : missLabel(last)}`;
}

export function skillNote(skill: SkillId, profile: Profile, sessions: SessionRecord[]): string {
  const st = profile.skills[skill];
  if (st.status === "mastered" || st.status === "notChecked") return "";
  const { first, last, total } = skillTrend(skill, profile);
  if (sessions.length <= 1) {
    const all = sessions[0]?.misses.length ?? 0;
    const prefix = skill === profile.focus ? "Focus · " : "";
    if (!total) return "";
    return skill === profile.focus && all ? `${prefix}${total} of ${all} misses in the first check` : `${prefix}${missLabel(total)} in the first check`;
  }
  if (st.status === "improving") return `${trendText(first, last)} this week`;
  return total ? `${missLabel(total)} this week` : "";
}

export interface WeekSummary {
  headline: string;
  overall: string;
  next: string;
  chips: string[];
}

export const SUMMARY_AFTER = 3;

export function weekSummary(profile: Profile, sessions: SessionRecord[]): WeekSummary | null {
  const ordered = sortSessions(sessions);
  if (ordered.length < SUMMARY_AFTER) return null;
  const week = ordered.slice(-7);
  const counts = new Map<SkillId, number>();
  week.forEach((s) => s.focus && counts.set(s.focus, (counts.get(s.focus) ?? 0) + 1));
  const skill = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? profile.focus;
  const name = SKILL_SHORT[skill];
  const { first, last } = skillTrend(skill, profile);
  const headline =
    first === 0 && last === 0
      ? `${name}: no misses this week.`
      : last < first
        ? `${name}: ${trendText(first, last)} this week.`
        : last === first
          ? `${name} held steady at ${missLabel(last)} a night.`
          : `${name}: ${trendText(first, last)} this week. That’s normal while a skill is new.`;
  const allFirst = week[0].misses.length;
  const allLast = week[week.length - 1].misses.length;
  const overall = `All misses per night, every skill: ${allFirst} → ${allLast}.`;
  const upcoming = profile.focus !== skill ? profile.focus : profile.nextUp;
  const next = upcoming ? `Next up: ${SKILL_WITH_EXAMPLES[upcoming]}.` : "";
  const mastered = (Object.keys(profile.skills) as SkillId[]).find(
    (s) => profile.skills[s].status === "mastered" && s !== skill,
  );
  const chips = [plural(week.length, "night")];
  if (mastered) chips.push(`${SKILL_SHORT[mastered]}: mastered`);
  chips.push(`${name}: ${STATUS_LABEL[profile.skills[skill].status].toLowerCase()}`);
  return { headline, overall, next, chips };
}
