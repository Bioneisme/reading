import core from "../../data/lexicon-core.json";

export interface Lexicon {
  get(word: string): string[][] | undefined;
}

export function createLexicon(entries: Record<string, string[]>): Lexicon {
  const map = new Map<string, string[][]>();
  for (const [w, prons] of Object.entries(entries)) map.set(w, prons.map((p) => p.split(" ")));
  return { get: (w) => map.get(w) };
}

export function parseCmudict(text: string): Record<string, string[]> {
  const out: Record<string, string[]> = Object.create(null);
  for (const line of text.split("\n")) {
    const m = /^([a-z']+)(?:\(\d+\))?\s+([A-Z0-9 ]+?)\s*(?:#.*)?$/.exec(line.trim());
    if (!m) continue;
    (out[m[1]] ??= []).push(m[2]);
  }
  return out;
}

export const coreLexicon: Lexicon = createLexicon(core as Record<string, string[]>);

export const stripStress = (ph: string) => ph.replace(/\d/g, "");
export const stressOf = (ph: string) => {
  const m = /\d/.exec(ph);
  return m ? Number(m[0]) : undefined;
};

export function extendLexicon(base: Lexicon, entries: Record<string, string[]>): Lexicon {
  const extra = createLexicon(entries);
  return { get: (w) => base.get(w) ?? extra.get(w) };
}
