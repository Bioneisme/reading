import { PASSAGES, STORIES, classifyMiss, type Grade, type Miss, type SessionRecord } from "@/lib/engine";
import { wordsOf } from "@/lib/engine/text";

export const DEMO_CHILD: { name: string; grade: Grade } = { name: "Mia", grade: "1" };

export const DEMO_DAY1_PICKS: { word: string; said: string }[] = [
  { word: "bike", said: "bik" },
  { word: "home", said: "hom" },
  { word: "cake", said: "cak" },
  { word: "rides", said: "runs" },
];

const miss = (word: string, said: string | null): Miss => ({ word, said, skill: classifyMiss(word, said) });

function nightOf(daysAgo: number): string {
  const d = new Date();
  d.setHours(19, 30, 0, 0);
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

const kite = STORIES.find((s) => s.id === "jakes-kite")!.text;
const NIGHTLY = (pairs: string[], list: string[]) => [...pairs, ...list, ...wordsOf(kite)];

const PLAN: [string[], string[], [string, string | null][]][] = [
  [["tap", "tape", "kit", "kite", "hop", "hope"], ["cake", "ride", "home", "cute", "lake"], [["kite", "kit"], ["hope", "hop"], ["ship", "sip"]]],
  [["kit", "kite", "hop", "hope", "cut", "cute"], ["bike", "time", "nose", "game", "five"], [["cute", "cut"], ["time", "tim"], ["with", "wit"]]],
  [["hop", "hope", "cut", "cute", "pin", "pine"], ["mile", "rope", "tape", "wide", "bone"], [["rope", "rop"], ["then", "ten"]]],
  [["cut", "cute", "pin", "pine", "tap", "tape"], ["hike", "note", "same", "pile", "joke"], [["shop", "sop"]]],
];

function demoSessions(): SessionRecord[] {
  const day1: SessionRecord = {
    id: "demo-1",
    date: nightOf(4),
    day: 1,
    kind: "check",
    words: wordsOf(PASSAGES.find((p) => p.grade === "1")!.text),
    misses: DEMO_DAY1_PICKS.map((p) => miss(p.word, p.said)),
  };
  const nights = PLAN.map(([pairs, list, misses], i): SessionRecord => ({
    id: `demo-${i + 2}`,
    date: nightOf(3 - i),
    day: i + 2,
    kind: "nightly",
    focus: "magicE",
    words: [...NIGHTLY(pairs, list), ...misses.map(([w]) => w).filter((w) => !NIGHTLY(pairs, list).includes(w))],
    misses: misses.map(([w, s]) => miss(w, s)),
  }));
  return [day1, ...nights];
}

export const DEMO_SESSIONS: SessionRecord[] = demoSessions();
