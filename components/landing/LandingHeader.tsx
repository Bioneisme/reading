import Link from "next/link";
import { AccountLink } from "@/components/account/AccountLink";
import { ReadlyLogo } from "@/components/ReadlyLogo";
import { RealLink } from "./LandingLinks";
import { cta } from "./styles";

const NAV = [
  { href: "#how", label: "How it works" },
  { href: "#method", label: "The method" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

export function LandingHeader() {
  return (
    <header className="mx-auto flex max-w-[1200px] items-center gap-4 px-6 py-[18px]">
      <Link href="/" aria-label="Readly home" className="flex shrink-0 items-center rounded-chip">
        <ReadlyLogo size={36} />
      </Link>
      <nav aria-label="Main" className="ml-auto flex min-h-14 items-center gap-5 md:gap-7">
        {NAV.map((n) => (
          <a key={n.href} href={n.href} className="text-link hidden text-[15px] font-extrabold text-ink-2 md:inline">
            {n.label}
          </a>
        ))}
        <AccountLink className="max-[399px]:hidden" />
        <RealLink href="/start" className={cta("secondary", "min-h-11 rounded-chip px-[18px] text-[15px]")}>
          Start free
        </RealLink>
      </nav>
    </header>
  );
}
