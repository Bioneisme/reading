import Link from "next/link";
import type { Plan } from "@/lib/engine";
import { buttonClass } from "@/components/kit";
import { SKILL_SHORT } from "./skillCopy";
import { SECTION } from "./TonightCard";

function LockGlyph({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3" />
    </svg>
  );
}

export function FreePlanCard({ plan }: { plan: Plan }) {
  const pairs = plan.pairs.slice(0, 2).map((p) => p.join(" / ")).join(" · ");
  const words = plan.wordList.slice(0, 3).join(" · ");
  const rows = [
    { min: "2 min", label: "Word pairs", words: pairs },
    { min: "3 min", label: "Word list", words },
  ];
  return (
    <section aria-labelledby="free-title" className={`${SECTION} p-[22px] sm:p-[26px]`}>
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <h2 id="free-title" className="text-[26px] font-black tracking-[-0.02em]">
          Tomorrow&apos;s plan
        </h2>
        <span className="rounded-full bg-mastered-tint px-3 py-1 text-[13px] font-black text-mastered-ink">Free</span>
      </div>
      <p className="mt-1.5 text-base font-semibold text-ink-2">Built from tonight&apos;s check: {SKILL_SHORT[plan.focus]}.</p>
      <ol className="mt-4 flex flex-col gap-2.5">
        {rows.map((r) => (
          <li key={r.label} className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 rounded-2xl bg-paper px-3.5 py-3">
            <span className="w-[62px] flex-none rounded-[10px] bg-indigo py-1.5 text-center text-sm font-black text-white">
              {r.min}
            </span>
            <span className="font-extrabold">{r.label}</span>
            <span className="ml-auto whitespace-nowrap text-right font-read text-[19px] text-ink-2">{r.words}</span>
          </li>
        ))}
        <li className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 rounded-2xl border-2 border-dashed border-line-strong bg-[#F6F1E7] px-3.5 py-3">
          <span className="w-[62px] flex-none rounded-[10px] bg-ink-3 py-1.5 text-center text-sm font-black text-white">5 min</span>
          <span className="font-extrabold">Practice story</span>
          <span className="ml-auto inline-flex items-center gap-1.5 whitespace-nowrap text-right text-sm font-extrabold text-ink-2">
            <LockGlyph />
            In the plan
          </span>
        </li>
      </ol>
      <div className="mt-[18px] flex flex-wrap gap-3">
        <Link href="/plans" className={buttonClass("primary", "lg", false, "flex-[1_1_220px] whitespace-nowrap max-[400px]:px-4 max-[400px]:text-[15px]")}>
          Unlock nightly sessions
        </Link>
        <Link href="/result" className={buttonClass("secondary", "lg", false, "flex-[1_1_200px] whitespace-nowrap max-[400px]:px-4 max-[400px]:text-[15px]")}>
          Review tonight&apos;s results
        </Link>
      </div>
    </section>
  );
}

export function LockedTeaser({ name }: { name: string }) {
  return (
    <section
      aria-labelledby="lock-title"
      className={`${SECTION} relative min-h-[460px] overflow-hidden`}
    >
      <div aria-hidden="true" className="p-[26px] opacity-65 blur-[4px]">
        <div className="text-2xl font-black">Skills map</div>
        <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-2.5">
          <div className="h-16 rounded-2xl bg-mastered-tint" />
          <div className="h-16 rounded-2xl bg-improving-tint" />
          <div className="h-16 rounded-2xl bg-needs-tint" />
          <div className="h-16 rounded-2xl bg-unchecked" />
        </div>
        <div className="mt-6 flex h-[120px] items-end gap-3.5">
          {[100, 76, 76, 50, 26].map((h, i) => (
            <div key={i} className="w-[34px] rounded-[10px] bg-lamp" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center p-5">
        <div className="w-[min(420px,100%)] rounded-card border-2 border-[#CFC9FF] bg-card p-6 text-center shadow-[0_5px_0_#CFC9FF]">
          <span
            aria-hidden="true"
            className="inline-flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-indigo-tint text-indigo"
          >
            <LockGlyph size={24} />
          </span>
          <h2 id="lock-title" className="mt-3 text-[22px] font-black leading-tight">
            {name}&apos;s journal comes with the plan
          </h2>
          <p className="mt-2 text-base font-semibold leading-normal text-ink-2">
            Skills map, nightly progress, history and a weekly summary, updated after every night.
          </p>
          <Link href="/plans" className={buttonClass("primary", "lg", true, "mt-4")}>
            See plans from $9.92/month
          </Link>
        </div>
      </div>
    </section>
  );
}
