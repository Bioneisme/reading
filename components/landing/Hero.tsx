import Image from "next/image";
import { Glim, Icon, type IconName } from "@/components/kit";
import { DemoLink, RealLink } from "./LandingLinks";
import { cta } from "./styles";

const NO: { icon: IconName; label: string }[] = [
  { icon: "noMic", label: "No microphone" },
  { icon: "noTablet", label: "No iPad" },
  { icon: "noAccount", label: "No sign-up" },
];

function Marked({ children }: { children: string }) {
  return (
    <mark className="rounded-lg bg-highlighter px-[5px] text-inherit shadow-[inset_0_-4px_0_#F2B915]">{children}</mark>
  );
}

function HeroVisual() {
  return (
    <DemoLink
      aria-label="Open the 60-second example"
      className="group relative mx-auto mb-10 block aspect-[560/600] w-full max-w-[560px] animate-rise rounded-hero text-ink [animation-delay:180ms]"
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-[2%] top-[34%] bottom-[13%] rounded-[36px] border-2 border-[#DCD6FF] bg-indigo-tint shadow-[0_6px_0_#DCD6FF]"
      />
      <Glim
        pose="hello"
        size={150}
        priority
        className="absolute top-[3%] left-0 z-[1] h-auto w-[24%] [animation-delay:-2s]"
      />
      <div aria-hidden="true" className="absolute top-[40%] right-[9%] aspect-square w-[18%] rounded-full bg-highlighter opacity-60" />
      <Image
        src="/images/cutout-dad-boy.png"
        alt="A dad and his son high-fiving in the kitchen, phone in hand"
        width={1100}
        height={874}
        priority
        sizes="(min-width: 1024px) 530px, 90vw"
        className="absolute bottom-[13%] left-[3%] block h-auto w-[94%]"
      />
      <div className="absolute top-0 right-0 z-[2] flex max-w-[80%] rotate-2 animate-float items-center gap-3 rounded-[20px] bg-night py-3 pr-[18px] pl-3 text-white shadow-edge-night transition-[rotate] duration-200 group-hover:rotate-1">
        <span
          aria-hidden="true"
          className="inline-flex h-12 w-11 shrink-0 items-center justify-center rounded-xl bg-lamp font-read text-[28px] font-bold text-ink shadow-edge-lamp"
        >
          e
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="text-[11px] font-black tracking-[0.1em] text-[#FFD95E] uppercase">Mia&apos;s weak spot</span>
          <span className="text-[17px] font-black sm:text-[19px]">Magic e · 3 of 4 misses</span>
        </span>
      </div>
      <div className="absolute -bottom-10 left-1/2 z-[2] w-[min(380px,92%)] -translate-x-1/2 -rotate-1 animate-float rounded-[22px] border-2 border-line bg-card px-[18px] pt-3.5 pb-4 shadow-edge-sand transition-[translate,box-shadow,border-color] duration-200 ease-out [animation-delay:-3s] group-hover:-translate-y-[3px] group-hover:border-line-strong group-hover:shadow-[0_7px_0_#E4DBCB]">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[13px] font-extrabold text-ink-2">Tonight&apos;s check · 1st grade</span>
          <span className="rounded-full bg-lamp-tint px-2.5 py-[3px] text-xs font-black text-lamp-ink">2 marked</span>
        </div>
        <p className="mt-1.5 font-read text-[21px] leading-[1.9] sm:text-2xl">
          Jake has a red <Marked>bike</Marked>. He <Marked>rides</Marked> to the lake.
        </p>
      </div>
    </DemoLink>
  );
}

export function Hero() {
  return (
    <section className="mx-auto grid max-w-[1200px] items-center gap-12 px-6 pt-9 pb-[88px] lg:grid-cols-2">
      <div>
        <p className="inline-flex animate-rise items-center gap-2.5 rounded-full border-2 border-line bg-card py-1.5 pr-3.5 pl-1.5 text-sm font-extrabold text-ink-2">
          <span
            aria-hidden="true"
            className="inline-flex size-[26px] items-center justify-center rounded-lg bg-lamp font-read text-base font-bold text-ink"
          >
            a
          </span>
          A reading coach for parents of K–2 kids
        </p>
        <h1 className="mt-[22px] animate-rise text-[clamp(40px,4.8vw,66px)] [animation-delay:60ms] leading-[1.04] font-black tracking-[-0.03em] text-balance">
          Your child guesses words.{" "}
          <span className="box-decoration-clone bg-[linear-gradient(180deg,transparent_58%,#FFD95E_58%,#FFD95E_90%,transparent_90%)]">
            Find out exactly why
          </span>{" "}
          — in 10 minutes a night.
        </h1>
        <p className="mt-[22px] max-w-[540px] animate-rise [animation-delay:120ms] text-[clamp(17px,1.45vw,20px)] leading-[1.6] font-semibold text-pretty text-ink-2">
          Your child reads from paper or the screen. You tap the words they miss. We tell you what to fix — and exactly
          what to say tomorrow.
        </p>
        <div className="mt-8 flex animate-rise flex-wrap gap-3.5 [animation-delay:180ms]">
          <DemoLink className={cta("primary", "min-h-[58px] max-w-[320px] flex-[1_1_260px] px-[26px] text-[17px]")}>
            <Icon name="play" size={18} />
            Try a 60-second example
          </DemoLink>
          <RealLink
            href="/start"
            className={cta("secondary", "min-h-[58px] max-w-[280px] flex-[1_1_220px] px-6 text-[17px]")}
          >
            Start with my child
          </RealLink>
        </div>
        <p className="mt-3.5 animate-rise text-sm font-bold text-ink-3 [animation-delay:220ms]">The example follows Mia, 6 — a sample reader. Nothing to fill in.</p>
        <ul aria-label="What you don't need" className="mt-[26px] flex flex-wrap gap-2.5">
          {NO.map((n, i) => (
            <li
              key={n.label}
              style={{ animationDelay: `${260 + i * 50}ms` }}
              className="inline-flex animate-rise items-center gap-2 rounded-full border-2 border-line bg-card px-3.5 py-2 text-sm font-extrabold"
            >
              <Icon name={n.icon} size={18} className="text-indigo" />
              {n.label}
            </li>
          ))}
        </ul>
      </div>
      <HeroVisual />
    </section>
  );
}
