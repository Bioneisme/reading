import { Icon } from "@/components/kit";
import { RealLink } from "./LandingLinks";
import { EYEBROW, H2, cta } from "./styles";

const PERKS = [
  "Free: the first check, the weak spot, the scripts and tomorrow's plan.",
  "Cancel anytime in one click. No emails, no calls.",
];

const OTHER = [
  { name: "4 weeks", price: "$14.99, then $19.99 every 4 weeks" },
  { name: "1 week", price: "$6.93, then $19.99 every 4 weeks" },
];

export function Pricing() {
  return (
    <section id="pricing" aria-labelledby="price-title" className="scroll-mt-4 border-y-2 border-line-soft bg-card">
      <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-6 py-[88px] lg:grid-cols-2">
        <div>
          <p className={EYEBROW}>Pricing</p>
          <h2 id="price-title" className={`mt-2.5 text-balance ${H2}`}>
            Less than one tutoring hour — for a whole month.
          </h2>
          <ul className="mt-6 flex flex-col gap-3">
            {PERKS.map((p) => (
              <li key={p} className="flex items-start gap-2.5 text-[17px] leading-[1.5] font-bold">
                <Icon name="check" size={22} strokeWidth={2.6} className="mt-0.5 shrink-0 text-mastered" />
                {p}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-[28px] border-2 border-line bg-paper p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border-2 border-indigo bg-card px-[22px] py-5 shadow-[0_4px_0_#4B3FE0]">
            <div>
              <p className="text-xl font-black">1 year</p>
              <p className="mt-0.5 text-[15px] font-bold text-ink-2">$119 · billed once a year</p>
            </div>
            <div className="sm:text-right">
              <p className="text-[30px] font-black tracking-[-0.02em]">
                $9.92<span className="text-base font-extrabold text-ink-2">/month</span>
              </p>
              <span className="mt-1 inline-block rounded-full bg-lamp px-2.5 py-[3px] text-xs font-black">Best value</span>
            </div>
          </div>
          <dl className="mt-3.5 flex flex-col gap-2 px-1.5 text-[15px] font-bold text-ink-2">
            {OTHER.map((o) => (
              <div key={o.name} className="flex flex-col gap-x-3 sm:flex-row sm:justify-between">
                <dt className="text-ink sm:text-ink-2">{o.name}</dt>
                <dd>{o.price}</dd>
              </div>
            ))}
          </dl>
          <RealLink href="/start" className={cta("primary", "mt-[22px] min-h-14 w-full px-6 text-[17px]")}>
            Start free with my child
          </RealLink>
        </div>
      </div>
    </section>
  );
}
