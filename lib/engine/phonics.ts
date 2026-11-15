import { DOLCH } from "../../data/wordbank";
import { coreLexicon, stressOf, stripStress, type Lexicon } from "./lexicon";
import { PHONICS_SKILLS, SKILL_ORDER, type SkillId } from "./skills";
import { normalizeWord } from "./text";
import type { Segment, SegLabel, WordAnalysis } from "./types";

type Opt = { ph: string[]; label: SegLabel };
const o = (ph: string, label: SegLabel): Opt => ({ ph: ph ? ph.split(" ") : [], label });

export const VOWELS = new Set(["a", "e", "i", "o", "u"]);
export const SHORT: Record<string, string[]> = {
  a: ["AE"],
  e: ["EH"],
  i: ["IH"],
  o: ["AA", "AO"],
  u: ["AH"],
  y: ["IH"],
};
const LONG: Record<string, string[]> = {
  a: ["EY"],
  e: ["IY"],
  i: ["AY"],
  o: ["OW"],
  u: ["UW", "Y UW"],
  y: ["AY", "IY"],
};

const TABLE: Record<string, Opt[]> = {};
const add = (g: string, ...opts: Opt[]) => (TABLE[g] = [...(TABLE[g] ?? []), ...opts]);

const CONS: Record<string, string[]> = {
  b: ["B"], d: ["D"], f: ["F"], h: ["HH"], j: ["JH"], k: ["K"], l: ["L"], m: ["M"], n: ["N", "NG"],
  p: ["P"], r: ["R"], s: ["S", "Z"], t: ["T"], v: ["V"], w: ["W"], z: ["Z"], c: ["K"], g: ["G"],
  x: ["K S", "G Z"], y: ["Y"],
};
for (const [g, phs] of Object.entries(CONS)) for (const ph of phs) add(g, o(ph, "C"));
add("c", o("S", "X"));
add("g", o("JH", "X"));
add("s", o("SH", "X"), o("ZH", "X"));
for (const d of ["bb", "dd", "ff", "gg", "ll", "mm", "nn", "pp", "rr", "ss", "tt", "zz"]) add(d, o(CONS[d[0]][0], "C"));
add("qu", o("K W", "C"));
add("sh", o("SH", "DG"));
add("ch", o("CH", "DG"), o("K", "X"), o("SH", "X"));
add("th", o("TH", "DG"), o("DH", "DG"));
add("wh", o("W", "DG"), o("HH", "X"));
add("ck", o("K", "DG"));
add("ng", o("NG", "DG"));
add("tch", o("CH", "DG"));
add("ph", o("F", "X"));
add("kn", o("N", "X"));
add("wr", o("R", "X"));
add("dge", o("JH", "X"));
add("gh", o("", "X"));
add("mb", o("M", "X"));
const ANY_VOWEL = ["AE", "EH", "IH", "AA", "AO", "AH", "EY", "IY", "AY", "OW", "UW", "Y UW", "UH", "ER"];
for (const v of ["a", "e", "i", "o", "u", "y"]) for (const ph of ANY_VOWEL) add(v, o(ph, "V"));
add("e", o("", "E0"));
add("ai", o("EY", "VT"));
add("ay", o("EY", "VT"));
add("ee", o("IY", "VT"));
add("ea", o("IY", "VT"), o("EH", "X"), o("EY", "X"));
add("oa", o("OW", "VT"));
add("igh", o("AY", "VT"));
add("ow", o("OW", "VT"), o("AW", "X"));
add("oe", o("OW", "VT"));
for (const [g, phs] of Object.entries({
  oo: ["UW", "UH", "AH"], ou: ["AW", "UW", "AH", "OW", "UH", "AO"], oi: ["OY"], oy: ["OY"], au: ["AO", "AA"],
  aw: ["AO", "AA"], ew: ["UW", "Y UW"], ue: ["UW", "Y UW"], ey: ["IY", "EY"], ei: ["EY", "IY"], ui: ["UW", "IH"],
  ie: ["IY", "AY"], eigh: ["EY"], ear: ["IH R", "ER", "EH R"], air: ["EH R"], our: ["AW R", "AO R", "ER"],
})) for (const ph of phs) add(g, o(ph, "X"));
add("ar", o("AA R", "RC"));
add("or", o("AO R", "RC"));
add("er", o("ER", "RC"));
add("ir", o("ER", "RC"));
add("ur", o("ER", "RC"));

