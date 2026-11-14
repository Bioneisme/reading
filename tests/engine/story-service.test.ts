import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { buildPrompt, generateStory, type StoryWriter } from "@/lib/server/story-service";
import { fullLexicon } from "./helpers";

const req = { focus: "magicE" as const, allowed: ["shortVowels" as const], childName: "Mia" };
const GOOD = {
  title: "Jake and the Kite",
  text: "Jake has a kite. It is red and white. Jake and Mom ride a bike to the lake. Jake can see a big pine. Jake said, \"Let me fly my kite!\" Up, up went the kite. It rode up to the sun. Mom gave Jake a cake. Jake ate the cake at the lake. It is a fine kite and a fine cake, said Mom. Jake had a fun time. Then they rode home.",
};
const BAD = { title: "The Rain", text: GOOD.text.replace("kite. It is", "kite in the rain. It is") };
const writer = (...drafts: (typeof GOOD | Error)[]): StoryWriter & { calls: string[] } => {
  const calls: string[] = [];
  return {
    calls,
    async write(p) {
      calls.push(p);
      const d = drafts[Math.min(calls.length - 1, drafts.length - 1)];
      if (d instanceof Error) throw d;
      return d;
    },
  };
};

describe("generateStory", () => {
  it("accepts a valid LLM draft", async () => {
    const r = await generateStory(req, { writer: writer(GOOD), lex: fullLexicon() });
    expect(r.source).toBe("llm");
    expect(r.attempts).toBe(1);
    expect(r.tokens.some((t) => t.practices.includes("magicE"))).toBe(true);
  });
  it("retries with the rejected words, then accepts", async () => {
    const w = writer(BAD, GOOD);
    const r = await generateStory(req, { writer: w, lex: fullLexicon() });
    expect(r.source).toBe("llm");
    expect(r.attempts).toBe(2);
    expect(r.rejected).toContain("rain");
    expect(w.calls[1]).toContain("cannot read yet: rain");
  });
  it("falls back to the library after 3 bad drafts", async () => {
    const w = writer(BAD);
    const r = await generateStory(req, { writer: w, lex: fullLexicon() });
    expect(w.calls).toHaveLength(3);
    expect(r.attempts).toBe(3);
    expect(r.source).toBe("library");
    expect(r.story.title).toBe("Jake's Kite");
  });
  it("falls back to the library when the writer fails or is missing", async () => {
    expect((await generateStory(req, { writer: writer(new Error("timeout")), lex: fullLexicon() })).source).toBe("library");
    expect((await generateStory(req, { writer: null, lex: fullLexicon() })).source).toBe("library");
  });
  it("prompt lists focus words and only allowed vocabulary", () => {
    const p = buildPrompt(req, fullLexicon());
    expect(p).toMatch(/FOCUS words: .*\bcake\b/);
    expect(p).not.toMatch(/ALLOWED WORDS: .*\brain\b/);
    expect(p).toMatch(/ALLOWED WORDS: .*\bsaid\b/);
  });
});
