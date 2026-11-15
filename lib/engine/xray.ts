import { classifyMiss } from "./classify";
import { coreLexicon, type Lexicon } from "./lexicon";
import { analyzeWord, pronounce } from "./phonics";
import { SKILLS, type SkillId } from "./skills";
import { normalizeWord } from "./text";
import type { SegLabel } from "./types";

export interface XrayTile {
  letters: string;
  sound: string;
  said: string | null;
  silent: boolean;
  broken: boolean;
  label: SegLabel | "SUFFIX";
}

export interface Xray {
  word: string;
  said: string | null;
  skill: SkillId | "other";
  skillName: string;
  tiles: XrayTile[];
  wordSound: string;
  saidSound: string | null;
  facts: string[];
}

const SOUND: Record<string, string> = {
  AA: "o", AE: "a", AH: "u", AO: "aw", AW: "ow", AY: "ī", EH: "e", ER: "er", EY: "ā", IH: "i", IY: "ē",
  OW: "ō", OY: "oy", UH: "oo", UW: "ū", B: "b", CH: "ch", D: "d", DH: "th", F: "f", G: "g", HH: "h",
  JH: "j", K: "k", L: "l", M: "m", N: "n", NG: "ng", P: "p", R: "r", S: "s", SH: "sh", T: "t", TH: "th",
  V: "v", W: "w", Y: "y", Z: "z", ZH: "zh",
};

export function friendlySound(phones: string[]): string {
  return phones.map((p) => SOUND[p.replace(/\d/g, "")] ?? p.toLowerCase()).join("");
}

function alignPhones(target: string[], said: string[]): (string | null)[] {
  const n = target.length;
  const m = said.length;
  const d: number[][] = Array.from({ length: n + 1 }, (_, i) => Array.from({ length: m + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i <= n; i++)
    for (let j = 1; j <= m; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (target[i - 1] === said[j - 1] ? 0 : 1));
  const out: (string | null)[] = new Array(n).fill(null);
  let i = n;
  let j = m;
  while (i > 0 && j > 0) {
    if (d[i][j] === d[i - 1][j - 1] + (target[i - 1] === said[j - 1] ? 0 : 1)) {
      out[i - 1] = said[j - 1];
      i--;
      j--;
    } else if (d[i][j] === d[i - 1][j] + 1) i--;
    else j--;
  }
  return out;
}

function factsFor(x: Omit<Xray, "facts">, roleTiles: XrayTile[]): string[] {
  const facts: string[] = [];
  const changed = x.tiles.filter((t) => t.broken && !t.silent);
  for (const t of changed) {
    facts.push(
      t.said
        ? `In “${x.word}”, the letters “${t.letters}” should sound /${t.sound}/, but the child said /${t.said}/.`
        : `In “${x.word}”, the sound /${t.sound}/ for “${t.letters}” was left out.`,
    );
  }
  if (x.skill === "magicE" && roleTiles.some((t) => t.silent))
    facts.push(`The quiet e at the end of “${x.word}” makes the vowel say its name; the child read the vowel short.`);
  if (x.skill === "guessing") facts.push(`The child said a word that starts like “${x.word}” but did not sound out the rest.`);
  if (x.skill === "tricky") facts.push(`“${x.word}” is a tricky word that doesn't follow the usual rules, so it is learned by heart.`);
  if (x.skill === "bd") facts.push(`The child swapped b and d.`);
  if (x.said === null) facts.push(`The child skipped “${x.word}”.`);
  return facts;
}

export function buildXray(word: string, said: string | null, lex: Lexicon = coreLexicon): Xray | null {
  const w = normalizeWord(word);
  const a = analyzeWord(w, lex);
  if (!a || !a.segments) return null;
  const s = said === null ? null : normalizeWord(said) || null;
  const skill = classifyMiss(w, s, lex);
  const saidPhones = s ? pronounce(s, lex)[0] : null;
  const targetPhones = a.pron;
  const mapped = saidPhones ? alignPhones(targetPhones, saidPhones) : null;

  const tiles: XrayTile[] = [];
  const roleTiles: XrayTile[] = [];
  let k = 0;
  const take = (n: number) => {
    const ph = targetPhones.slice(k, k + n);
    const got = mapped ? mapped.slice(k, k + n) : null;
    k += n;
    return { ph, got };
  };
  for (const seg of a.segments) {
    const { ph, got } = take(seg.ph.length);
    const silent = ph.length === 0;
    const saidSound = got ? (got.every((g) => g === null) ? null : friendlySound(got.filter((g): g is string => g !== null))) : null;
    const differs = got ? got.some((g, i) => g !== ph[i]) : true;
    const isRole = seg.role === skill;
    const tile: XrayTile = {
      letters: seg.g,
      sound: friendlySound(ph),
      said: silent ? null : saidSound,
      silent,
      broken: s === null ? isRole : (!silent && differs) || (silent && isRole),
      label: seg.label,
    };
    if (isRole) roleTiles.push(tile);
    tiles.push(tile);
  }
  if (a.suffix) {
    const { ph, got } = take(a.suffixPh.length);
    const differs = got ? got.some((g, i) => g !== ph[i]) : true;
    tiles.push({
      letters: w.slice(a.base.length) || a.suffix,
      sound: friendlySound(ph),
      said: got && got.some((g) => g !== null) ? friendlySound(got.filter((g): g is string => g !== null)) : null,
      silent: false,
      broken: s === null ? skill === "endings" : differs,
      label: "SUFFIX",
    });
  }

  const base = {
    word: w,
    said: s,
    skill,
    skillName: skill === "other" ? "Other" : SKILLS[skill].name,
    tiles,
    wordSound: friendlySound(targetPhones),
    saidSound: saidPhones ? friendlySound(saidPhones) : null,
  };
  return { ...base, facts: factsFor(base, roleTiles) };
}
