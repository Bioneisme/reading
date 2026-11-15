import Link from "next/link";
import type { ReactNode } from "react";
import { ReadlyMark } from "./ReadlyLogo";

export function AppHeader({ right, dark = false }: { right?: ReactNode; dark?: boolean }) {
  return (
    <header className={`no-print ${dark ? "on-dark bg-night" : "border-b-2 border-line-soft"}`}>
      <div className="mx-auto flex max-w-[1120px] items-center gap-3 px-6 py-3 max-[420px]:px-4">
        <Link href="/" aria-label="Readly home" className="flex h-11 shrink-0 items-center gap-2">
          <ReadlyMark size={44} onDark={dark} />
          <span
            className={`text-[21px] font-black leading-none tracking-[-0.02em] ${dark ? "text-white" : "text-ink"} ${right ? "max-[420px]:hidden" : ""}`}
          >
            Readly
          </span>
        </Link>
        <div className="flex-1" />
        {right && <div className="flex min-w-0 items-center gap-2">{right}</div>}
      </div>
    </header>
  );
}
