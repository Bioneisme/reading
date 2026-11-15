export function normalizeWord(s: string): string {
  return s
    .toLowerCase()
    .replace(/[‘’ʼ]/g, "'")
    .replace(/^[^a-z]+|[^a-z]+$/g, "");
}

export interface TextToken {
  text: string;
  word: string | null;
}

export function tokenize(text: string): TextToken[] {
  return text
    .split(/([A-Za-z][A-Za-z'’]*[A-Za-z]|[A-Za-z])/)
    .filter((t) => t.length > 0)
    .map((t) => {
      const word = /^[A-Za-z]/.test(t) ? normalizeWord(t) : "";
      return { text: t, word: word || null };
    });
}

export function wordsOf(text: string): string[] {
  return tokenize(text)
    .map((t) => t.word)
    .filter((w): w is string => !!w);
}

export function plainPunctuation(text: string): string {
  return text.replace(/\s*[—–]\s*/g, ", ").replace(/…/g, "...").replace(/\s*;\s*/g, ", ");
}
