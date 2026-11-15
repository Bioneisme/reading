"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, type ReactNode } from "react";
import { Icon } from "@/components/kit";
import { ChildHeader } from "@/components/result/ChildHeader";
import { computeProfile, SKILLS } from "@/lib/engine";
import { useStore } from "@/lib/client/store";
import { PlanIncluded } from "./PlanIncluded";
import { PlanPicker } from "./PlanPicker";

function Notice({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div role="status" className="mb-[22px] flex items-start gap-3.5 rounded-[20px] border-2 border-[#CFC9FF] bg-card px-[18px] py-4 shadow-[0_4px_0_#CFC9FF]">
      <span aria-hidden="true" className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-indigo-tint text-indigo">
        {icon}
      </span>
      <span>
        <span className="block text-[17px] font-black">{title}</span>
        <span className="mt-0.5 block text-[15px] font-semibold text-ink-2">{children}</span>
      </span>
    </div>
  );
}

function InfoIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v6M12 7.5v.5" />
    </svg>
  );
}

export function PlansScreen() {
  const snap = useStore();
  const params = useSearchParams();
  const canceled = params.get("canceled") === "1";
  const state = snap?.state ?? null;
  const name = state?.child?.name;
  const sessions = state?.sessions;

  const profile = useMemo(() => (sessions && sessions.length ? computeProfile(sessions) : null), [sessions]);
  const focus = profile ? SKILLS[profile.focus].name : SKILLS.magicE.name;
  const next = profile ? (profile.nextUp ? SKILLS[profile.nextUp].name : null) : SKILLS.digraphs.name;
  const shortName = (s: string) => s.split(":")[0];
  const who = name ?? "Your child";

  return (
    <div className="@container min-h-screen bg-paper pb-14">
      <ChildHeader state={state} />
      <main className="mx-auto max-w-[1120px] px-6 pt-7 max-[399px]:px-4">
        {canceled && (
          <Notice icon={<InfoIcon />} title="Checkout was cancelled. No charge was made.">
            {name ? `${name}'s` : "Your"} plan is still here whenever you&apos;re ready. Tomorrow&apos;s free plan works either way.
          </Notice>
        )}
        {state?.pro && (
          <Notice icon={<Icon name="check" size={22} strokeWidth={2.6} />} title={`${name ? `${name}'s` : "Your"} plan is already unlocked.`}>
            Nothing more to pay.{" "}
            <Link href="/journal" className="text-link font-extrabold text-indigo">
              Open the journal
            </Link>
          </Notice>
        )}
        <h1 className="max-w-[760px] text-[clamp(32px,3.8cqi,50px)] font-black leading-[1.06] tracking-[-0.03em] text-balance">
          {who}&apos;s 28-day reading plan is ready.
        </h1>
        <p className="mt-3 max-w-[640px] text-lg font-semibold leading-[1.55] text-ink-2">
          {profile
            ? `Built from tonight's check: ${shortName(focus)} first${next ? `, then ${shortName(next)}` : ""}. About 10 minutes a night.`
            : "Built from the first reading check. About 10 minutes a night."}
        </p>
        <div className="mt-7 grid grid-cols-[repeat(auto-fit,minmax(min(460px,100%),1fr))] items-start gap-6">
          <PlanPicker />
          <PlanIncluded name={name ?? "your child"} focus={focus} next={next} />
        </div>
      </main>
    </div>
  );
}