const GRAPHEMES = Object.keys(TABLE).sort((a, b) => b.length - a.length);

function align(letters: string, pron: string[]): Segment[] | null {
  const bare = pron.map(stripStress);
  const memo = new Map<string, { cost: number; segs: Segment[] } | null>();
  const go = (i: number, j: number): { cost: number; segs: Segment[] } | null => {
    if (i === letters.length) return j === bare.length ? { cost: 0, segs: [] } : null;
    const key = `${i},${j}`;
    if (memo.has(key)) return memo.get(key)!;
    let best: { cost: number; segs: Segment[] } | null = null;
    for (const g of GRAPHEMES) {
      if (!letters.startsWith(g, i)) continue;
      for (const opt of TABLE[g]) {
        const n = opt.ph.length;
        if (j + n > bare.length) continue;
        let ok = true;
        for (let k = 0; k < n; k++) if (bare[j + k] !== opt.ph[k]) ok = false;
        if (!ok) continue;
        const rest = go(i + g.length, j + n);
        if (!rest) continue;
        const cost = rest.cost + 1 + (opt.label === "X" ? 5 : 0);
        if (!best || cost < best.cost) {
          const seg: Segment = { g, ph: opt.ph, label: opt.label };
          if (opt.label === "V" || opt.label === "VT" || opt.label === "RC") {
            const vowelPh = pron.slice(j, j + n).find((p) => /\d/.test(p));
            seg.stress = vowelPh ? stressOf(vowelPh) : undefined;
          }
          best = { cost, segs: [seg, ...rest.segs] };
        }
      }
    }
    memo.set(key, best);
    return best;
  };
  return go(0, 0)?.segs ?? null;
}

const isVowelSeg = (s: Segment) => s.label === "V" || s.label === "VT" || s.label === "RC";
const isConsSeg = (s: Segment) => s.label === "C" || s.label === "DG" || (s.label === "X" && !VOWELS.has(s.g[0]));
const phStr = (s: Segment) => s.ph.join(" ");

function tagSegments(segs: Segment[]): { skills: Set<SkillId>; decodable: boolean } {
  const skills = new Set<SkillId>();
  let decodable = true;
  const vowelIdx = segs.map((s, k) => (isVowelSeg(s) ? k : -1)).filter((k) => k >= 0);
  const usedE = new Set<number>();
  if (vowelIdx.length === 0) decodable = false;

  for (const k of vowelIdx) {
    const s = segs[k];
    if (s.label === "VT") { s.role = "vowelTeams"; skills.add("vowelTeams"); continue; }
    if (s.label === "RC") { s.role = "rControlled"; skills.add("rControlled"); continue; }
    const letter = s.g;
    const ph = phStr(s);
    const next = segs[k + 1];
    const closed = !!next && isConsSeg(next);
    if (LONG[letter]?.includes(ph) && closed && segs[k + 2]?.label === "E0" && k + 2 === segs.length - 1 && next.label !== "X") {
      s.role = "magicE";
      segs[k + 2].role = "magicE";
      usedE.add(k + 2);
      skills.add("magicE");
    } else if (SHORT[letter]?.includes(ph) && closed && (s.stress ?? 1) >= 1 && letter !== "y") {
      s.role = "shortVowels";
      skills.add("shortVowels");
    } else if ((ph === "AH" || ph === "IH") && s.stress === 0 && vowelIdx.length >= 2 && closed) {
      s.role = "shortVowels";
      skills.add("shortVowels");
    } else {
      decodable = false;
    }
  }
  segs.forEach((s, k) => {
    if (s.label === "X") decodable = false;
    if (s.label === "E0" && !usedE.has(k)) decodable = false;
    if (s.label === "DG") { s.role = "digraphs"; skills.add("digraphs"); }
  });
  if (vowelIdx.length) {
    const first = vowelIdx[0];
    const last = vowelIdx[vowelIdx.length - 1];
    const onset = segs.slice(0, first).filter(isConsSeg);
    const coda = segs.slice(last + 1).filter(isConsSeg);
    if (onset.length >= 2) { skills.add("initialBlends"); onset.forEach((s) => (s.blend = "initial")); }
    if (coda.length >= 2) { skills.add("finalBlends"); coda.forEach((s) => (s.blend = "final")); }
  }
  return { skills, decodable };
}

