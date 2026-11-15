import { describe, expect, it } from "vitest";
import { detectPatterns } from "@/lib/engine/patterns";
import type { SessionRecord } from "@/lib/engine";
import { DEMO_SESSIONS } from "@/lib/demo";

const night = (day: number, words: string[], misses: SessionRecord["misses"]): SessionRecord => ({
  id: `n${day}`,
  date: `2026-11-${String(10 + day).padStart(2, "0")}T19:00:00.000Z`,
  day,
  kind: "nightly",
  words,
  misses,
});

describe("detectPatterns", () => {
  it("needs at least two nights", () => {
    expect(detectPatterns([DEMO_SESSIONS[0]])).toEqual([]);
  });

  it("finds the quiet-e and letter-team patterns in the demo week, with real swaps and a falling trend", () => {
    const notices = detectPatterns(DEMO_SESSIONS);
    const magic = notices.find((n) => n.skill === "magicE")!;
    expect(magic.title).toMatch(/quiet e/);
    expect(magic.evidence).toBe("Based on 8 words over 4 nights");
    expect(magic.trend![0]).toBeGreaterThan(magic.trend![magic.trend!.length - 1]);
    expect(magic.detail).toMatch(/Fewer each night/);
    const teams = notices.find((n) => n.skill === "digraphs")!;
    expect(teams.swaps).toEqual(expect.arrayContaining(["sh: /sh/ → /s/", "th: /th/ → /t/"]));
  });

  it("ignores a skill seen on only one night", () => {
    const n = detectPatterns([
      night(1, ["ship", "shop", "shed"], [
        { word: "ship", said: "sip", skill: "digraphs" },
        { word: "shop", said: "sop", skill: "digraphs" },
        { word: "shed", said: "sed", skill: "digraphs" },
      ]),
      night(2, ["cat"], []),
    ]);
    expect(n.find((x) => x.skill === "digraphs")).toBeUndefined();
  });

  it("celebrates words that were missed and later read right", () => {
    const n = detectPatterns([
      night(1, ["bike", "kite", "cat"], [
        { word: "bike", said: "bik", skill: "magicE" },
        { word: "kite", said: "kit", skill: "magicE" },
      ]),
      night(2, ["bike", "kite", "dog"], []),
    ]);
    const fixed = n.find((x) => x.id === "fixed")!;
    expect(fixed.examples.map((e) => e.word)).toEqual(["bike", "kite"]);
  });

  it("never uses diagnostic language", () => {
    const text = JSON.stringify(detectPatterns(DEMO_SESSIONS));
    expect(text).not.toMatch(/dyslexi|disorder|delay|behind|diagnos/i);
  });
});
