import Link from "next/link";
import type { ReactNode } from "react";
import { AppHeader } from "@/components/kit";

export const CONTACT_EMAIL = "readly@13lab.tech";

export function Mail() {
  return (
    <a href={`mailto:${CONTACT_EMAIL}`} className="text-link font-extrabold text-indigo">
      {CONTACT_EMAIL}
    </a>
  );
}

const TABS = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
] as const;

export function LegalPage({
  current,
  title,
  summary,
  tone,
  children,
}: {
  current: "/privacy" | "/terms";
  title: string;
  summary: ReactNode;
  tone: "mastered" | "lamp";
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-paper pb-16 text-ink">
      <AppHeader />
      <main className="mx-auto max-w-[760px] animate-rise px-6 pt-7">
        <nav aria-label="Legal pages" className="inline-flex gap-1 rounded-button border-2 border-line bg-card p-1">
          {TABS.map((t) => {
            const on = t.href === current;
            return (
              <Link
                key={t.href}
                href={t.href}
                aria-current={on ? "page" : undefined}
                className={`inline-flex min-h-11 items-center rounded-xl px-[18px] text-[15px] font-black transition-colors duration-150 ${
                  on ? "bg-indigo text-white" : "text-ink hover:bg-indigo-tint"
                }`}
              >
                {t.label}
              </Link>
            );
          })}
        </nav>
        <h1 className="mt-6 text-[clamp(32px,3.6vw,46px)] leading-[1.08] font-black tracking-[-0.02em]">{title}</h1>
        <p className="mt-2 text-sm font-extrabold text-ink-3">Last updated November 15, 2026</p>
        <p
          className={`mt-5 rounded-[20px] px-5 py-[18px] text-lg leading-[1.45] font-black ${
            tone === "mastered" ? "bg-mastered-tint text-[#0F5534]" : "bg-lamp-tint text-[#4A3500]"
          }`}
        >
          {summary}
        </p>
        <div className="mt-7 flex flex-col gap-6">{children}</div>
      </main>
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-[21px] font-black">{title}</h2>
      <div className="mt-2 flex flex-col gap-2 text-[17px] leading-[1.65] font-semibold text-[#3A3756]">{children}</div>
    </section>
  );
}
