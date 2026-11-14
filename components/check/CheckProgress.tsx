import Link from "next/link";

export function CheckProgress({ name, step, demo }: { name: string; step: number; demo: boolean }) {
  const labels = ["Read", `What ${name} said`, "Results"];
  return (
    <nav
      aria-label="Check progress"
      className="no-print mx-auto flex w-full max-w-[1120px] flex-wrap items-center gap-x-5 gap-y-2.5 px-6 pt-4"
    >
      <ol className="flex flex-[1_1_280px] gap-2">
        {labels.map((label, i) => {
          const on = i <= step;
          return (
            <li key={label} aria-current={i === Math.min(step, 2) ? "step" : undefined} className="min-w-0 flex-1">
              <div aria-hidden="true" className={`h-2 rounded-full ${on ? "bg-indigo" : "bg-[#E6DFD2]"}`} />
              <div className={`mt-1.5 truncate text-xs font-black ${on ? "text-[#2B2290]" : "text-ink-3"}`}>{label}</div>
            </li>
          );
        })}
      </ol>
      {demo && (
        <Link href="/start" className="text-link flex-none text-sm font-extrabold text-indigo underline underline-offset-2">
          Start with my child
        </Link>
      )}
    </nav>
  );
}
