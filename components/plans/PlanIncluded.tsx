import { Icon } from "@/components/kit";

function short(name: string) {
  return name.split(":")[0];
}

export function PlanIncluded({ name, focus, next }: { name: string; focus: string; next: string | null }) {
  const items = [
    `A new practice story every night, every word checked for ${name}`,
    `The 28‑day plan, updated from what ${name} reads each night`,
    "Nightly 10‑minute checks after the first one",
    "Skills map and progress across all 11 skills",
    "A weekly summary: what moved, what's next",
  ];
  return (
    <section aria-labelledby="inc-title" className="rounded-[28px] border-2 border-line bg-card p-[26px] shadow-edge max-sm:p-5">
      <h2 id="inc-title" className="text-[22px] font-black">
        What&apos;s in {name}&apos;s plan
      </h2>
      <div aria-hidden="true" className="mt-4 rounded-[20px] bg-night p-[18px] text-white">
        <div className="flex flex-col gap-2">
          {[1, 2, 3, 4].map((w) => (
            <div key={w} className="flex items-center gap-2.5">
              <span className="w-14 flex-none text-xs font-black text-indigo-soft">Week {w}</span>
              <span className="flex flex-auto gap-[5px]">
                {Array.from({ length: 7 }, (_, d) => {
                  const done = w === 1 && d === 0;
                  const isFocus = w <= 2 || !next;
                  const cls = done
                    ? "border-lamp bg-card"
                    : isFocus
                      ? "border-[#E8AE1C] bg-lamp"
                      : "border-[#A9A4EC] bg-[#8F89E0]";
                  return <span key={d} className={`h-[22px] flex-1 rounded-md border-[1.5px] ${cls}`} />;
                })}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[13px] font-extrabold text-indigo-soft">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3.5 w-3.5 rounded bg-lamp" />
            {short(focus)}
          </span>
          {next && (
            <span className="inline-flex items-center gap-1.5">
              <span className="h-3.5 w-3.5 rounded bg-[#8F89E0]" />
              {short(next)}
            </span>
          )}
          <span>Adjusts after every night</span>
        </div>
      </div>
      <ul className="mt-[18px] flex flex-col gap-3">
        {items.map((t) => (
          <li key={t} className="flex gap-3 text-base font-bold leading-[1.45]">
            <Icon name="check" size={22} strokeWidth={2.6} className="mt-px flex-none text-indigo" />
            {t}
          </li>
        ))}
      </ul>
      <p className="mt-[18px] rounded-2xl bg-mastered-tint px-4 py-3.5 text-[15px] font-extrabold leading-normal text-[#0F5534]">
        Always free: the first check, the weak spot, the “Say this” scripts and tomorrow&apos;s plan.
      </p>
    </section>
  );
}
