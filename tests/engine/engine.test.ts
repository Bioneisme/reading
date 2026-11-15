import { describe, expect, it } from "vitest";
import {
  analyzeWord, buildPlan, classifyMiss, computeProfile, getDistractors, summarizeCheck, tokenize, wordsOfText,
  type Miss, type SessionRecord,
} from "./api";
import { CONTROL } from "./classify.test";

const JAKE = "Jake has a red bike. He rides to the lake with his dad. The sun is hot. Jake and Dad swim and splash. Then they ride home. Mom made a cake! Jake ate a big slice.";
const miss = (word: string, said: string | null): Miss => ({ word, said, skill: classifyMiss(word, said) });
const MIA_DAY1 = [miss("bike", "bik"), miss("home", "hom"), miss("cake", "cak"), miss("rides", "runs")];

describe("analyzeWord", () => {
  it.each([
    ["tape", ["magicE"]],
    ["ship", ["shortVowels", "digraphs"]],
    ["splash", ["shortVowels", "digraphs", "initialBlends"]],
    ["jumped", ["shortVowels", "finalBlends", "endings"]],
    ["light", ["vowelTeams"]],
    ["bird", ["rControlled"]],
  ])("%s → %j", (w, skills) => expect(analyzeWord(w)?.skills).toEqual(skills));
  it("marks irregular Dolch words as tricky", () => {
    for (const w of ["said", "was", "the", "they", "have", "of"]) expect(analyzeWord(w)?.tricky, w).toBe(true);
  });
  it("does not mark decodable Dolch words as tricky", () => {
    for (const w of ["big", "jump", "ride", "stop", "red"]) expect(analyzeWord(w)?.tricky, w).toBe(false);
  });
  it("splits suffixes with spelling changes", () => {
    expect(analyzeWord("hopped")?.base).toBe("hop");
    expect(analyzeWord("rides")?.base).toBe("ride");
    expect(analyzeWord("running")?.base).toBe("run");
  });
});

describe("tokenize", () => {
  it("round-trips text and normalizes words", () => {
    const t = tokenize("Mom made a cake! “Yes,” said Jake.");
    expect(t.map((x) => x.text).join("")).toBe("Mom made a cake! “Yes,” said Jake.");
    expect(t.filter((x) => x.word).map((x) => x.word)).toEqual(["mom", "made", "a", "cake", "yes", "said", "jake"]);
  });
});

describe("getDistractors", () => {
  it("offers 2–4 options for every passage word longer than one letter", () => {
    expect(getDistractors("a")).toEqual([]);
    for (const w of wordsOfText(JAKE).filter((x) => x.length > 1)) {
      const d = getDistractors(w);
      expect(d.length, w).toBeGreaterThanOrEqual(2);
      expect(d.length, w).toBeLessThanOrEqual(4);
      expect(new Set(d.map((x) => x.said)).size).toBe(d.length);
      expect(d.some((x) => x.said === w)).toBe(false);
    }
  });
  it("each option is classified as the skill it claims", () => {
    for (const w of [...wordsOfText(JAKE), ...CONTROL.map((c) => c[0])])
      for (const d of getDistractors(w)) expect(classifyMiss(w, d.said), `${w}→${d.said}`).toBe(d.skill);
  });
  it("puts the pattern misreading first", () => {
    expect(getDistractors("bike")[0]).toEqual({ said: "bik", skill: "magicE" });
    expect(getDistractors("tape")[0]).toEqual({ said: "tap", skill: "magicE" });
    expect(getDistractors("rain")[0]).toEqual({ said: "ran", skill: "vowelTeams" });
    expect(getDistractors("dig").map((d) => d.said)).toContain("big");
  });
  it("includes a first-letter guess", () => {
    expect(getDistractors("bike").some((d) => d.skill === "guessing")).toBe(true);
  });
});

describe("summarizeCheck", () => {
  it("Mia day 1: Magic e — 3 of 4 misses", () => {
    const s = summarizeCheck(wordsOfText(JAKE), MIA_DAY1);
    expect(s.weakSpot).toBe("magicE");
    expect(s.bySkill[0]).toMatchObject({ skill: "magicE", count: 3 });
    expect(s.bySkill[1]).toMatchObject({ skill: "guessing", count: 1 });
    expect(s.totalMisses).toBe(4);
  });
  it("no misses → no weak spot", () => expect(summarizeCheck(wordsOfText(JAKE), []).weakSpot).toBeNull());
});

const session = (day: number, words: string[], misses: Miss[], focus?: SessionRecord["focus"]): SessionRecord => ({
  id: `s${day}`, date: `2026-11-${10 + day}T19:30:00Z`, day, kind: day === 1 ? "check" : "nightly", focus, words, misses,
});

