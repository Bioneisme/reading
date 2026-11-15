import { ExampleChip, Icon, Reveal } from "@/components/kit";
import { DemoLink } from "./LandingLinks";
import { EYEBROW, H2, LEAD, SECTION, cta } from "./styles";

export function ExampleResult() {
  return (
    <section aria-labelledby="ex-title" className={`${SECTION} grid items-center gap-12 py-24 lg:grid-cols-2`}>
      <Reveal>
        <p className={EYEBROW}>Example result</p>
        <h2 id="ex-title" className={`mt-2.5 text-balance ${H2}`}>
          One 3‑minute check. One clear thing to fix.
        </h2>
        <p className={`mt-4 max-w-[520px] ${LEAD}`}>
          Mia, 6, read 36 words and missed 4. Three of the misses share one pattern, so that&apos;s tomorrow&apos;s
          focus, with the exact words to say.
        </p>
        <DemoLink className={cta("primary", "mt-7 min-h-14 px-6 text-[17px] whitespace-nowrap max-[400px]:px-4 max-[400px]:text-[15px]")}>
          <span className="max-sm:hidden">Try it yourself in 60 seconds</span>
          <span className="sm:hidden">Try it in 60 seconds</span>
          <Icon name="next" size={18} strokeWidth={2.4} />
        </DemoLink>
      </Reveal>
      <Reveal delay={120}>
        <DemoLink
          to="result"
          aria-label="Open Mia's example results"
          className="lift group block overflow-hidden rounded-[28px] border-2 border-line bg-card text-ink shadow-[0_6px_0_#E4DBCB] active:translate-y-[3px]"
        >
          <div className="bg-night px-6 py-[26px] text-white sm:px-7">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-black tracking-[0.1em] text-[#FFD95E] uppercase">Mia&apos;s weak spot</span>
              <ExampleChip onDark />
            </div>
            <div className="mt-2 flex flex-wrap items-baseline gap-x-3.5 gap-y-1.5">
              <span className="text-[38px] font-black tracking-[-0.02em]">Magic e</span>
              <span className="text-lg font-extrabold text-indigo-soft">3 of 4 misses</span>
            </div>
            <div aria-hidden="true" className="mt-3 flex gap-1.5">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  style={{ animationDelay: `${420 + i * 90}ms` }}
                  className={`h-2.5 w-[34px] rounded-full in-data-[reveal=shown]:animate-pop ${i < 3 ? "bg-lamp" : "bg-[#4A4597]"}`}
                />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-4 px-6 pt-[22px] pb-[26px] sm:px-7">
            <p className="text-[17px] leading-[1.6] font-semibold text-ink-2">
              When a word ends in a quiet e, the vowel says its name: tape, bike, home. Mia reads the short sound instead:
              bike → “bik”.
            </p>
            <p className="rounded-[20px_20px_20px_6px] bg-indigo-tint px-[18px] py-3.5 text-base leading-[1.45] font-bold">
              <span className="mb-1 block text-[11px] font-black tracking-[0.1em] text-indigo uppercase">Say this</span>
              “Cover the e. Read it. Now uncover it. What changed?”
            </p>
            <span className="flex items-center gap-2 text-[15px] font-extrabold text-indigo">
              Open the full result
              <Icon name="next" size={16} strokeWidth={2.4} className="transition-transform duration-200 ease-out group-hover:translate-x-1" />
            </span>
          </div>
        </DemoLink>
      </Reveal>
    </section>
  );
}
