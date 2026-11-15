import Link from "next/link";
import type { ReactNode } from "react";
import { Icon, buttonClass } from "@/components/kit";

export function ArrowLeft({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </svg>
  );
}

export type FooterCta =
  | { label: string; onClick: () => void; disabled?: boolean; href?: undefined }
  | { label: string; href: string; onClick?: undefined; disabled?: undefined };

export function StepFooter({
  back,
  hint,
  cta,
  narrow = false,
}: {
  narrow?: boolean;
  back?: { label: string; onClick: () => void; desktopOnly?: boolean } | null;
  hint?: ReactNode;
  cta?: FooterCta | null;
}) {
  const ctaClass = buttonClass("primary", "lg", false, "flex-[1_1_240px] min-w-fit whitespace-nowrap max-w-[420px] ml-auto");
  return (
    <div className="no-print sticky bottom-0 z-10 mt-auto border-t-2 border-line bg-paper">
      <div className={`mx-auto flex ${narrow ? "max-w-[1088px]" : "max-w-[1120px]"} flex-wrap-reverse items-center gap-x-5 gap-y-3 px-6 py-3.5`}>
        {back && (
          <button
            type="button"
            onClick={back.onClick}
            className={`tactile ${back.desktopOnly ? "hidden sm:inline-flex" : "inline-flex"} min-h-14 flex-none items-center justify-center gap-2 rounded-button border-2 border-line-strong bg-card px-[18px] text-base font-extrabold text-ink shadow-edge-strong`}
          >
            <ArrowLeft />
            {back.label}
          </button>
        )}
        <div aria-live="polite" className="flex-[999_1_240px] text-[15px] font-bold leading-[1.45] text-ink-2">
          {hint}
        </div>
        {cta &&
          (cta.href !== undefined ? (
            <Link href={cta.href} className={ctaClass}>
              {cta.label}
              <Icon name="next" size={18} strokeWidth={2.4} />
            </Link>
          ) : (
            <button type="button" onClick={cta.onClick} disabled={cta.disabled} className={ctaClass}>
              {cta.label}
              <Icon name="next" size={18} strokeWidth={2.4} />
            </button>
          ))}
      </div>
    </div>
  );
}
