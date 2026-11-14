"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { store, useStore } from "@/lib/client/store";

export function Logo() {
  return (
    <Link href="/" className="inline-flex items-center gap-2 rounded-lg font-display text-xl font-semibold text-ink">
      <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden>
        <rect width="32" height="32" rx="10" fill="#2f6b5e" />
        <path d="M9 20c2.5 2.6 5 2.6 7 0s4.5-2.6 7 0" stroke="#f6c85f" strokeWidth="2.6" fill="none" strokeLinecap="round" />
        <path d="M9 13c2.5 2.6 5 2.6 7 0s4.5-2.6 7 0" stroke="#fff" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      </svg>
      Readly
    </Link>
  );
}

export function DemoBanner() {
  const snap = useStore();
  const router = useRouter();
  if (!snap || snap.mode !== "demo") return null;
  return (
    <div className="print:hidden border-b border-sun/60 bg-[#fff6dc]">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-sm">
        <p>
          <strong>This is an example</strong> with {snap.state.child?.name ?? "Mia"}, 6. Nothing here is your data.
        </p>
        <button
          type="button"
          onClick={() => {
            store.exitDemo();
            router.push("/start");
          }}
          className="min-h-10 rounded-full bg-ink px-4 py-1.5 font-semibold text-white hover:bg-ink/85"
        >
          Start with my child
        </button>
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="print:hidden mt-16 border-t border-line">
      <div className="mx-auto flex max-w-3xl flex-col gap-3 px-4 py-8 text-sm text-ink-soft sm:flex-row sm:items-center sm:justify-between">
        <p>Readly is a coaching tool for parents, not a medical test.</p>
        <nav className="flex gap-5">
          <Link href="/privacy" className="underline-offset-4 hover:underline">Privacy</Link>
          <Link href="/terms" className="underline-offset-4 hover:underline">Terms</Link>
        </nav>
      </div>
    </footer>
  );
}

export function Shell({
  children,
  width = "max-w-3xl",
  nav = true,
}: {
  children: ReactNode;
  width?: string;
  nav?: boolean;
}) {
  const snap = useStore();
  const hasChild = Boolean(snap?.state.child);
  return (
    <>
      <DemoBanner />
      <header className="print:hidden">
        <div className={`mx-auto flex ${width} items-center justify-between px-4 py-4`}>
          <Logo />
          {nav && hasChild && (
            <Link href="/journal" className="rounded-full px-3 py-2 text-sm font-semibold text-brand-strong hover:bg-brand-soft">
              {snap?.state.child?.name}&apos;s journal
            </Link>
          )}
        </div>
      </header>
      <main className={`mx-auto ${width} px-4 pb-8`}>{children}</main>
      <Footer />
    </>
  );
}
