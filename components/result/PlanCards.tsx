import type { ReactNode } from "react";
import Link from "next/link";
import { ButtonLink, Icon, Reveal } from "@/components/kit";
import type { Plan } from "@/lib/engine";

export const PANEL = "rounded-[28px] border-2 border-line bg-card p-[26px] shadow-edge";

export function SayThis({ scripts }: { scripts: string[] }) {
  return (
    <section aria-labelledby="say-title" className={PANEL}>
      <h2 id="say-title" className="text-2xl font-black tracking-[-0.01em]">
        Say this tomorrow
      </h2>
      <p className="mt-1.5 text-base font-semibold text-ink-2">Read these out loud, word for word.</p>
      <ol className="mt-[18px] flex flex-col gap-3">
        {scripts.map((t, i) => (
          <li key={i}>
            <Reveal delay={160 + i * 120} className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className="inline-flex h-9 w-[34px] flex-none items-center justify-center rounded-[10px] bg-indigo font-read text-lg font-bold text-white shadow-[0_3px_0_#3328B0]"
              >
                {i + 1}
              </span>
              <span className="rounded-[20px_20px_20px_6px] bg-indigo-tint px-[18px] py-3.5 text-[17px] font-bold leading-normal">
                “{t}”
              </span>
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Step({ min, title, children, locked = false }: { min: number; title: ReactNode; children: ReactNode; locked?: boolean }) {
  return (
    <li
      className={`flex items-start gap-3.5 rounded-[18px] p-3.5 ${locked ? "border-2 border-dashed border-line-strong bg-[#F6F1E7]" : "bg-paper"}`}
    >
      <span
        className={`w-[62px] flex-none rounded-[10px] py-1.5 text-center text-sm font-black text-white ${locked ? "bg-ink-3" : "bg-indigo"}`}
      >
        {min} min
      </span>
      <span className="min-w-0 flex-auto">
        <span className="flex items-center gap-2 text-base font-black">{title}</span>
        {children}
      </span>
    </li>
  );
}

export function TomorrowPlan({ plan, pro }: { plan: Plan; pro: boolean }) {
  return (
    <section aria-labelledby="plan-title" className={`${PANEL} flex flex-col`}>
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <h2 id="plan-title" className="text-2xl font-black tracking-[-0.01em]">
          Tomorrow&apos;s 10-minute plan
        </h2>
        <span className="rounded-full bg-mastered-tint px-3 py-1 text-[13px] font-black text-mastered-ink">
          {pro ? "Unlocked" : "Free"}
        </span>
      </div>
      <ol className="mt-[18px] flex flex-col gap-2.5">
        <Step min={2} title="Word pairs">
          <span className="mt-0.5 block font-read text-xl text-ink-2">
            {plan.pairs.map(([a, b], i) => (
              <span key={`${a}-${b}`}>
                {i > 0 && " · "}
                <span className="whitespace-nowrap">
                  {a} / {b}
                </span>
              </span>
            ))}
          </span>
        </Step>
        <Step min={3} title="Word list">
          <span className="mt-0.5 block font-read text-xl text-ink-2">{plan.wordList.join(", ")}</span>
        </Step>
        {pro ? (
          <Step min={5} title="Practice story">
            <span className="mt-0.5 block text-[15px] font-bold text-ink-2">
              “{plan.story.title}” — every word checked.{" "}
              <Link href={`/story/${plan.story.id}`} className="text-link font-extrabold text-indigo">
                Read it
              </Link>
            </span>
          </Step>
        ) : (
          <Step
            min={5}
            locked
            title={
              <>
                Practice story
                <Icon name="lock" size={16} strokeWidth={2.2} className="text-ink-3" title="Locked" />
              </>
            }
          >
            <span className="mt-0.5 block text-[15px] font-bold text-ink-2">
              “{plan.story.title}” — every word checked. In the full plan.
            </span>
          </Step>
        )}
      </ol>
      <div className="mt-auto pt-3">
        {pro ? (
          <ButtonLink href="/session" variant="secondary" size="md" block className="min-h-[52px]">
            Start tomorrow&apos;s session
            <Icon name="next" size={18} strokeWidth={2.4} />
          </ButtonLink>
        ) : (
          <ButtonLink href="/plans" variant="secondary" size="md" block className="min-h-[52px]">
            <Icon name="lock" size={18} strokeWidth={2.2} />
            Unlock the story
          </ButtonLink>
        )}
      </div>
    </section>
  );
}
