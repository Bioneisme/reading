import type { ReactNode } from "react";
import { Icon, Reveal } from "@/components/kit";
import { BODY, EYEBROW, H2 } from "./styles";

const SHOW = "mt-auto rounded-button border-2 border-line bg-card px-4 py-3.5";

const STEPS: { title: string; body: string; show: ReactNode }[] = [
  {
    title: "Your child reads a short text aloud.",
    body: "From your phone, your laptop or a printout. Tonight's first check takes about 3 minutes.",
    show: <div className={`${SHOW} font-read text-[22px] leading-[1.7]`}>Jake has a red bike.</div>,
  },
  {
    title: "You tap the words they miss — and pick what they said.",
    body: "Tap again to undo. You don't need to be a teacher to get it right.",
    show: (
      <div className={`${SHOW} flex flex-wrap items-center gap-2`}>
        <span className="rounded-[9px] bg-highlighter px-2 py-0.5 font-read text-[22px] shadow-[inset_0_-4px_0_#F2B915]">bike</span>
        <Icon name="next" size={18} strokeWidth={2.4} className="text-ink-3" />
        <span className="rounded-full border-2 border-indigo bg-indigo-tint px-3 py-1 font-read text-[19px] text-[#2B2290]">bik</span>
        <span className="rounded-full border-2 border-edge bg-card px-3 py-1 font-read text-[19px]">bake</span>
      </div>
    ),
  },
  {
    title: "Get the weak spot, three things to say, and tomorrow's plan.",
    body: "In plain words. The first check and tomorrow's plan are free.",
    show: (
      <div className="mt-auto flex flex-wrap gap-2 rounded-button bg-night px-4 py-3.5 text-white">
        <span className="rounded-full bg-lamp px-3 py-[5px] text-sm font-black text-ink">Magic e · 3 of 4</span>
        <span className="rounded-full bg-[#3A3690] px-3 py-[5px] text-sm font-extrabold">3 “Say this” scripts</span>
        <span className="rounded-full bg-[#3A3690] px-3 py-[5px] text-sm font-extrabold">10-min plan</span>
      </div>
    ),
  },
];

export function HowItWorks() {
  return (
    <section id="how" aria-labelledby="how-title" className="scroll-mt-4 border-y-2 border-line-soft bg-card">
      <div className="mx-auto max-w-[1200px] px-6 py-[88px]">
        <Reveal>
          <p className={EYEBROW}>How it works</p>
          <h2 id="how-title" className={`mt-2.5 ${H2}`}>
            Three steps. About ten minutes.
          </h2>
        </Reveal>
        <ol className="mt-10 grid gap-5 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="flex">
              <Reveal
                delay={i * 110}
                className="flex flex-1 flex-col gap-4 rounded-card border-2 border-line bg-paper p-[26px]"
              >
                <span
                  aria-hidden="true"
                  style={{ animationDelay: `${i * 110 + 380}ms` }}
                  className="inline-flex h-[52px] w-12 items-center justify-center rounded-chip bg-indigo font-read text-[28px] font-bold text-white shadow-[0_5px_0_#3328B0] in-data-[reveal=shown]:animate-pop"
                >
                  {i + 1}
                </span>
                <h3 className="text-[21px] leading-[1.3] font-black">{s.title}</h3>
                <p className={BODY}>{s.body}</p>
                <div aria-hidden="true" className="mt-auto flex flex-col">
                  {s.show}
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
