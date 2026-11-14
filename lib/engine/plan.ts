import { DOLCH, WORDBANK } from "../../data/wordbank";
import { storyForSkill } from "./content";
import { coreLexicon, type Lexicon } from "./lexicon";
import { allowedSkills } from "./mastery";
import { analyzeWord } from "./phonics";
import { SKILLS, type SkillId } from "./skills";
import type { Plan, Profile } from "./types";

const rotate = <T,>(xs: T[], by: number) => (xs.length ? [...xs.slice(by % xs.length), ...xs.slice(0, by % xs.length)] : xs);

export function wordListFor(focus: SkillId, allowed: SkillId[], round = 1, n = 5, lex: Lexicon = coreLexicon): string[] {
  const allow = new Set<SkillId>([...allowed, focus]);
  let pool: string[];
  if (focus === "tricky") {
    pool = DOLCH.filter((w) => analyzeWord(w, lex)?.tricky && w.length > 2 && !w.includes("'"));
  } else {
    pool = WORDBANK.filter((w) => {
      const A = analyzeWord(w, lex);
      if (!A || !A.decodable || !A.skills.every((s) => allow.has(s))) return false;
      if (focus === "bd") return /[bd]/.test(w);
      if (focus === "guessing") return w.length >= 4;
      return A.skills.includes(focus);
    });
  }
  return rotate(pool, (round - 1) * n).slice(0, n);
}

export function buildPlan(profile: Profile, childName: string, lex: Lexicon = coreLexicon): Plan {
  const focus = profile.focus;
  const info = SKILLS[focus];
  const allowed = allowedSkills(profile);
  const story = storyForSkill(focus);
  return {
    focus,
    round: profile.round,
    pairs: rotate(info.pairs, profile.round - 1).slice(0, 3),
    wordList: wordListFor(focus, allowed, profile.round, 5, lex),
    story: { id: story.id, title: story.title },
    scripts: info.scripts(childName),
  };
}
