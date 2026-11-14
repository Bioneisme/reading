import { describe, expect, it } from "vitest";
import { STORY_NAMES } from "@/data/wordbank";
import { PASSAGES, STORIES, validateStory, PHONICS_SKILLS, SKILL_ORDER, annotateText, type SkillId } from "@/lib/engine";
import { fullLexicon } from "./helpers";

function allowedFor(focus: SkillId): SkillId[] {
  const i = PHONICS_SKILLS.indexOf(focus);
  return PHONICS_SKILLS.slice(0, (i >= 0 ? i : PHONICS_SKILLS.indexOf("endings")) + 1);
}

describe("story library", () => {
  it("has a story for every skill", () => {
    for (const s of SKILL_ORDER) expect(STORIES.some((x) => x.focus === s), s).toBe(true);
  });
  for (const story of STORIES) {
    it(`${story.title} passes the validator`, () => {
      const r = validateStory(story.text, allowedFor(story.focus), { names: STORY_NAMES });
      expect(r.bad).toEqual([]);
    });
    it(`${story.title} is 55–100 words and practices its focus`, () => {
      const tokens = annotateText(story.text).filter((t) => t.word);
      expect(tokens.length).toBeGreaterThanOrEqual(55);
      expect(tokens.length).toBeLessThanOrEqual(100);
      if (PHONICS_SKILLS.includes(story.focus)) {
        expect(tokens.filter((t) => t.practices.includes(story.focus)).length).toBeGreaterThanOrEqual(5);
      }
    });
  }
  it("every passage and story word is in the client lexicon", () => {
    const words = [...PASSAGES, ...STORIES].flatMap((p) => annotateText(p.text)).filter((t) => t.word);
    const unknown = words.filter((t) => t.practices.length === 0 && !t.tricky).map((t) => t.word);
    const reallyUnknown = unknown.filter((w) => fullLexicon().get(w!) === undefined);
    expect(reallyUnknown).toEqual([]);
  });
});

describe("validator", () => {
  it("rejects words outside the allowed skills", () => {
    const r = validateStory("The cat sat in the rain.", ["shortVowels"]);
    expect(r.bad).toEqual(["rain"]);
  });
  it("rejects irregular non-sight words", () => {
    expect(validateStory("A cow sat.", ["shortVowels"]).bad).toEqual(["cow"]);
  });
  it("accepts sight words and names", () => {
    expect(validateStory("Jake said they were here.", ["shortVowels"], { names: ["Jake"] }).ok).toBe(true);
  });
  it("rejects unknown words", () => {
    expect(validateStory("The zorbix sat.", ["shortVowels"], { lex: fullLexicon() }).bad).toEqual(["zorbix"]);
  });
});
