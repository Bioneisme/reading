import { describe, expect, it } from "vitest";
import { classifyMiss } from "@/lib/engine/classify";
import { coreLexicon } from "@/lib/engine/lexicon";
import { fullLexicon } from "./helpers";

export const CONTROL: [string, string, string][] = [
  ["tape", "tap", "magicE"],
  ["ship", "sip", "digraphs"],
  ["stop", "sop", "initialBlends"],
  ["jumped", "jump", "endings"],
  ["dig", "big", "bd"],
  ["horse", "house", "guessing"],
  ["rain", "ran", "vowelTeams"],
  ["bird", "bid", "rControlled"],
  ["said", "sed", "tricky"],
  ["bed", "bad", "shortVowels"],
];

const EXTRA: [string, string | null, string][] = [
  ["bike", "bik", "magicE"],
  ["home", "hom", "magicE"],
  ["cake", "cak", "magicE"],
  ["rides", "runs", "guessing"],
  ["rides", "rids", "magicE"],
  ["ship", "s-hip", "digraphs"],
  ["ship", "hip", "digraphs"],
  ["with", "wit", "digraphs"],
  ["jump", "jum", "finalBlends"],
  ["hand", "had", "finalBlends"],
  ["trip", "tip", "initialBlends"],
  ["light", "lit", "vowelTeams"],
  ["boat", "bot", "vowelTeams"],
  ["car", "cat", "guessing"],
  ["hopped", "hop", "endings"],
  ["cats", "cat", "endings"],
  ["big", "dig", "bd"],
  ["was", "saw", "tricky"],
  ["the", null, "tricky"],
  ["cake", null, "magicE"],
  ["sun", "sat", "guessing"],
  ["pig", "pug", "shortVowels"],
  ["dog", "cat", "other"],
];

for (const [name, lex] of [["full", fullLexicon], ["core", () => coreLexicon]] as const) {
  describe(`classifyMiss (${name} lexicon)`, () => {
    it("control set: 10 of 10", () => {
      const wrong = CONTROL.filter(([t, s, skill]) => classifyMiss(t, s, lex()) !== skill);
      expect(wrong).toEqual([]);
    });
    for (const [t, s, skill] of EXTRA) {
      it(`${t} → ${s ?? "(skipped)"} = ${skill}`, () => expect(classifyMiss(t, s, lex())).toBe(skill));
    }
  });
}
