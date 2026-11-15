import type { ReactNode } from "react";

export function ExampleChip({ label = "Example", onDark = false }: { label?: string; onDark?: boolean }) {
  return (
    <span
      title="Sample data — real parents never see this"
      className={`rounded-full border-[1.5px] px-2.5 py-[3px] text-[11px] font-black uppercase tracking-[0.08em] ${
        onDark ? "border-white/35 bg-transparent text-lamp" : "border-lamp-line bg-lamp-tint text-lamp-ink"
      }`}
    >
      {label}
    </span>
  );
}

export function ChildChip({ name, grade, demo }: { name: string; grade?: string; demo?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border-2 border-line bg-card py-1.5 pl-3.5 pr-2">
      <span className="whitespace-nowrap text-[15px] font-extrabold">
        {name}
        {grade ? ` · ${grade}` : ""}
      </span>
      {demo && <ExampleChip />}
    </span>
  );
}

export function Pill({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border-2 border-line bg-card px-3.5 py-2 text-sm font-extrabold ${className}`}>
      {children}
    </span>
  );
}
