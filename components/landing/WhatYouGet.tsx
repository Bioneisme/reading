import type { ReactNode } from "react";
import { Icon, Reveal } from "@/components/kit";
import { BODY, EYEBROW, H2, LEAD, SECTION } from "./styles";

const PLAN = [
  { min: "2 min", label: "Word pairs", words: "tap / tape · kit / kite" },
  { min: "3 min", label: "Word list", words: "cake · ride · home" },
  { min: "5 min", label: "Practice story", words: "Jake's Kite" },
];

const STORY: { word: string; tag: string; line: string; ink: string }[] = [
  { word: "Jake", tag: "Magic e", line: "border-b-4 border-indigo", ink: "text-[#2B2290]" },
  { word: "has", tag: "Short vowel", line: "border-b-4 border-dotted border-ink-3", ink: "text-ink-2" },
  { word: "a", tag: "Tricky", line: "border-b-4 border-double border-needs-ink", ink: "text-needs-ink" },
  { word: "red", tag: "Short vowel", line: "border-b-4 border-dotted border-ink-3", ink: "text-ink-2" },
  { word: "kite", tag: "Magic e", line: "border-b-4 border-indigo", ink: "text-[#2B2290]" },
];

function StatusIcon({ kind }: { kind: "mastered" | "improving" | "needs" | "unchecked" }) {
  if (kind === "improving") return <Icon name="improving" size={16} strokeWidth={2.4} />;
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {kind === "mastered" && (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M8 12.5l2.8 2.8L16 10" />
        </>
      )}
      {kind === "needs" && (
        <>
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
      {kind === "unchecked" && <circle cx="12" cy="12" r="8" strokeDasharray="3 3" />}
    </svg>
  );
}

const MAP: { skill: string; kind: "mastered" | "improving" | "needs" | "unchecked"; label: string; track: string; fill: string; ink: string; pct: string }[] = [
  { skill: "Short vowels", kind: "mastered", label: "Mastered", track: "bg-mastered-tint", fill: "bg-mastered", ink: "text-mastered-ink", pct: "in-data-[reveal=shown]:w-full" },
  { skill: "Magic e", kind: "improving", label: "Improving", track: "bg-improving-tint", fill: "bg-improving", ink: "text-improving-ink", pct: "in-data-[reveal=shown]:w-[62%]" },
  { skill: "Letter teams", kind: "needs", label: "Needs work", track: "bg-needs-tint", fill: "bg-needs", ink: "text-needs-ink", pct: "in-data-[reveal=shown]:w-[14%]" },
  { skill: "Bossy r", kind: "unchecked", label: "Not checked", track: "border-2 border-dashed border-unchecked-line", fill: "", ink: "text-ink-3", pct: "" },
];

function Feature({
  title,
  body,
  delay = 0,
  children,
}: {
  title: string;
  body: string;
  delay?: number;
  children: ReactNode;
}) {
  return (
    <Reveal delay={delay} className="rounded-[28px] border-2 border-line bg-card p-6 shadow-edge sm:p-7">
      <h3 className="text-[22px] leading-[1.3] font-black">{title}</h3>
      <p className={`mt-2 ${BODY}`}>{body}</p>
      <div aria-hidden="true" className="mt-5">
        {children}
      </div>
    </Reveal>
  );
}

export function WhatYouGet() {
  return (
    <section aria-labelledby="get-title" className={`${SECTION} py-24`}>
      <Reveal>
        <p className={EYEBROW}>Every night</p>
        <h2 id="get-title" className={`mt-2.5 ${H2}`}>
          What you get every night
        </h2>
        <p className={`mt-3 max-w-[640px] ${LEAD}`}>
          Each plan is built from that night&apos;s misses, not from a fixed curriculum.
        </p>
      </Reveal>
      <div className="mt-9 grid gap-5 lg:grid-cols-2">
        <Feature title="Tomorrow's plan, built from tonight's misses" body="Ten minutes, in three short parts.">
          <div className="flex flex-col gap-2.5">
            {PLAN.map((p) => (
              <div key={p.min} className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 rounded-button bg-paper px-3.5 py-3">
                <span className="w-16 shrink-0 rounded-[10px] bg-indigo py-1.5 text-center text-sm font-black text-white">{p.min}</span>
                <span className="text-[15px] font-extrabold">{p.label}</span>
                <span className="w-full font-read text-lg text-ink-2 sm:ml-auto sm:w-auto">{p.words}</span>
              </div>
            ))}
          </div>
        </Feature>
        <Feature delay={110} title="“Say this” scripts" body="Read them word for word. No teaching background needed.">
          <div className="flex flex-col gap-3">
            <p className="max-w-[92%] self-start rounded-[22px_22px_22px_6px] bg-night px-[18px] py-3.5 text-[17px] leading-[1.45] font-bold text-white">
              “See the e at the end? It&apos;s quiet, but it makes the vowel say its name.”
            </p>
            <p className="max-w-[80%] self-start rounded-[22px_22px_22px_6px] bg-indigo-tint px-[18px] py-3.5 text-[17px] leading-[1.45] font-bold">
              “Tap, tape. Which one is a sticky strip?”
            </p>
          </div>
        </Feature>
        <Feature
          title="A practice story where every word is checked"
          body="Only words your child can already decode, plus the skill they're practicing."
        >
          <div className="flex flex-wrap gap-x-[18px] gap-y-3.5 rounded-[18px] bg-paper p-[18px]">
            {STORY.map((w, i) => (
              <span key={i} className="flex flex-col items-center gap-1">
                <span className={`font-read text-[28px] leading-[1.2] ${w.line}`}>{w.word}</span>
                <span className={`text-[10px] font-black tracking-[0.08em] uppercase ${w.ink}`}>{w.tag}</span>
              </span>
            ))}
          </div>
        </Feature>
        <Feature delay={110} title="A skills map that shows progress" body="Eleven reading skills, in the order kids learn them.">
          <div className="flex flex-col gap-3 sm:gap-2.5">
            {MAP.map((m) => (
              <div key={m.skill} className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1.5 sm:grid-cols-[150px_1fr_118px]">
                <span className="text-[15px] font-extrabold">{m.skill}</span>
                <span className={`order-last col-span-2 h-3 overflow-hidden rounded-full sm:order-none sm:col-span-1 ${m.track}`}>
                  {m.fill && (
                    <span style={{ transitionDelay: "380ms" }} className={`bar-fill block h-full w-0 ${m.fill} ${m.pct}`} />
                  )}
                </span>
                <span className={`inline-flex items-center gap-1.5 text-[13px] font-black ${m.ink}`}>
                  <StatusIcon kind={m.kind} />
                  {m.label}
                </span>
              </div>
            ))}
          </div>
        </Feature>
      </div>
    </section>
  );
}
