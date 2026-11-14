import Link from "next/link";
import type { ReactNode } from "react";
import { ReadlyMark } from "@/components/ReadlyLogo";
import { StepFooter, type FooterCta } from "@/components/reading/StepFooter";

function Chevron() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 6l-6 6 6 6" />
    </svg>
  );
}

export function QuizShell({
  stepLabel,
  done,
  onBack,
  backHref,
  aside,
  hint,
  cta,
  children,
}: {
  stepLabel: string;
  done: number;
  onBack?: () => void;
  backHref?: string;
  aside?: ReactNode;
  hint?: ReactNode;
  cta?: FooterCta | null;
  children: ReactNode;
}) {
  const backClass =
    "tactile inline-flex h-11 w-11 items-center justify-center rounded-chip border-2 border-edge bg-card text-ink";
  return (
    <div className="flex min-h-dvh flex-col bg-paper text-ink">
      <header className="mx-auto w-full max-w-[1088px] px-6 pt-3">
        <div className="grid grid-cols-[48px_1fr_48px] items-center gap-2">
          <div>
            {onBack ? (
              <button type="button" onClick={onBack} aria-label="Previous question" className={backClass}>
                <Chevron />
              </button>
            ) : backHref ? (
              <Link href={backHref} aria-label="Previous question" className={backClass}>
                <Chevron />
              </Link>
            ) : null}
          </div>
          <Link href="/" aria-label="Readly home" className="flex items-center gap-2 justify-self-center text-ink no-underline">
            <ReadlyMark size={30} />
            <span className="text-[19px] font-black tracking-[-0.02em]">Readly</span>
          </Link>
          <span className="justify-self-end whitespace-nowrap text-[13px] font-black text-ink-3">{stepLabel}</span>
        </div>
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={6}
          aria-valuenow={done}
          aria-label="Quiz progress"
          className="mx-auto mt-3 flex max-w-[720px] gap-1.5"
        >
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <span key={i} className={`h-2 flex-1 rounded-full ${i < done ? "bg-indigo" : "bg-[#E6DFD2]"}`} />
          ))}
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-[1088px] flex-[1_0_auto] items-start gap-x-12 px-6 pb-8 pt-[22px] lg:grid-cols-2">
        <div className="min-w-0">{children}</div>
        {aside && <div className="hidden min-w-0 pt-1.5 lg:block">{aside}</div>}
      </main>

      <StepFooter narrow hint={hint} cta={cta} />
    </div>
  );
}
