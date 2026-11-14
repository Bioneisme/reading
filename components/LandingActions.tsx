"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { store, useStore } from "@/lib/client/store";
import { currentDay } from "@/lib/client/progress";
import { btn } from "@/components/ui";

export function TryExampleButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      className={`${btn.accent} ${className}`}
      onClick={() => {
        store.startDemo();
        router.push("/check");
      }}
    >
      Try a 60-second example: Mia, 6
    </button>
  );
}

export function StartButton({ className = "", variant = "secondary" }: { className?: string; variant?: keyof typeof btn }) {
  const router = useRouter();
  return (
    <button
      type="button"
      className={`${btn[variant]} ${className}`}
      onClick={() => {
        store.exitDemo();
        router.push("/start");
      }}
    >
      Start with my child →
    </button>
  );
}

export function ContinueBanner() {
  const snap = useStore();
  const router = useRouter();
  const real = snap?.real;
  if (!real?.child) return null;
  const hasCheck = real.sessions.length > 0;
  const day = currentDay(real.sessions);
  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-brand/25 bg-brand-soft px-5 py-4">
      <p className="font-semibold text-brand-strong">Welcome back. Ready for tonight?</p>
      <button
        type="button"
        className={btn.primary}
        onClick={() => {
          store.exitDemo();
          router.push(hasCheck ? (real.pro ? "/journal" : "/result") : "/check");
        }}
      >
        Continue with {real.child.name} — Day {day}
      </button>
    </div>
  );
}

export function FooterCta() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
      <TryExampleButton />
      <Link href="/start" className={btn.secondary} onClick={() => store.exitDemo()}>
        Start with my child →
      </Link>
    </div>
  );
}