const SUFFIX_PH: Record<string, string[][]> = {
  ing: [["IH", "NG"]],
  ed: [["T"], ["D"], ["IH", "D"], ["AH", "D"]],
  es: [["IH", "Z"], ["AH", "Z"]],
  s: [["S"], ["Z"]],
};

function suffixBases(w: string): { base: string; suffix: WordAnalysis["suffix"] }[] {
  const out: { base: string; suffix: WordAnalysis["suffix"] }[] = [];
  const dbl = (stem: string) =>
    stem.length >= 3 && stem.at(-1) === stem.at(-2) && !"lsfz".includes(stem.at(-1)!) ? [stem.slice(0, -1)] : [];
  if (w.endsWith("ing") && w.length > 4) {
    const stem = w.slice(0, -3);
    for (const b of [...dbl(stem), stem + "e", stem]) out.push({ base: b, suffix: "ing" });
  }
  if (w.endsWith("ed") && w.length > 3 && !VOWELS.has(w.at(-3)!)) {
    const stem = w.slice(0, -2);
    for (const b of [...dbl(stem), stem]) out.push({ base: b, suffix: "ed" });
  }
  if (w.endsWith("ed") && w.length > 3 && w.at(-3) !== "e") out.push({ base: w.slice(0, -1), suffix: "ed" });
  if (w.endsWith("es") && w.length > 3) out.push({ base: w.slice(0, -2), suffix: "es" });
  if (w.endsWith("s") && !w.endsWith("ss") && !w.endsWith("'s") && w.length > 2) out.push({ base: w.slice(0, -1), suffix: "s" });
  return out.filter((c) => c.base.length >= 3 && /[aeiouy]/.test(c.base));
}

const eq = (a: string[], b: string[]) => a.length === b.length && a.every((x, i) => x === b[i]);

export const DOLCH_SET = new Set(DOLCH);
const cache = new WeakMap<Lexicon, Map<string, WordAnalysis | null>>();

export function analyzeWord(input: string, lex: Lexicon = coreLexicon): WordAnalysis | null {
  const word = normalizeWord(input);
  let byLex = cache.get(lex);
  if (!byLex) cache.set(lex, (byLex = new Map()));
  if (byLex.has(word)) return byLex.get(word)!;
  const result = analyzeUncached(word, lex);
  byLex.set(word, result);
  return result;
}

function bestAlignment(letters: string, prons: string[][]) {
  let best: { segs: Segment[]; pron: string[]; tag: ReturnType<typeof tagSegments> } | null = null;
  for (const pron of prons) {
    const segs = align(letters, pron);
    if (!segs) continue;
    const tag = tagSegments(segs);
    if (!best || (tag.decodable && !best.tag.decodable)) best = { segs, pron, tag };
  }
  return best;
}

