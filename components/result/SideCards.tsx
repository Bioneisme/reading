import { Button, ButtonLink, Icon } from "@/components/kit";

const PERKS = [
  "A new practice story every night, every word checked",
  "The 28-day plan, updated after every night",
  "Nightly 10-minute checks after the first one",
  "Skills map, progress and a weekly summary",
];

export function UnlockCard({ name, pro }: { name: string; pro: boolean }) {
  return (
    <section aria-labelledby="un-title" className="rounded-[28px] border-2 border-[#CFC9FF] bg-card p-[26px] shadow-[0_4px_0_#CFC9FF]">
      <span
        aria-hidden="true"
        className={`inline-flex h-12 w-12 items-center justify-center rounded-chip ${pro ? "bg-mastered-tint text-mastered-ink" : "bg-indigo-tint text-indigo"}`}
      >
        <Icon name={pro ? "check" : "lock"} size={24} strokeWidth={pro ? 2.6 : 2.2} />
      </span>
      <h2 id="un-title" className="mt-3.5 text-2xl font-black tracking-[-0.01em]">
        {pro ? `${name}'s 28-day plan is unlocked` : `Unlock ${name}'s 28-day plan`}
      </h2>
      <ul className="mt-3.5 flex flex-col gap-2.5">
        {PERKS.map((p) => (
          <li key={p} className="flex gap-2.5 text-base font-bold leading-[1.45]">
            <Icon name="check" size={20} strokeWidth={2.6} className="mt-0.5 flex-none text-indigo" />
            {p}
          </li>
        ))}
      </ul>
      {pro ? (
        <ButtonLink href="/journal" block className="mt-5">
          Open {name}&apos;s journal
          <Icon name="next" size={18} strokeWidth={2.4} />
        </ButtonLink>
      ) : (
        <>
          <ButtonLink href="/plans" block className="mt-5 text-center max-sm:px-3 max-sm:text-base">
            See plans — from $9.92/month
          </ButtonLink>
          <p className="mt-2.5 text-center text-sm font-bold text-ink-3">Cancel anytime in one click</p>
        </>
      )}
    </section>
  );
}

export function SimulateCard({ name, onStart }: { name: string; onStart: () => void }) {
  return (
    <section aria-labelledby="sim-cta-title" className="on-dark rounded-[28px] bg-night p-[26px] text-white shadow-edge-night">
      <span className="inline-block rounded-full border-[1.5px] border-[#8F89E0] px-2.5 py-[3px] text-[11px] font-black uppercase tracking-[0.08em] text-indigo-soft">
        Demo
      </span>
      <h2 id="sim-cta-title" className="mt-3 text-2xl font-black tracking-[-0.01em]">
        What does a week look like?
      </h2>
      <p className="mt-2 text-base font-semibold leading-[1.55] text-indigo-soft">
        Run five sample nights through the same engine — about 3 seconds — then open {name}&apos;s journal.
      </p>
      <Button variant="lamp" block onClick={onStart} className="mt-[18px] font-black">
        <Icon name="play" size={18} />
        Simulate a week
      </Button>
    </section>
  );
}

export function SideCards({ name, pro, demo, onSimulate }: { name: string; pro: boolean; demo: boolean; onSimulate: () => void }) {
  return (
    <div className="flex flex-col gap-5">
      <UnlockCard name={name} pro={pro} />
      {demo && <SimulateCard name={name} onStart={onSimulate} />}
    </div>
  );
}
