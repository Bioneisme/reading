import Link from "next/link";
import type { ReactNode } from "react";
import { ReadlyLogo } from "@/components/ReadlyLogo";

export function AppHeader({ right, dark = false }: { right?: ReactNode; dark?: boolean }) {
  return (
    <header className={`no-print ${dark ? "on-dark bg-night" : "border-b-2 border-line-soft"}`}>
      <div className="mx-auto flex max-w-[1120px] items-center gap-3 px-6 py-3">
        <Link href="/" aria-label="Readly home" className="flex h-10 items-center">
          <ReadlyLogo size={36} onDark={dark} />
        </Link>
        <div className="flex-1" />
        {right}
      </div>
    </header>
  );
}