function analyzeUncached(word: string, lex: Lexicon): WordAnalysis | null {
  const prons = lex.get(word);
  if (!word || !prons) return null;

  let base = word;
  let suffix: WordAnalysis["suffix"] = "";
  let basePron = prons[0];
  let suffixPh: string[] = [];
  let baseProns = prons;
  outer: for (const c of suffixBases(word)) {
    const bp = lex.get(c.base);
    if (!bp) continue;
    for (const p of prons) for (const b of bp) for (const sp of SUFFIX_PH[c.suffix]) {
      if (eq(p.map(stripStress), [...b.map(stripStress), ...sp])) {
        base = c.base; suffix = c.suffix; basePron = b; suffixPh = sp; baseProns = [b];
        break outer;
      }
    }
  }

  const al = bestAlignment(base, baseProns);
  const segments = al?.segs ?? null;
  const skills = new Set<SkillId>(al?.tag.skills ?? []);
  if (suffix) skills.add("endings");
  const decodable = !!al && al.tag.decodable;
  const tricky = DOLCH_SET.has(word) && !decodable;
  const ordered = SKILL_ORDER.filter((s) => skills.has(s) && PHONICS_SKILLS.includes(s));

  const practices = new Set<SkillId>(ordered);
  if (tricky) practices.add("tricky");
  else practices.add("guessing");
  if (/[bd]/.test(word)) practices.add("bd");

  return {
    word,
    base,
    suffix,
    suffixPh,
    pron: (al ? al.pron : basePron).map(stripStress).concat(suffixPh),
    segments,
    skills: ordered,
    decodable,
    tricky,
    practices: SKILL_ORDER.filter((s) => practices.has(s)),
  };
}

const NAIVE: [string, string[]][] = [
  ["tch", ["CH"]], ["igh", ["AY"]], ["sh", ["SH"]], ["ch", ["CH"]], ["th", ["TH"]], ["wh", ["W"]], ["ck", ["K"]],
  ["ng", ["NG"]], ["ph", ["F"]], ["qu", ["K", "W"]], ["ai", ["EY"]], ["ay", ["EY"]], ["ee", ["IY"]], ["ea", ["IY"]],
  ["oa", ["OW"]], ["ow", ["OW"]], ["oo", ["UW"]], ["ou", ["AW"]], ["oi", ["OY"]], ["oy", ["OY"]], ["aw", ["AO"]],
  ["ar", ["AA", "R"]], ["or", ["AO", "R"]], ["er", ["ER"]], ["ir", ["ER"]], ["ur", ["ER"]],
  ["x", ["K", "S"]], ["c", ["K"]], ["y", ["Y"]],
];

function naivePron(input: string): string[] {
  const w = normalizeWord(input).replace(/'/g, "");
  let b = w;
  let suf: string[] = [];
  if (w.endsWith("ing") && w.length > 4) { b = w.slice(0, -3); suf = ["IH", "NG"]; }
  else if (w.endsWith("ed") && w.length > 3) { b = w.slice(0, -2); suf = ["D"]; }
  const out: string[] = [];
  let i = 0;
  while (i < b.length) {
    const ch = b[i];
    if (VOWELS.has(ch)) {
      const team = NAIVE.find(([g]) => VOWELS.has(g[0]) && b.startsWith(g, i));
      if (team) { out.push(...team[1]); i += team[0].length; continue; }
      const magic = i + 2 === b.length - 1 && b[i + 2] === "e" && !VOWELS.has(b[i + 1]);
      if (ch === "e" && i === b.length - 1 && i > 0) { i++; continue; }
      out.push(...(magic ? LONG[ch][0] : SHORT[ch][0]).split(" "));
      i++;
      continue;
    }
    const dg = NAIVE.find(([g]) => !VOWELS.has(g[0]) && b.startsWith(g, i));
    if (dg) {
      if (dg[0] === "y" && i > 0) { out.push(i === b.length - 1 ? "IY" : "IH"); i++; continue; }
      out.push(...dg[1]); i += dg[0].length; continue;
    }
    if (i + 1 < b.length && b[i + 1] === ch) { i++; continue; }
    if (CONS[ch]) out.push(CONS[ch][0]);
    i++;
  }
  return [...out, ...suf];
}

export function pronounce(word: string, lex: Lexicon = coreLexicon): string[][] {
  const w = normalizeWord(word);
  const p = lex.get(w);
  return p ? p.map((x) => x.map(stripStress)) : [naivePron(w)];
}
