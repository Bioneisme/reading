import type { ReactNode } from "react";
import { Icon } from "@/components/kit";

export type ReadMode = "screen" | "paper";

const RULES = (name: string) => [
  { t: `Let ${name} read aloud.`, s: "Sit side by side so you can both see the words." },
  { t: "Don't correct during reading.", s: "Just listen. Tomorrow's plan does the teaching." },
  { t: `Tap any word ${name} misses or stumbles on.`, s: "Tap again to undo. Close enough is fine." },
];

function Chevron({ className = "" }: { className?: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

function ModeCard({
  selected,
  onSelect,
  art,
  title,
  sub,
}: {
  selected: boolean;
  onSelect: () => void;
  art: ReactNode;
  title: string;
  sub: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`option mt-[30px] cursor-pointer rounded-[22px] border-2 bg-card p-0 text-left text-ink ${
        selected ? "border-indigo shadow-[0_4px_0_#4B3FE0]" : "border-line shadow-[0_4px_0_#ECE4D6]"
      }`}
    >
      <span aria-hidden="true" className="flex h-28 justify-center rounded-t-[20px] bg-[#F6F1E7]">
        {art}
      </span>
      <span
        className={`flex items-center justify-between gap-2.5 rounded-b-[20px] px-4 py-3.5 ${
          selected ? "bg-indigo text-white" : "bg-card text-ink"
        }`}
      >
        <span>
          <span className="block text-[17px] font-black">{title}</span>
          <span className="block text-sm font-bold">{sub}</span>
        </span>
        <Chevron />
      </span>
    </button>
  );
}

export function IntroPhase({
  name,
  lead,
  sample,
  mode,
  onMode,
  onOwn,
  ownActive,
}: {
  name: string;
  lead: string;
  sample: string;
  mode: ReadMode;
  onMode: (m: ReadMode) => void;
  onOwn: () => void;
  ownActive: boolean;
}) {
  return (
    <main className="mx-auto w-full max-w-[780px] flex-[1_0_auto] px-6 pb-10 pt-7">
      <h1 className="m-0 text-[30px] font-black leading-[1.1] tracking-[-0.02em] md:text-[44px]">Before {name} reads</h1>
      <p className="mt-2.5 text-lg font-semibold leading-[1.55] text-ink-2">{lead}</p>
      <ol className="mt-6 flex flex-col gap-3">
        {RULES(name).map((r, i) => (
          <li key={r.t} className="flex items-start gap-4 rounded-[20px] border-2 border-line bg-card px-[18px] py-4">
            <span
              aria-hidden="true"
              className="inline-flex h-11 w-10 flex-none items-center justify-center rounded-xl bg-indigo font-read text-[22px] font-bold text-white shadow-edge-indigo"
            >
              {i + 1}
            </span>
            <span>
              <span className="block text-lg font-black">{r.t}</span>
              <span className="mt-0.5 block text-base font-semibold leading-normal text-ink-2">{r.s}</span>
            </span>
          </li>
        ))}
      </ol>

      <h2 id="read-from" className="mt-8 text-xl font-black">
        Where will {name} read from?
      </h2>
      <div
        role="radiogroup"
        aria-labelledby="read-from"
        className="mt-1.5 grid grid-cols-[repeat(auto-fit,minmax(min(250px,100%),1fr))] gap-4"
      >
        <ModeCard
          selected={mode === "screen"}
          onSelect={() => onMode("screen")}
          title="From this screen"
          sub="Big letters, easy to follow"
          art={
            <span className="-mt-[26px] flex h-28 w-44 items-center justify-center rounded-2xl border-[7px] border-night bg-card px-2.5 py-1.5 text-center font-read text-[21px] leading-[1.35] shadow-[0_6px_0_#14124A]">
              {sample}
            </span>
          }
        />
        <ModeCard
          selected={mode === "paper"}
          onSelect={() => onMode("paper")}
          title="From paper"
          sub="Print one page, mark here"
          art={
            <span className="-mt-[30px] flex h-[132px] w-[120px] -rotate-[4deg] flex-col gap-2 rounded-md border-2 border-edge bg-card px-3 py-3.5 shadow-[0_6px_0_#E4DBCB]">
              <span className="line-clamp-2 font-read text-[15px] leading-[1.2]">{sample}</span>
              <span className="h-1.5 rounded bg-[#EDE6D8]" />
              <span className="h-1.5 w-4/5 rounded bg-[#EDE6D8]" />
              <span className="h-1.5 w-[64%] rounded bg-[#EDE6D8]" />
            </span>
          }
        />
      </div>

      <button
        type="button"
        onClick={onOwn}
        className="option mt-5 flex w-full cursor-pointer items-center gap-3.5 rounded-[20px] border-2 border-dashed border-unchecked-line bg-transparent px-[18px] py-4 text-left text-ink"
      >
        <span aria-hidden="true" className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-indigo-tint text-indigo">
          <Icon name="book" size={22} />
        </span>
        <span className="flex-auto">
          <span className="block text-[17px] font-black">
            {ownActive ? `Using a page from ${name}'s own book` : `Or use a page from ${name}'s own book`}
          </span>
          <span className="block text-[15px] font-semibold text-ink-2">
            {ownActive ? "Tap to change the text." : "Paste a few sentences — we check every word."}
          </span>
        </span>
        <Chevron className="flex-none text-indigo" />
      </button>
    </main>
  );
}
