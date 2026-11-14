import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";
import { createLexicon, parseCmudict, type Lexicon } from "@/lib/engine/lexicon";

let cached: Lexicon | null = null;

export function fullLexicon(): Lexicon {
  if (!cached) {
    const file = path.join(process.cwd(), "data/raw/cmudict.dict");
    cached = createLexicon(parseCmudict(readFileSync(file, "utf8")));
  }
  return cached;
}
