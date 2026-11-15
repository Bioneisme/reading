import { useMemo } from "react";
import { annotateText, type Lexicon, type SkillId } from "@/lib/engine";
import { ArrowLeft } from "@/components/reading/StepFooter";

const OWN_MIN = 20;
const OWN_MAX = 80;

const SHORT: Partial<Record<SkillId, string>> = {
  shortVowels: "Short vowels",
  magicE: "Magic e",
  digraphs: "Letter teams",
  initialBlends: "Blends at the start",
  finalBlends: "Blends at the end",
  endings: "Word endings",
  vowelTeams: "Vowel teams",
  rControlled: "Bossy r",
  bd: "b and d",
  tricky: "Tricky words",
};

const ORDER: SkillId[] = [
  "shortVowels",
  "magicE",
  "digraphs",
  "initialBlends",
  "finalBlends",
  "endings",
  "vowelTeams",
  "rControlled",
  "tricky",
];

export function ownStatus(count: number): { ok: boolean; label: string } {
  if (count >= OWN_MIN && count <= OWN_MAX) return { ok: true, label: "Good length" };
  if (count < OWN_MIN) return { ok: false, label: "Add a sentence or two" };
  return { ok: false, label: `Trim to under ${OWN_MAX} words` };
}

export function OwnTextPhase({
  name,
  text,
  onText,
  count,
  lex,
  onBack,
}: {
  name: string;
  text: string;
  onText: (v: string) => void;
  count: number;
  lex: Lexicon;
  onBack: () => void;
}) {
  const skills = useMemo(() => {
    const tally = new Map<SkillId, number>();
    for (const t of annotateText(text, lex)) {
      for (const s of new Set(t.practices)) tally.set(s, (tally.get(s) ?? 0) + 1);
    }
    return ORDER.filter((s) => tally.get(s)).map((s) => ({ s, n: tally.get(s) ?? 0 }));
  }, [text, lex]);
  const status = ownStatus(count);

  return (
    <main className="mx-auto w-full max-w-[780px] flex-[1_0_auto] animate-rise px-6 pb-8 pt-6">
      <button
        type="button"
        onClick={onBack}
        className="text-link inline-flex min-h-11 cursor-pointer items-center gap-1.5 border-0 bg-transparent px-1 text-[15px] font-extrabold text-indigo"
      >
        <ArrowLeft />
        Back to tonight&apos;s text
      </button>
      <h1 className="mt-2 text-[28px] font-black leading-[1.12] tracking-[-0.02em] md:text-[40px]">
        Use a page from {name}&apos;s own book
      </h1>
      <p className="mt-2.5 text-[17px] font-semibold leading-[1.55] text-ink-2">
        Paste or type 2-5 sentences from a book {name} is reading. We&apos;ll check every word against the 11 reading skills.
      </p>
      <label htmlFor="own-text" className="mt-[22px] block text-base font-black">
        Text from the book
      </label>
      <textarea
        id="own-text"
        rows={5}
        value={text}
        onChange={(e) => onText(e.target.value)}
        placeholder="Pip the pup ran to the pond. He saw a frog on a log. The frog gave a big hop. Pip sat and wished he could hop like that."
        className="mt-2 block w-full resize-y rounded-[20px] border-2 border-line-strong bg-card px-[18px] py-4 font-read text-[22px] leading-[1.6] text-ink placeholder:text-[#B3AC9E] md:text-2xl"
      />
      <div className="mt-3.5 rounded-[20px] border-2 border-line bg-card px-5 py-[18px]">
        <div className="flex flex-wrap items-center gap-2.5" aria-live="polite">
          <span className="text-[17px] font-black">
            {count} {count === 1 ? "word" : "words"}
          </span>
          <span
            className={`rounded-full px-2.5 py-[3px] text-[13px] font-black transition-colors duration-200 ${
              status.ok ? "bg-mastered-tint text-mastered-ink" : "bg-needs-tint text-needs-ink"
            }`}
          >
            {status.label}
          </span>
        </div>
        <div className="mt-3 text-xs font-black uppercase tracking-[0.1em] text-ink-3">Skills this text practices</div>
        {skills.length ? (
          <ul className="mt-2 flex flex-wrap gap-2">
            {skills.map(({ s, n }) => (
              <li
                key={s}
                className="animate-fade rounded-full border-[1.5px] border-[#CFC9FF] bg-indigo-tint px-3 py-1.5 text-sm font-extrabold text-[#2B2290]"
              >
                {SHORT[s]} · {n}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm font-bold text-ink-3">Paste some text to see which skills it practices.</p>
        )}
      </div>
      <p className="mt-3 text-sm font-bold text-ink-3">Names and words we don&apos;t recognize don&apos;t count toward a skill.</p>
    </main>
  );
}
