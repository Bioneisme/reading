import { LONG, SHORT, VOWELS } from "./phonics";
import type { SkillId } from "./skills";
import type { Segment, WordAnalysis } from "./types";

export interface Variant {
  skill: SkillId;
  spelling: string;
  prons: string[][];
}

const LETTER_SOUND: Record<string, string> = { s: "S", h: "HH", c: "K", t: "T", w: "W", n: "N", g: "G", k: "K" };
const SHORT_ALL = ["AE", "EH", "IH", "AA", "AO", "AH"];
const SHORT_LETTERS = ["a", "e", "i", "o", "u"];

const lettersOf = (segs: Segment[]) => segs.map((s) => s.g).join("");
const phOf = (segs: Segment[]) => segs.flatMap((s) => s.ph);

function withSuffix(A: WordAnalysis, newBase: string): string {
  if (!A.suffix) return newBase;
  const stem = A.word.slice(0, A.word.length - A.suffix.length);
  if (stem === A.base) return newBase + A.suffix;
  if (stem === A.base + A.base.at(-1)) return newBase + newBase.at(-1) + A.suffix;
  if (stem + "e" === A.base) return (newBase.endsWith("e") ? newBase.slice(0, -1) : newBase) + A.suffix;
  if (A.suffix === "ed" && A.word === A.base + "d") return newBase + (newBase.endsWith("e") ? "d" : "ed");
  return newBase + A.suffix;
}

function edit(A: WordAnalysis, k: number, rep: { g: string; phs: string[][] } | null): { spelling: string; prons: string[][] } {
  const segs = A.segments!;
  const before = segs.slice(0, k);
  const after = segs.slice(k + 1);
  const g = rep ? rep.g : "";
  const phs = rep ? rep.phs : [[]];
  return {
    spelling: withSuffix(A, lettersOf(before) + g + lettersOf(after)),
    prons: phs.map((ph) => [...phOf(before), ...ph, ...phOf(after), ...A.suffixPh]),
  };
}

export function variantsFor(A: WordAnalysis, skill: SkillId): Variant[] {
  const out: Variant[] = [];
  const push = (v: { spelling: string; prons: string[][] }) => out.push({ skill, ...v });
  const segs = A.segments;

  if (skill === "endings" && A.suffix) {
    const basePh = A.pron.slice(0, A.pron.length - A.suffixPh.length);
    push({ spelling: A.base, prons: [basePh] });
    const forms: [string, string[][]][] = [
      ["s", [["S"], ["Z"], ["IH", "Z"]]],
      ["ed", [["T"], ["D"], ["IH", "D"]]],
      ["ing", [["IH", "NG"]]],
    ];
    for (const [suf, phs] of forms) {
      if (suf === A.suffix || (suf === "s" && A.suffix === "es")) continue;
      const b = A.base.endsWith("e") && suf !== "s" ? A.base.slice(0, -1) : A.base;
      push({ spelling: b + suf, prons: phs.map((p) => [...basePh, ...p]) });
    }
    return out;
  }
  if (!segs) return out;

  segs.forEach((s, k) => {
    switch (skill) {
      case "magicE":
        if (s.role === "magicE" && s.label === "V") {
          const e = k + 2;
          const noE = segs.filter((_, i) => i !== e);
          const shortPh = (SHORT[s.g] ?? []).map((p) => p.split(" "));
          push({
            spelling: withSuffix(A, lettersOf(noE)),
            prons: shortPh.map((ph) => [...phOf(segs.slice(0, k)), ...ph, ...phOf(segs.slice(k + 1)), ...A.suffixPh]),
          });
        }
        break;
      case "digraphs":
        if (s.label === "DG" && s.g.length === 2 && s.g !== "ck") {
          const [a, b] = s.g;
          if (!(s.g === "wh")) push(edit(A, k, { g: a, phs: [[LETTER_SOUND[a] ?? a.toUpperCase()]] }));
          push(edit(A, k, { g: b, phs: [[LETTER_SOUND[b] ?? b.toUpperCase()]] }));
          if (LETTER_SOUND[a] && LETTER_SOUND[b]) out.push({ skill, spelling: "", prons: edit(A, k, { g: s.g, phs: [[LETTER_SOUND[a], LETTER_SOUND[b]]] }).prons });
        }
        break;
      case "initialBlends":
        if (s.blend === "initial") push(edit(A, k, null));
        break;
      case "finalBlends":
        if (s.blend === "final") push(edit(A, k, null));
        break;
      case "vowelTeams":
        if (s.label === "VT") {
          for (const v of new Set([...s.g].filter((c) => VOWELS.has(c)))) {
            push(edit(A, k, { g: v, phs: (SHORT[v] ?? []).map((p) => p.split(" ")) }));
          }
        }
        break;
      case "rControlled":
        if (s.label === "RC") {
          const v = s.g[0];
          const sh = (SHORT[v] ?? []).map((p) => p.split(" "));
          push(edit(A, k, { g: v, phs: [...sh, ...sh.map((p) => [...p, "R"])] }));
        }
        break;
      case "shortVowels":
        if (s.role === "shortVowels") {
          const own = s.ph.join(" ");
          for (const v of SHORT_LETTERS) {
            if (v === s.g) continue;
            push(edit(A, k, { g: v, phs: (SHORT[v] ?? []).map((p) => p.split(" ")) }));
          }
          out.push({ skill, spelling: "", prons: edit(A, k, { g: s.g, phs: SHORT_ALL.filter((p) => p !== own).map((p) => [p]) }).prons });
        }
        break;
      default:
        break;
    }
  });
  return out;
}

export function bdSwaps(word: string): string[] {
  const idx = [...word].map((c, i) => (c === "b" || c === "d" ? i : -1)).filter((i) => i >= 0);
  return idx.map((i) => word.slice(0, i) + (word[i] === "b" ? "d" : "b") + word.slice(i + 1));
}

export function isBdSwap(target: string, said: string): boolean {
  if (target.length !== said.length || target === said) return false;
  let swapped = false;
  for (let i = 0; i < target.length; i++) {
    if (target[i] === said[i]) continue;
    if ((target[i] === "b" && said[i] === "d") || (target[i] === "d" && said[i] === "b")) swapped = true;
    else return false;
  }
  return swapped;
}

export function trickyVariants(word: string): string[] {
  const m = /[aeiouy]+/.exec(word.slice(1));
  if (!m) return [];
  const i = m.index + 1;
  return SHORT_LETTERS.map((v) => word.slice(0, i) + v + word.slice(i + m[0].length)).filter((s) => s !== word);
}

export { LONG };
