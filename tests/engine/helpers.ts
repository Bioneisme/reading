import { readFileSync } from "node:fs";
import path from "node:path";
import { createLexicon, parseCmudict, type Lexicon } from "@/lib/engine/lexicon";

let full: Lexicon | null = null;
export function fullLexicon(): Lexicon {
  return (full ??= createLexicon(parseCmudict(readFileSync(path.join(__dirname, "../../data/raw/cmudict.dict"), "utf8"))));
}
