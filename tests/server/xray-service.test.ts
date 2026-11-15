import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { buildXray } from "@/lib/engine";
import { acceptTip, coachPrompt, coachTip } from "@/lib/server/xray-service";

const x = buildXray("bike", "bik")!;

describe("x-ray coach tip guardrails", () => {
  it("feeds the model only engine facts", () => {
    const p = coachPrompt(x, "Cover the e.");
    expect(p).toContain("Word: bike");
    expect(p).toContain("Child said: bik");
    expect(p).toContain("Fact: ");
  });

  it("accepts a short tip that names the word", () => {
    expect(acceptTip("“Mia read every letter in bike, but the quiet e should make the i say its name.”", x)).toMatch(/^Mia/);
  });

  it("rejects diagnoses, numbers, or tips that ignore the word", () => {
    expect(acceptTip("This may be a sign of dyslexia in bike.", x)).toBeNull();
    expect(acceptTip("She missed 3 sounds in bike.", x)).toBeNull();
    expect(acceptTip("Great effort tonight!", x)).toBeNull();
  });

  it("falls back to null when the writer fails or is missing", async () => {
    expect(await coachTip(x, "", null)).toBeNull();
    expect(await coachTip(x, "", { write: async () => Promise.reject(new Error("down")) })).toBeNull();
    expect(await coachTip(x, "", { write: async () => "The quiet e in bike makes i say its name." })).toMatch(/quiet e/);
  });
});

describe("plain punctuation from the model", () => {
  it("turns dashes, semicolons and ellipses into plain punctuation", async () => {
    const { plainPunctuation } = await import("@/lib/engine");
    expect(plainPunctuation("Jake ran — fast; then… home")).toBe("Jake ran, fast, then... home");
    expect(acceptTip("The quiet e in bike — it makes i say its name.", x)).toBe("The quiet e in bike, it makes i say its name.");
  });
});
