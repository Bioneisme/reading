import type { ReactNode } from "react";

export const LIFT =
  "[transition-property:transform,translate,box-shadow,border-color,background-color]! motion-safe:hover:-translate-y-[3px]";

export function CheckBadge() {
  return (
    <span
      aria-hidden="true"
      className="absolute -right-2 -top-2.5 inline-flex animate-pop h-[30px] w-[30px] items-center justify-center rounded-full border-2 border-white bg-lamp text-ink"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
    </span>
  );
}

function ChevronRight({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={`flex-none ${className}`}>
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

export function PictureCard({
  selected,
  onSelect,
  art,
  artClass,
  title,
  sub,
  className = "mt-10",
  extra,
  compact = false,
  label,
}: {
  selected: boolean;
  onSelect: () => void;
  art: ReactNode;
  artClass: string;
  title: string;
  sub?: string;
  className?: string;
  extra?: ReactNode;
  compact?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={label}
      onClick={onSelect}
      className={`option ${LIFT} relative ${className} flex cursor-pointer flex-col rounded-[22px] border-2 bg-card p-0 text-left text-ink ${
        selected
          ? "border-indigo shadow-[0_4px_0_#4B3FE0] hover:shadow-[0_7px_0_#4B3FE0]"
          : "border-line shadow-[0_4px_0_#ECE4D6] hover:shadow-[0_7px_0_#DCD3C3]"
      }`}
    >
      <span aria-hidden="true" className={`flex justify-center rounded-t-[20px] ${artClass}`}>
        {art}
      </span>
      <span
        className={`flex flex-auto items-center justify-between gap-1.5 rounded-b-[20px] bg-indigo text-white ${
          compact ? "px-2.5 py-3 sm:p-3" : "px-3.5 py-3"
        }`}
      >
        <span>
          <span className={`block font-black leading-[1.2] ${compact ? "text-[14px] sm:text-[15px]" : "text-base"}`}>{title}</span>
          {sub && <span className="block text-[13px] font-bold text-[#DCD8FF]">{sub}</span>}
        </span>
        <ChevronRight className={compact ? "hidden sm:block" : ""} />
      </span>
      {selected && <CheckBadge />}
      {extra}
    </button>
  );
}
