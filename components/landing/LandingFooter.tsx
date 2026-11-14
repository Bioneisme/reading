import Link from "next/link";
import { ReadlyLogo } from "@/components/ReadlyLogo";
import { DemoLink, RealLink } from "./LandingLinks";

const LINK = "text-[15px] font-extrabold text-ink underline underline-offset-4 decoration-2";

export function LandingFooter() {
  return (
    <footer className="mx-auto flex max-w-[1200px] flex-wrap justify-between gap-x-12 gap-y-6 px-6 pt-11 pb-[60px]">
      <div className="max-w-[520px] flex-[1_1_320px]">
        <ReadlyLogo size={30} />
        <p className="mt-3 text-[15px] leading-[1.6] font-semibold text-ink-2">
          The reading coach for parents. 10 minutes a night — know exactly what to fix.
        </p>
        <p className="mt-2.5 text-[13px] leading-[1.6] font-semibold text-ink-3">
          Readly is a coaching tool, not a medical or dyslexia diagnosis.
        </p>
      </div>
      <nav aria-label="Footer" className="flex flex-wrap items-start gap-x-7 gap-y-3">
        <DemoLink className={LINK}>Try the example</DemoLink>
        <RealLink href="/start" className={LINK}>
          Start free
        </RealLink>
        <Link href="/privacy" className={LINK}>
          Privacy
        </Link>
        <Link href="/terms" className={LINK}>
          Terms
        </Link>
      </nav>
      <p className="basis-full text-[13px] font-bold text-ink-3">© 2026 Readly</p>
    </footer>
  );
}
