"use client";

import { useMemo } from "react";
import { Icon } from "@/components/kit";
import { SKILLS, computeProfile } from "@/lib/engine";
import { currentDay, doneToday } from "@/lib/client/progress";
import { useStore } from "@/lib/client/store";
import { RealLink } from "./LandingLinks";
import { cta } from "./styles";

export function ReturningCard() {
  const snap = useStore();
  const real = snap?.real;
  const child = real?.child;
  const sessions = useMemo(() => real?.sessions ?? [], [real]);

  const tonight = useMemo(() => {
    if (!sessions.length) return "Tonight: the first reading check · about 3 minutes";
    if (doneToday(sessions)) return "Tonight's reading is done · see you tomorrow";
    const focus = computeProfile(sessions).focus;
    const round = sessions.filter((s) => s.kind === "nightly" && s.focus === focus).length + 1;
    return `Tonight: ${SKILLS[focus].name}, round ${round} · about 10 minutes`;
  }, [sessions]);

  if (!child) return null;
  const day = currentDay(sessions);

  return (
    <div className="mx-auto mt-1 max-w-[1200px] animate-sheet px-6">
      <div className="flex flex-col items-start gap-4 rounded-[22px] border-2 border-line bg-card px-[18px] py-4 shadow-edge sm:flex-row sm:flex-wrap sm:items-center">
        <span aria-hidden="true" className="inline-flex size-[52px] shrink-0 items-center justify-center rounded-button bg-night text-lamp">
          <Icon name="moon" size={26} className="[&>path]:fill-current [&>path]:stroke-none" />
        </span>
        <div className="min-w-0 sm:flex-[1_1_240px]">
          <p className="text-[19px] font-black text-balance">
            Welcome back. Continue with {child.name}, Day {day}
          </p>
          <p className="mt-0.5 text-[15px] font-semibold text-ink-2">{tonight}</p>
        </div>
        <RealLink
          href="/journal"
          className={cta("primary", "min-h-[52px] w-full px-[22px] text-base sm:w-auto sm:min-w-[220px] sm:max-w-[280px]")}
        >
          Continue with {child.name}
          <Icon name="next" size={18} strokeWidth={2.4} />
        </RealLink>
      </div>
    </div>
  );
}
