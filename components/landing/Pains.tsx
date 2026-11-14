import type { ReactNode } from "react";
import { BODY, H2, LEAD, SECTION } from "./styles";

const TILE = "inline-flex h-[52px] items-center justify-center border-2 font-read font-bold";

function Tile({ ch, tone = "plain", narrow = false }: { ch: string; tone?: "plain" | "ghost" | "hot"; narrow?: boolean }) {
  const size = narrow ? "w-10 rounded-xl text-[26px]" : "w-[46px] rounded-[13px] text-[28px]";
  const look =
    tone === "ghost"
      ? "border-dashed border-[#BDB29F] bg-transparent text-[#A39A88]"
      : tone === "hot"
        ? "border-[#3F33CF] bg-indigo text-white shadow-[0_5px_0_#3328B0]"
        : "border-edge bg-card shadow-[0_5px_0_#E4DBCB]";
  return <span className={`${TILE} ${size} ${look}`}>{ch}</span>;
}

function Caption({ children }: { children: ReactNode }) {
  return <div className="mt-3 font-read text-[19px] text-ink-2">{children}</div>;
}

const PAINS: { title: string; body: string; art: ReactNode }[] = [
  {
    title: "Reads “tap” for “tape”",
    body: "The quiet e at the end gets skipped. That's one skill — and it's very fixable.",
    art: (
      <>
        <div className="-mt-7 flex gap-[7px]">
          <Tile ch="t" />
          <Tile ch="a" />
          <Tile ch="p" />
          <Tile ch="e" tone="ghost" />
        </div>
        <Caption>tape → “tap”</Caption>
      </>
    ),
  },
  {
    title: "Guesses from the first letter",
    body: "Close enough to sound right — but it's guessing, not reading the whole word.",
    art: (
      <>
        <div className="-mt-7 flex gap-[5px]">
          <Tile ch="h" narrow />
          <Tile ch="o" narrow />
          <Tile ch="r" narrow tone="hot" />
          <Tile ch="s" narrow />
          <Tile ch="e" narrow />
        </div>
        <Caption>horse → “house”</Caption>
      </>
    ),
  },
  {
    title: "The teacher says “just read more”",
    body: "Good advice — but it doesn't tell you what to practice tonight.",
    art: (
      <>
        <div className="relative -mt-[26px] rounded-[20px] border-2 border-edge bg-card px-5 py-3 text-[22px] font-black shadow-[0_5px_0_#E4DBCB]">
          “Just read more.”
        </div>
        <div className="-mt-1 size-[18px] rotate-45 border-r-2 border-b-2 border-edge bg-card" />
        <div className="mt-1.5 text-[13px] font-extrabold text-ink-3">— the teacher, at pickup</div>
      </>
    ),
  },
  {
    title: "Tutors cost $30–80 an hour",
    body: "Great if you can. Most families can't do it every week.",
    art: (
      <>
        <div className="-mt-[26px] flex items-baseline gap-1.5 rounded-[18px] border-2 border-[#E8AE1C] bg-lamp px-5 py-2.5 shadow-[0_5px_0_#D99A0B]">
          <span className="text-[30px] font-black tracking-[-0.02em]">$30–80</span>
          <span className="text-[15px] font-extrabold text-[#4A3500]">/ hour</span>
        </div>
        <div className="mt-3 text-sm font-extrabold text-ink-3">A private reading tutor</div>
      </>
    ),
  },
];

export function Pains() {
  return (
    <section aria-labelledby="pain-title" className={`${SECTION} pt-2 pb-24`}>
      <h2 id="pain-title" className={H2}>
        Sound familiar?
      </h2>
      <p className={`mt-3 max-w-[620px] ${LEAD}`}>
        You hear the mistakes every night. Knowing what they mean is the hard part.
      </p>
      <div className="mt-[52px] grid gap-x-5 gap-y-[52px] sm:grid-cols-2 lg:grid-cols-4">
        {PAINS.map((p) => (
          <article key={p.title} className="rounded-card border-2 border-line bg-card shadow-edge">
            <div aria-hidden="true" className="flex h-[116px] flex-col items-center rounded-t-[22px] bg-[#F6F1E7]">
              {p.art}
            </div>
            <div className="px-[22px] pt-[18px] pb-6">
              <h3 className="text-xl leading-[1.25] font-black">{p.title}</h3>
              <p className={`mt-2 ${BODY}`}>{p.body}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
