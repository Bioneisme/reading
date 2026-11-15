"use client";

import { buttonClass, Glim, Icon } from "@/components/kit";
import { RealLink } from "@/components/landing/LandingLinks";

export function DemoNextStep({ name = "Mia", title, className = "" }: { name?: string; title?: string; className?: string }) {
  return (
    <section
      aria-labelledby="demo-next-title"
      className={`on-dark relative animate-rise overflow-hidden rounded-card bg-night px-6 py-6 text-white shadow-edge-night sm:px-8 ${className}`}
    >
      <div aria-hidden="true" className="absolute -top-16 -right-10 size-56 rounded-full bg-night-2 opacity-70" />
      <div className="relative flex flex-wrap items-center gap-x-7 gap-y-5">
        <Glim pose="hello" size={104} className="flex-none max-sm:size-20" />
        <div className="min-w-0 flex-[1_1_300px]">
          <div className="text-xs font-black uppercase tracking-[0.12em] text-[#FFD95E]">That was the example</div>
          <h2 id="demo-next-title" className="mt-1.5 text-[clamp(24px,2.6vw,32px)] font-black leading-[1.12] tracking-[-0.02em] text-balance">
            {title ?? `You saw ${name}'s weak spot. Now find your child's.`}
          </h2>
          <p className="mt-2 text-base font-semibold leading-normal text-white/80">
            Six quick questions, then tonight&apos;s 10‑minute check. No sign-up, nothing to install.
          </p>
        </div>
        <RealLink
          href="/start"
          className={buttonClass("lamp", "lg", false, "min-h-[60px] flex-[1_1_240px] whitespace-nowrap px-7 text-lg font-black sm:max-w-[320px]")}
        >
          Start with my child
          <Icon name="next" size={20} strokeWidth={2.6} />
        </RealLink>
      </div>
    </section>
  );
}
