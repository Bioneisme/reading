import { describe, expect, it } from "vitest";
import { buildXray, friendlySound } from "@/lib/engine/xray";

const broken = (x: ReturnType<typeof buildXray>) => x!.tiles.filter((t) => t.broken).map((t) => t.letters);

describe("error x-ray", () => {
  it("bike → bik: the i and the quiet e are the broken tiles", () => {
    const x = buildXray("bike", "bik")!;
    expect(x.skill).toBe("magicE");
    expect(x.tiles.map((t) => t.letters).join("")).toBe("bike");
    expect(broken(x)).toEqual(["i", "e"]);
    const i = x.tiles.find((t) => t.letters === "i")!;
    expect(i.sound).toBe("ī");
    expect(i.said).toBe("i");
    expect(x.tiles.find((t) => t.letters === "e")!.silent).toBe(true);
    expect(x.facts.join(" ")).toMatch(/quiet e/);
  });

  it("ship → sip: only the sh team is broken", () => {
    const x = buildXray("ship", "sip")!;
    expect(x.skill).toBe("digraphs");
    expect(broken(x)).toEqual(["sh"]);
  });

  it("jumped → jump: the ending tile is broken", () => {
    const x = buildXray("jumped", "jump")!;
    expect(x.skill).toBe("endings");
    expect(broken(x)).toEqual(["ed"]);
  });

  it("a skipped word marks the skill's tiles and says so", () => {
    const x = buildXray("cake", null)!;
    expect(x.said).toBeNull();
    expect(broken(x).length).toBeGreaterThan(0);
    expect(x.facts.join(" ")).toMatch(/skipped/);
  });

  it("returns null for unknown words", () => {
    expect(buildXray("zzzqx", "z")).toBeNull();
  });

  it("turns phonemes into parent-friendly sounds", () => {
    expect(friendlySound(["B", "AY1", "K"])).toBe("bīk");
  });
});
