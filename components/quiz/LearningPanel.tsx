import type { SkillId } from "@/lib/engine";
import { SPOT } from "./copy";

export interface Fact {
  k: string;
  v: string | null;
}

export function LearningPanel({ name, facts, spots }: { name: string; facts: Fact[]; spots: SkillId[] }) {
  return (
    <aside aria-label="What we're learning" className="rounded-[26px] border-2 border-line bg-card p-[22px]">
      <div className="text-xs font-black uppercase tracking-[0.1em] text-indigo">What we&apos;re learning</div>
      <div className="mt-1 text-[22px] font-black">About {name}</div>
      <dl className="mt-3.5 flex flex-col">
        {facts.map((f) => (
          <div key={f.k} className="flex items-start justify-between gap-3 border-b-2 border-sand py-2.5">
            <dt className="text-sm font-extrabold text-ink-3">{f.k}</dt>
            <dd className={`m-0 text-right text-[15px] font-black ${f.v ? "text-ink" : "text-[#B3AC9E]"}`}>
              {f.v || "—"}
            </dd>
          </div>
        ))}
      </dl>
      <div className="mt-4 text-xs font-black uppercase tracking-[0.1em] text-ink-3">Likely weak spots so far</div>
      <ul className="mt-2 flex flex-wrap gap-2">
        {(spots.length ? spots.map((s) => SPOT[s]?.name ?? s) : ["Tonight’s check will tell"]).map((t) => (
          <li
            key={t}
            className="rounded-full border-[1.5px] border-lamp-line bg-lamp-tint px-3 py-1.5 text-sm font-black text-lamp-ink"
          >
            {t}
          </li>
        ))}
      </ul>
      <p className="mt-4 flex items-center gap-2 text-[13px] font-extrabold text-ink-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22A06B" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
        </svg>
        Saved only in this browser. No account.
      </p>
    </aside>
  );
}
