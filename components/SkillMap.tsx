import { SKILL_ORDER, SKILLS, type Profile, type SkillId, type SkillStatus } from "@/lib/engine";
import { ProgressBar } from "@/components/ui";

export const STATUS_LABEL: Record<SkillStatus, string> = {
  notChecked: "Not checked yet",
  needsWork: "Needs work",
  improving: "Improving",
  mastered: "Mastered",
};

const STATUS_STYLE: Record<SkillStatus, string> = {
  notChecked: "border-line bg-paper text-ink-soft",
  needsWork: "border-accent/40 bg-accent-soft text-[#8a3d1c]",
  improving: "border-sun bg-[#fff4d6] text-[#7a5410]",
  mastered: "border-brand/40 bg-brand-soft text-brand-strong",
};

const STATUS_ICON: Record<SkillStatus, string> = {
  notChecked: "○",
  needsWork: "!",
  improving: "↗",
  mastered: "✓",
};

export function StatusPill({ status }: { status: SkillStatus }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[status]}`}
    >
      <span aria-hidden>{STATUS_ICON[status]}</span>
      {STATUS_LABEL[status]}
    </span>
  );
}

export function SkillMap({ profile, focus, nextUp }: { profile: Profile; focus?: SkillId; nextUp?: SkillId | null }) {
  return (
    <ol className="divide-y divide-line">
      {SKILL_ORDER.map((id, idx) => {
        const st = profile.skills[id];
        const status: SkillStatus = st?.status ?? "notChecked";
        const hist = st?.history ?? [];
        return (
          <li key={id} className="py-3.5">
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
              <p className="min-w-0 font-semibold">
                <span className="mr-2 text-sm text-ink-soft tabular-nums">{idx + 1}.</span>
                {SKILLS[id].name}
                {focus === id && (
                  <span className="ml-2 rounded-full bg-ink px-2 py-0.5 text-xs font-semibold text-white">
                    Tonight&apos;s focus
                  </span>
                )}
                {nextUp === id && focus !== id && (
                  <span className="ml-2 rounded-full border border-ink/30 px-2 py-0.5 text-xs font-semibold text-ink">
                    Next up
                  </span>
                )}
              </p>
              <StatusPill status={status} />
            </div>
            <div className="mt-2 flex items-center gap-3">
              <div className="flex-1">
                <ProgressBar value={st?.progress ?? 0} label={`${SKILLS[id].name} progress`} />
              </div>
              <span className="w-28 shrink-0 text-right text-xs text-ink-soft">
                {hist.length > 1 && hist.some((h) => h > 0)
                  ? `misses ${hist[0]} → ${hist[hist.length - 1]}`
                  : SKILLS[id].example}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function MissesChart({ values }: { values: number[] }) {
  if (!values.length) return <p className="text-ink-soft">No nights recorded yet.</p>;
  const shown = values.slice(-14);
  const offset = values.length - shown.length;
  const max = Math.max(...shown, 1);
  const w = 320;
  const h = 150;
  const gap = 8;
  const bw = Math.min(44, (w - gap * (shown.length - 1)) / shown.length);
  const total = bw * shown.length + gap * (shown.length - 1);
  const x0 = (w - total) / 2;
  return (
    <figure>
      <svg viewBox={`0 0 ${w} ${h + 24}`} className="w-full max-w-md" role="img" aria-label={`Misses per night: ${shown.join(", ")}`}>
        {shown.map((v, i) => {
          const bh = Math.max(4, (v / max) * (h - 26));
          const x = x0 + i * (bw + gap);
          const y = h - bh;
          const lastBar = i === shown.length - 1;
          return (
            <g key={i}>
              <rect x={x} y={y} width={bw} height={bh} rx={6} fill={lastBar ? "#2f6b5e" : "#a9cbbf"} />
              <text x={x + bw / 2} y={y - 6} textAnchor="middle" fontSize="13" fontWeight="700" fill="#1e2b33">
                {v}
              </text>
              <text x={x + bw / 2} y={h + 17} textAnchor="middle" fontSize="11" fill="#52616b">
                N{offset + i + 1}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption className="mt-1 text-sm text-ink-soft">Misses per night: {values.join(" → ")}</figcaption>
    </figure>
  );
}
