import { ReadlyMark } from "@/components/kit";

export function PrintSheet({
  name,
  grade,
  text,
  words,
  own,
}: {
  name: string;
  grade: string;
  text: string;
  words: number;
  own: boolean;
}) {
  const long = words > 45;
  return (
    <section className="print-only bg-white text-ink">
      <div className="flex min-h-[9.3in] flex-col">
        <div className="flex items-center justify-between gap-4 border-b-[1.5px] border-[#D9D2C4] pb-3.5">
          <div className="flex items-center gap-2">
            <ReadlyMark size={32} />
            <span className="text-[17px] font-black tracking-[-0.02em]">Readly</span>
          </div>
          <span className="text-sm font-extrabold text-ink-2">
            Tonight&apos;s check · {name} · {grade}
          </span>
        </div>
        <div className={`${long ? "mt-7" : "mt-10"} text-base font-black uppercase tracking-[0.08em] text-ink-2`}>Read it out loud</div>
        <p className={`mt-4 font-read ${words > 62 ? "text-[26pt]" : "text-[30pt]"} tracking-normal text-ink [word-spacing:0.12em] ${long ? "leading-[1.6]" : "leading-[2.1]"}`}>
          {text}
        </p>
        <div className={`mt-auto ${long ? "pt-7" : "pt-10"} break-inside-avoid`}>
          <div className="rounded-button border-[1.5px] border-[#D9D2C4] px-6 py-5">
            <div className="text-base font-black">For the grown-up</div>
            <ol className="mt-2 list-decimal pl-[22px] text-base font-semibold leading-[1.6] text-[#3A3756]">
              <li>Sit side by side, so you can both see the words.</li>
              <li>Don&apos;t correct while {name} reads — just listen.</li>
              <li>On your phone, tap the words {name} misses in tonight&apos;s check.</li>
            </ol>
          </div>
          <div className="mt-4 flex items-center justify-between gap-4 text-[13px] font-bold text-[#5E5B78]">
            <span>
              {words} words · {grade}
              {own ? ` · from ${name}'s own book` : ""}
            </span>
            <span>Page 1 of 1</span>
          </div>
        </div>
      </div>
    </section>
  );
}
