export type SkillId =
  | "shortVowels"
  | "magicE"
  | "digraphs"
  | "initialBlends"
  | "finalBlends"
  | "endings"
  | "vowelTeams"
  | "rControlled"
  | "bd"
  | "tricky"
  | "guessing";

export const SKILL_ORDER: SkillId[] = [
  "shortVowels",
  "magicE",
  "digraphs",
  "initialBlends",
  "finalBlends",
  "endings",
  "vowelTeams",
  "rControlled",
  "bd",
  "tricky",
  "guessing",
];

export const PHONICS_SKILLS: SkillId[] = [
  "shortVowels",
  "magicE",
  "digraphs",
  "initialBlends",
  "finalBlends",
  "endings",
  "vowelTeams",
  "rControlled",
];

export interface SkillInfo {
  id: SkillId;
  name: string;
  example: string;
  explain: (child: string, examples: string[]) => string;
  scripts: (child: string) => [string, string, string];
  pairs: [string, string][];
}

const ex = (examples: string[], fallback: string) =>
  examples.length ? examples.slice(0, 2).join(", ") : fallback;

export const SKILLS: Record<SkillId, SkillInfo> = {
  shortVowels: {
    id: "shortVowels",
    name: "Short vowel sounds",
    example: "bed vs bad",
    explain: (c, e) =>
      `In short words like bed, cat and sun, each vowel makes its short sound. ${c} swaps one vowel sound for another: ${ex(e, "bed → “bad”")}.`,
    scripts: () => [
      "Say the middle sound with me: b – e – d. What sound is in the middle?",
      "Touch each letter and say its sound, then slide the sounds together.",
      "Bed — bad. Which one do you sleep in?",
    ],
    pairs: [["bed", "bad"], ["pin", "pen"], ["hot", "hut"], ["cap", "cup"], ["sit", "set"]],
  },
  magicE: {
    id: "magicE",
    name: "Magic e",
    example: "tap → tape",
    explain: (c, e) =>
      `When a word ends in a quiet e, the vowel says its name: tape, bike, home. ${c} reads the short sound instead: ${ex(e, "tape → “tap”, bike → “bik”")}.`,
    scripts: () => [
      "See the e at the end? It's quiet, but it makes the vowel say its name.",
      "Cover the e. Read it. Now uncover it. What changed?",
      "Tap — tape. Which one is a sticky strip?",
    ],
    pairs: [["tap", "tape"], ["kit", "kite"], ["hop", "hope"], ["cut", "cute"], ["pin", "pine"]],
  },
  digraphs: {
    id: "digraphs",
    name: "Letter teams: sh, ch, th, wh, ck",
    example: "ship → sip",
    explain: (c, e) =>
      `Some letters team up to make one new sound: s and h make /sh/ in ship. ${c} reads the letters one by one: ${ex(e, "ship → “sip”")}.`,
    scripts: () => [
      "When s and h are together, they make one sound: /sh/, like when we say “be quiet”.",
      "Put your finger under both letters. That's one sound. Say it with me.",
      "Sip — ship. Which one floats on the water?",
    ],
    pairs: [["sip", "ship"], ["cop", "chop"], ["tin", "thin"], ["sin", "sing"]],
  },
  initialBlends: {
    id: "initialBlends",
    name: "Blends at the start: st, bl, tr",
    example: "stop → sop",
    explain: (c, e) =>
      `At the start of words like stop and trip, two consonants sit side by side and you hear both. ${c} drops one: ${ex(e, "stop → “sop”")}.`,
    scripts: () => [
      "Both letters at the start make a sound. Let's say them slowly: s – t – op.",
      "Cover the rest of the word. Say just the first two sounds, then add the rest.",
      "Top — stop. Which one does a red light tell you to do?",
    ],
    pairs: [["top", "stop"], ["lip", "slip"], ["rip", "trip"], ["pin", "spin"], ["lap", "clap"]],
  },
  finalBlends: {
    id: "finalBlends",
    name: "Blends at the end: -st, -nd, -mp",
    example: "jump → jum",
    explain: (c, e) =>
      `At the end of words like jump and hand, two consonants sit together and you hear both. ${c} drops one of them: ${ex(e, "jump → “jum”")}.`,
    scripts: () => [
      "Listen to the very end of the word: ju – m – p. Two sounds at the end.",
      "Read it again and stretch out the last two sounds.",
      "Had — hand. Which one do you wave?",
    ],
    pairs: [["had", "hand"], ["bet", "best"], ["lap", "lamp"], ["ten", "tent"], ["ban", "band"]],
  },
  endings: {
    id: "endings",
    name: "Word endings: -s, -ed, -ing",
    example: "jumped → jump",
    explain: (c, e) =>
      `Small endings change the meaning: jump, jumps, jumped, jumping. ${c} reads the main word and skips the ending: ${ex(e, "jumped → “jump”")}.`,
    scripts: () => [
      "Look at the end of the word. Is there an -s, -ed or -ing? Say it.",
      "Cover the ending, read the word, then uncover the ending and add it.",
      "Jump — jumped. Which one already happened?",
    ],
    pairs: [["jump", "jumped"], ["cat", "cats"], ["run", "running"], ["help", "helped"], ["sit", "sitting"]],
  },
  vowelTeams: {
    id: "vowelTeams",
    name: "Vowel teams: ai, ee, oa, igh",
    example: "rain → ran",
    explain: (c, e) =>
      `When two vowels sit together, they usually make one long sound: rain, feet, boat, night. ${c} reads just the first vowel, short: ${ex(e, "rain → “ran”")}.`,
    scripts: () => [
      "When two vowels go walking, the first one does the talking. It says its name.",
      "Point to the vowel team. What sound do they make together?",
      "Ran — rain. Which one falls from the sky?",
    ],
    pairs: [["ran", "rain"], ["fed", "feed"], ["cot", "coat"], ["lit", "light"]],
  },
  rControlled: {
    id: "rControlled",
    name: "Bossy r: ar, or, er, ir, ur",
    example: "bird → bid",
    explain: (c, e) =>
      `When r comes after a vowel, it's bossy and changes the vowel's sound: car, fork, bird, fur. ${c} skips the r sound: ${ex(e, "bird → “bid”")}.`,
    scripts: () => [
      "The r is bossy. It changes the sound of the vowel in front of it.",
      "Read the vowel and the r together as one sound: /ar/, /or/, /er/.",
      "Bid — bird. Which one can fly?",
    ],
    pairs: [["bid", "bird"], ["cat", "cart"], ["hut", "hurt"], ["ban", "barn"]],
  },
  bd: {
    id: "bd",
    name: "b and d mix-ups",
    example: "dig → big",
    explain: (c, e) =>
      `b and d are mirror images, so many young readers swap them: ${ex(e, "dig → “big”")}. It's very common at ${c}'s age.`,
    scripts: () => [
      "Make a bed with your hands: thumbs up, fists together. The left hand is b, the right hand is d.",
      "For b, your lips pop together: /b/. For d, your tongue taps behind your teeth: /d/.",
      "Dig — big. Which one do you do with a shovel?",
    ],
    pairs: [["big", "dig"], ["bad", "dad"], ["bug", "dug"]],
  },
  tricky: {
    id: "tricky",
    name: "Tricky words: said, was, are",
    example: "said → sed",
    explain: (c, e) =>
      `Some common words don't follow the rules, so sounding them out doesn't work: said, was, are, the. ${c} tries to sound them out: ${ex(e, "said → “sed”")}. These words are learned by heart.`,
    scripts: () => [
      "This word is a rule-breaker. We don't sound it out. We just know it.",
      "Look at it, say it, cover it, write it with your finger, then check.",
      "Let's find this word three times on the page.",
    ],
    pairs: [["said", "was"], ["are", "the"], ["they", "have"]],
  },
  guessing: {
    id: "guessing",
    name: "Guessing from the first letter",
    example: "horse → house",
    explain: (c, e) =>
      `${c} looks at the first letter and says a word that fits, instead of reading the whole word: ${ex(e, "horse → “house”")}. It works in easy books, then stops working.`,
    scripts: () => [
      "Good start! Now check the whole word, every letter, left to right.",
      "Slide your finger under the word as you say each sound.",
      "Does that look right? Let's check the end of the word.",
    ],
    pairs: [["horse", "house"], ["went", "want"], ["stop", "step"], ["then", "than"]],
  },
};

export const QUIZ_SIGNS: { id: string; label: string; skill: SkillId | null }[] = [
  { id: "tape", label: "Reads “tap” for “tape”", skill: "magicE" },
  { id: "ship", label: "Reads “ship” as “s-hip”", skill: "digraphs" },
  { id: "guess", label: "Guesses from the first letter (“house” for “horse”)", skill: "guessing" },
  { id: "bd", label: "Mixes up b and d", skill: "bd" },
  { id: "endings", label: "Drops endings (“jump” for “jumped”)", skill: "endings" },
  { id: "tricky", label: "Gets stuck on “said”, “was”, “the”", skill: "tricky" },
  { id: "unsure", label: "Not sure yet", skill: null },
];

export function quizProfile(signIds: string[]): SkillId[] {
  const picked = new Set(QUIZ_SIGNS.flatMap((s) => (s.skill && signIds.includes(s.id) ? [s.skill] : [])));
  const ordered = SKILL_ORDER.filter((s) => picked.has(s)).slice(0, 3);
  return ordered.length ? ordered : ["shortVowels", "magicE"];
}
