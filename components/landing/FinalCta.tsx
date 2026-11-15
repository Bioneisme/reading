import Image from "next/image";
import { Icon, Reveal } from "@/components/kit";
import { DemoLink, RealLink } from "./LandingLinks";
import { cta } from "./styles";

export function FinalCta() {
  return (
    <section aria-labelledby="final-title" className="on-dark overflow-hidden bg-night text-white">
      <div className="mx-auto grid max-w-[1200px] items-center gap-11 px-6 py-[88px] lg:grid-cols-2">
        <Reveal>
          <Icon name="moon" size={44} className="text-lamp [&>path]:fill-current [&>path]:stroke-none" />
          <h2 id="final-title" className="mt-4 text-[clamp(34px,4vw,56px)] leading-[1.05] font-black tracking-[-0.03em]">
            Tonight, try 10 minutes.
          </h2>
          <p className="mt-4 max-w-[480px] text-[19px] leading-[1.6] font-semibold text-indigo-soft">
            Your child reads. You tap. We tell you what to say tomorrow.
          </p>
          <div className="mt-[30px] flex flex-wrap gap-3.5">
            <DemoLink className={cta("lamp", "min-h-[58px] max-w-[320px] flex-[1_1_250px] px-[26px] text-[17px]")}>
              <Icon name="play" size={18} />
              Try a 60-second example
            </DemoLink>
            <RealLink href="/start" className={cta("outlineDark", "min-h-[58px] max-w-[280px] flex-[1_1_220px] px-6 text-[17px]")}>
              Start with my child
            </RealLink>
          </div>
          <p className="mt-[18px] text-sm font-extrabold text-[#BDB8F0]">No microphone · No iPad · No sign-up</p>
        </Reveal>
        <Reveal delay={140} className="relative aspect-[520/560] w-full max-w-[520px] justify-self-center">
          <div aria-hidden="true" className="absolute top-[2%] left-[10%] aspect-square w-[34%] rounded-full bg-lamp opacity-[0.14]" />
          <div
            aria-hidden="true"
            className="absolute inset-x-[6%] top-[24%] bottom-0 rounded-[999px_999px_32px_32px] bg-night-2 shadow-edge-night"
          />
          <Image
            src="/images/cutout-mom-toddler.png"
            alt="A mom checks her phone while holding her little one"
            width={564}
            height={647}
            sizes="(min-width: 1024px) 480px, 85vw"
            className="absolute bottom-0 left-1/2 block h-[98%] w-auto max-w-full -translate-x-1/2 object-contain object-bottom"
          />
          <div className="absolute bottom-[8%] left-0 z-[2] flex -rotate-2 animate-float items-center gap-3 rounded-[20px] bg-card py-3 pr-4 pl-3 text-ink shadow-edge-night">
            <span aria-hidden="true" className="inline-flex size-[42px] items-center justify-center rounded-xl bg-lamp text-ink">
              <Icon name="calendar" size={22} strokeWidth={2.2} />
            </span>
            <span className="flex flex-col">
              <span className="text-xs font-black tracking-[0.08em] text-indigo uppercase">Every night</span>
              <span className="text-[17px] font-black">Reading time · 7:30 pm</span>
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
