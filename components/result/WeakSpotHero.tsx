import type { ReactNode } from "react";
import { Icon } from "@/components/kit";
import { SKILLS, type SkillId } from "@/lib/engine";
import { missLine } from "./model";
import { changedLetters, SKILL_TILES } from "./tiles";

const TILE =
  "inline-flex h-[clamp(46px,4.8cqi,60px)] w-[clamp(40px,4.2cqi,54px)] items-center justify-center rounded-[13px] border-2 font-read text-[clamp(24px,2.6cqi,32px)] font-bold";

function TileRow({ word, hi, tone }: { word: string; hi: Set<number>; tone: "lamp" | "indigo" }) {
  return (
    <div className="flex gap-1.5">
      {[...word].map((l, i) => {
        const on = hi.has(i);
        const cls = !on
          ? "border-edge bg-card text-ink shadow-[0_5px_0_#B8B0F5]"
          : tone === "lamp"
            ? "border-[#E8AE1C] bg-lamp text-ink shadow-[0_5px_0_#D99A0B]"
            : "border-[#3F33CF] bg-indigo text-white shadow-[0_5px_0_#14124A]";
        return (
          <span key={i} className={`${TILE} ${cls}`}>
            {l}
          </span>
        );
      })}
    </div>
  );
}

function Panel({ children }: { children: ReactNode }) {
  return (
    <div aria-hidden="true" className="flex flex-col items-center gap-3.5 rounded-[26px] bg-night-2 px-3 py-[26px]">
      {children}
    </div>
  );
}

function Meter({ filled, total }: { filled: number; total: number }) {
  const n = Math.min(total, 10);
  const on = total > 10 ? Math.round((filled / total) * 10) : filled;
  return (
    <span aria-hidden="true" className="flex gap-1.5">
      {Array.from({ length: n }, (_, i) => (
        <span key={i} className={`h-2.5 w-[30px] rounded-full ${i < on ? "bg-lamp" : "bg-[#4A4597]"}`} />
      ))}
    </span>
  );
}

const SHELL =
  "on-dark grid grid-cols-[repeat(auto-fit,minmax(min(400px,100%),1fr))] items-center gap-x-10 gap-y-7 rounded-hero bg-night p-[clamp(24px,3.4cqi,44px)] text-white shadow-edge-night";

export function WeakSpotHero({
  name,
  weak,
  weakCount,
  total,
  examples,
  second,
}: {
  name: string;
  weak: SkillId;
  weakCount: number;
  total: number;
  examples: string[];
  second: { name: string; count: number } | null;
}) {
  const tiles = SKILL_TILES[weak];
  return (
    <section aria-labelledby="ws-title" className={SHELL}>
      <div>
        <p className="text-[13px] font-black uppercase tracking-[0.1em] text-[#FFD95E]">{name}&apos;s weak spot</p>
        <h1 id="ws-title" className="mt-1.5 text-[clamp(38px,4.6cqi,64px)] font-black leading-[1.02] tracking-[-0.03em]">
          {SKILLS[weak].name}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-x-3.5 gap-y-2.5">
          <span className="text-xl font-extrabold text-indigo-soft">
            {weakCount} of {missLine(total)}
          </span>
          <Meter filled={weakCount} total={total} />
        </div>
        <p className="mt-4 max-w-[560px] text-lg font-semibold leading-[1.6] text-[#E7E5FB]">
          {SKILLS[weak].explain(name, examples)}
        </p>
        {second && (
          <p className="mt-3.5 inline-flex items-center gap-2 rounded-full bg-[#3A3690] px-3.5 py-2 text-sm font-extrabold">
            Also seen: {second.name} — {missLine(second.count)}
          </p>
        )}
      </div>
      <Panel>
        <TileRow word={tiles.from} hi={new Set()} tone={tiles.tone} />
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFD95E" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M6 13l6 6 6-6" />
        </svg>
        <TileRow word={tiles.to} hi={changedLetters(tiles.from, tiles.to)} tone={tiles.tone} />
        <p className="text-center text-[15px] font-extrabold text-indigo-soft">{tiles.caption}</p>
      </Panel>
    </section>
  );
}

export function NoPatternHero({
  name,
  totalWords,
  totalMisses,
}: {
  name: string;
  totalWords: number;
  totalMisses: number;
}) {
  const clean = totalMisses === 0;
  return (
    <section aria-labelledby="ws-title" className={SHELL}>
      <div>
        <p className="text-[13px] font-black uppercase tracking-[0.1em] text-[#FFD95E]">
          {clean ? `${name}'s check` : `${name}'s results`}
        </p>
        <h1 id="ws-title" className="mt-1.5 text-[clamp(38px,4.6cqi,64px)] font-black leading-[1.02] tracking-[-0.03em]">
          {clean ? "No misses tonight!" : "Not enough to tell yet"}
        </h1>
        <p className="mt-3 text-xl font-extrabold text-indigo-soft">
          {clean ? `${name} read all ${totalWords} words` : `${missLine(totalMisses)}, no single pattern`}
        </p>
        <p className="mt-4 max-w-[560px] text-lg font-semibold leading-[1.6] text-[#E7E5FB]">
          {clean
            ? `That's a great read. Nothing on tonight's page tripped ${name} up, so tomorrow's plan keeps the next skill warm and the practice light.`
            : `These misses don't point to one sound pattern yet. Try a fresh check tomorrow and mark every word ${name} reads differently.`}
        </p>
      </div>
      <Panel>
        <span className="inline-flex h-[76px] w-[72px] items-center justify-center rounded-[22px] border-2 border-[#E8AE1C] bg-lamp text-ink shadow-[0_6px_0_#D99A0B]">
          {clean ? <Icon name="check" size={40} strokeWidth={3} /> : <span className="font-read text-[34px] font-bold">?</span>}
        </span>
        <p className="text-center text-[15px] font-extrabold text-indigo-soft">
          {clean ? "Every word, read right" : "More words help us see the pattern"}
        </p>
      </Panel>
    </section>
  );
}