describe("computeProfile", () => {
  it("day 1: focus is Magic e, short vowels look solid", () => {
    const p = computeProfile([session(1, wordsOfText(JAKE), MIA_DAY1)]);
    expect(p.focus).toBe("magicE");
    expect(p.skills.magicE.status).toBe("needsWork");
    expect(p.skills.shortVowels.status).toBe("mastered");
    expect(p.skills.vowelTeams.status).toBe("notChecked");
    expect(p.round).toBe(1);
  });
  it("day 1: focus follows tonight's weak spot even when another skill has a higher rate", () => {
    const misses = [miss("bike", "bite"), miss("home", "hole"), miss("cake", "cak"), miss("rides", "runs")];
    expect(summarizeCheck(wordsOfText(JAKE), misses).weakSpot).toBe("guessing");
    const p = computeProfile([session(1, wordsOfText(JAKE), misses)]);
    expect(p.focus).toBe("guessing");
    expect(buildPlan(p, "Mia").focus).toBe("guessing");
  });
  it("fewer misses over nights → improving, round grows", () => {
    const words = ["cake", "bike", "home", "kite", "lake", "tape", "ride", "hope", "cute", "time"];
    const sessions = [
      session(1, wordsOfText(JAKE), MIA_DAY1),
      session(2, words, [miss("kite", "kit"), miss("tape", "tap")], "magicE"),
      session(3, words, [miss("hope", "hop")], "magicE"),
    ];
    const p = computeProfile(sessions);
    expect(p.skills.magicE.status).toBe("improving");
    expect(p.missesPerNight).toEqual([4, 2, 1]);
    expect(p.focus).toBe("magicE");
    expect(p.round).toBe(3);
  });
  it("clean nights lead to mastery and a new focus", () => {
    const words = ["cake", "bike", "home", "kite", "lake", "tape", "ride", "hope", "cute", "time"];
    const sessions = [session(1, wordsOfText(JAKE), MIA_DAY1), ...[2, 3, 4, 5, 6].map((d) => session(d, words, [], "magicE"))];
    const p = computeProfile(sessions);
    expect(p.skills.magicE.status).toBe("mastered");
    expect(p.focus).not.toBe("magicE");
  });
});

describe("buildPlan", () => {
  it("plan for Magic e uses only allowed words", () => {
    const p = computeProfile([session(1, wordsOfText(JAKE), MIA_DAY1)]);
    const plan = buildPlan(p, "Mia");
    expect(plan.focus).toBe("magicE");
    expect(plan.pairs.length).toBe(3);
    expect(plan.wordList.length).toBe(5);
    for (const w of plan.wordList) expect(analyzeWord(w)?.skills).toContain("magicE");
    expect(plan.story.title).toBe("Jake's Kite");
    expect(plan.scripts).toHaveLength(3);
  });
});

describe("demo data (Mia, day 5)", () => {
  it("matches the brief: 4→3→3→2→1, short vowels mastered, magic e improving, letter teams next", async () => {
    const { DEMO_SESSIONS } = await import("@/lib/demo");
    const p = computeProfile(DEMO_SESSIONS);
    expect(p.missesPerNight).toEqual([4, 3, 3, 2, 1]);
    expect(p.skills.shortVowels.status).toBe("mastered");
    expect(p.skills.magicE.status).toBe("improving");
    expect(p.skills.digraphs.status).toBe("needsWork");
    expect(p.focus).toBe("magicE");
    expect(p.nextUp).toBe("digraphs");
    expect(p.skills.rControlled.status).toBe("notChecked");
  });
});

describe("skill progress bars", () => {
  it("needs-work bars stay low, improving bars sit in the middle", async () => {
    const { DEMO_SESSIONS } = await import("@/lib/demo");
    const p = computeProfile(DEMO_SESSIONS);
    expect(p.skills.digraphs.status).toBe("needsWork");
    expect(p.skills.digraphs.progress).toBeGreaterThanOrEqual(0.1);
    expect(p.skills.digraphs.progress).toBeLessThanOrEqual(0.25);
    expect(p.skills.magicE.progress).toBeGreaterThanOrEqual(0.55);
    expect(p.skills.magicE.progress).toBeLessThanOrEqual(0.851);
    expect(p.skills.shortVowels.progress).toBe(1);
    expect(p.skills.rControlled.progress).toBe(0);
  });
});

describe("annotateText with allowed skills", () => {
  it("labels sight words outside the allowed skills as tricky", async () => {
    const { annotateText } = await import("@/lib/engine");
    const tokens = annotateText("Then they see a white kite.", undefined, ["shortVowels", "magicE"]);
    const by = Object.fromEntries(tokens.filter((t) => t.word).map((t) => [t.word, t.practices]));
    expect(by.then).toEqual(["tricky"]);
    expect(by.see).toEqual(["tricky"]);
    expect(by.white).toEqual(["tricky"]);
    expect(by.kite).toEqual(["magicE"]);
  });
});
