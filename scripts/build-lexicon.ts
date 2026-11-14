import { readFileSync, writeFileSync } from "node:fs";
import { DOLCH, STORY_NAMES, WORDBANK } from "../data/wordbank";
import { PASSAGES, STORIES } from "../lib/engine/content";
import { getDistractors } from "../lib/engine/distractors";
import { createLexicon, parseCmudict } from "../lib/engine/lexicon";
import { SKILLS } from "../lib/engine/skills";
import { wordsOf } from "../lib/engine/text";

const all = parseCmudict(readFileSync("data/raw/cmudict.dict", "utf8"));
const full = createLexicon(all);

const words = new Set<string>([
  ...WORDBANK,
  ...DOLCH,
  ...STORY_NAMES.map((n) => n.toLowerCase()),
  ...PASSAGES.flatMap((p) => wordsOf(p.text)),
  ...STORIES.flatMap((s) => wordsOf(s.text)),
  ...Object.values(SKILLS).flatMap((s) => s.pairs.flat()),
  ..."house runs sip hip sop bid ran sed sad bad dig big book bake tap wit jump hop cat had tip lit bot".split(" "),
]);
for (const w of [...words]) for (const b of [w.slice(0, -1), w.slice(0, -2), w.slice(0, -3), w.slice(0, -3) + "e", w.slice(0, -4)]) if (all[b]) words.add(b);
for (const w of [...words]) for (const d of getDistractors(w, full)) if (all[d.said]) words.add(d.said);

const missing = [...words].filter((w) => !all[w]);
const out: Record<string, string[]> = {};
for (const w of [...words].sort()) if (all[w]) out[w] = all[w];
writeFileSync("data/lexicon-core.json", JSON.stringify(out));
console.log(`lexicon-core: ${Object.keys(out).length} words; not in CMUdict: ${missing.join(", ") || "none"}`);
