"use client";

import { usePathname } from "next/navigation";
import { Icon } from "@/components/kit";
import { RealLink } from "@/components/landing/LandingLinks";
import { useStore } from "@/lib/client/store";

const DEMO_ROUTES = ["/check", "/result", "/journal", "/session", "/story"];

export function DemoBanner() {
  const snap = useStore();
  const path = usePathname() ?? "";
  if (snap?.mode !== "demo" || !DEMO_ROUTES.some((r) => path === r || path.startsWith(`${r}/`))) return null;
  const name = snap.state.child?.name ?? "Mia";

  return (
    <div
      role="note"
      aria-label="Example mode"
      className="no-print animate-fade border-b-2 border-lamp-edge bg-lamp text-ink"
    >
      <div className="mx-auto flex max-w-[1120px] items-center gap-3 px-6 py-2 max-[420px]:gap-2 max-[420px]:px-4">
        <span className="flex-none rounded-full bg-night px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.1em] text-lamp">
          Example
        </span>
        <p className="min-w-0 flex-1 text-sm font-extrabold leading-snug">
          <span className="max-sm:hidden">
            You&apos;re exploring a sample reader, {name}. Nothing here is about your child.
          </span>
          <span className="text-[13px] leading-tight sm:hidden">Sample reader, not your child.</span>
        </p>
        <RealLink
          href="/start"
          className="tactile inline-flex min-h-9 flex-none items-center gap-1.5 rounded-full bg-night px-3.5 text-sm font-black whitespace-nowrap text-white shadow-[0_3px_0_#14124A]"
        >
          <span className="max-[480px]:hidden">Start with my child</span>
          <span className="min-[481px]:hidden">Start mine</span>
          <Icon name="next" size={16} strokeWidth={2.6} />
        </RealLink>
      </div>
    </div>
  );
}
