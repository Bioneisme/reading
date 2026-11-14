import { SKILL_ORDER, SKILLS, type Profile, type SessionRecord, type SkillStatus } from "@/lib/engine";
import { StatusIcon } from "./icons";
import { skillNote } from "./derive";
import { SKILL_MAP_EXAMPLE, STATUS_LABEL } from "./skillCopy";
import { SECTION } from "./TonightCard";

const LOOK: Record<
  SkillStatus,
  { ink: string; fill: string; track: string; tile: string; card: string }
> = {
  mastered: {
    ink: "text-mastered-ink",
    fill: "bg-mastered",
    track: "bg-mastered-tint",
    tile: "border-mastered-ink bg-mastered-ink text-white",
    card: "border-solid border-line",
  },
  improving: {
    ink: "text-improving-ink",
    fill: "bg-improving",
    track: "bg-improving-tint",
    tile: "border-improving-ink bg-improving-ink text-white",
    card: "border-solid border-line",
  },
  needsWork: {
    ink: "text-needs-ink",
    fill: "bg-needs",
    track: "bg-needs-tint",
    tile: "border-needs bg-needs text-ink",
    card: "border-solid border-line",
  },
  notChecked: {
    ink: "text-ink-3",
    fill: "bg-transparent",
    track: "border-2 border-dashed border-unchecked-line bg-transparent",
    tile: "border-dashed border-unchecked-line bg-unchecked text-ink-3",
    card: "border-dashed border-edge",
  },
};

const LEGEND: SkillStatus[] = ["mastered", "improving", "needsWork", "notChecked"];

export function SkillsMap({
  profile,
  sessions,
  showTags,
}: {
  profile: Profile;
  sessions: SessionRecord[];
  showTags: boolean;
}) {
  return (
    <section aria-labelledby="skills-title" className={`${SECTION} p-[22px] sm:p-[26px]`}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1.5">
        <h2 id="skills-title" className="text-[26px] font-black tracking-[-0.02em]">
          Skills map
        </h2>
        <span className="text-sm font-bold text-ink-3">In the order kids usually learn them</span>
      </div>
      <ul aria-label="Legend" className="mt-3.5 flex flex-wrap gap-x-4 gap-y-2">
        {LEGEND.map((s) => (
          <li key={s} className={`inline-flex items-center gap-1.5 text-[13px] font-black ${LOOK[s].ink}`}>
            <StatusIcon status={s} />
            {STATUS_LABEL[s]}
          </li>
        ))}
      </ul>
      <ol className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-2.5">
        {SKILL_ORDER.map((id, i) => {
          const st = profile.skills[id];
          const look = LOOK[st.status];
          const note = skillNote(id, profile, sessions);
          const tag = !showTags ? null : id === profile.focus ? "Tonight's focus" : id === profile.nextUp ? "Next up" : null;
          const pct = st.status === "notChecked" ? 0 : Math.round(st.progress * 100);
          return (
            <li
              key={id}
              className={`flex items-start gap-3 rounded-[18px] border-2 bg-card px-3.5 py-3 ${look.card}`}
            >
              <span
                aria-hidden="true"
                className={`inline-flex h-9 w-[34px] flex-none items-center justify-center rounded-[10px] border-2 font-read text-[17px] font-bold ${look.tile}`}
              >
                {i + 1}
              </span>
              <span className="min-w-0 flex-auto">
                <span className="flex items-start justify-between gap-2">
                  <span className="text-[15px] font-black leading-[1.3]">{SKILLS[id].name}</span>
                  {tag && (
                    <span
                      className={`flex-none rounded-full px-2 py-0.5 text-[11px] font-black ${
                        tag === "Next up" ? "bg-lamp text-ink" : "bg-indigo text-white"
                      }`}
                    >
                      {tag}
                    </span>
                  )}
                </span>
                <span className="mt-0.5 block font-read text-base text-ink-2">{SKILL_MAP_EXAMPLE[id]}</span>
                <span className="mt-2 flex items-center gap-2.5">
                  <span aria-hidden="true" className={`block h-2 flex-auto overflow-hidden rounded-full ${look.track}`}>
                    <span className={`block h-full ${look.fill}`} style={{ width: `${pct}%` }} />
                  </span>
                  <span className={`inline-flex flex-none items-center gap-[5px] text-xs font-black ${look.ink}`}>
                    <StatusIcon status={st.status} size={15} />
                    {STATUS_LABEL[st.status]}
                  </span>
                </span>
                {note && <span className="mt-1 block text-[13px] font-extrabold text-ink-2">{note}</span>}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
