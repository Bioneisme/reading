export function CheckProgress({ name, step }: { name: string; step: number }) {
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
              <div aria-hidden="true" className="h-2 overflow-hidden rounded-full bg-[#E6DFD2]">
                <div className="bar-fill h-full rounded-full bg-indigo" style={{ width: on ? "100%" : "0%" }} />
              </div>
              <div className={`mt-1.5 truncate text-xs font-black transition-colors duration-300 ${on ? "text-[#2B2290]" : "text-ink-3"}`}>
                {label}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
