import { Reveal } from "@/components/kit";
import { CountOnView } from "./CountOnView";

export function Method() {
  return (
    <section id="method" aria-labelledby="method-title" className="on-dark scroll-mt-4 bg-night text-white">
      <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-6 py-24 lg:grid-cols-2">
        <Reveal>
          <p className="text-[13px] font-black tracking-[0.1em] text-[#FFD95E] uppercase">The method</p>
          <h2
            id="method-title"
            className="mt-3 text-[clamp(28px,3vw,42px)] leading-[1.15] font-black tracking-[-0.02em] text-balance"
          >
            Reading specialists sort misses by sound pattern. We made it a 10-minute habit any parent can do.
          </h2>
          <p className="mt-[18px] max-w-[560px] text-lg leading-[1.6] font-semibold text-indigo-soft">
            You listen and mark what you hear. The pattern in the misses shows which skill to practice next — Readly does
            the pattern part for you. Practice is always sounding words out, never guessing from the first letter.
          </p>
        </Reveal>
        <Reveal delay={120}>
          <figure className="rounded-hero bg-night-2 p-7 shadow-edge-night sm:p-9">
            <p className="text-lg font-extrabold text-indigo-soft">About</p>
            <p className="text-[clamp(64px,7vw,104px)] leading-none font-black tracking-[-0.03em] text-lamp">
              <CountOnView to={40} suffix="%" />
            </p>
            <p className="mt-2.5 text-[22px] leading-[1.35] font-extrabold">of US 4th graders read below the Basic level.</p>
            <figcaption className="mt-3.5 text-sm font-bold text-[#BDB8F0]">NAEP 2024 · The Nation&apos;s Report Card</figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
