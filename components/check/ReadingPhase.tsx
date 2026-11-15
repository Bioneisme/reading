import { Icon } from "@/components/kit";
import { TappablePassage } from "@/components/reading/TappablePassage";

export function ReadingPhase({
  name,
  text,
  marked,
  onToggle,
  hint,
  onPrint,
}: {
  name: string;
  text: string;
  marked: ReadonlySet<number>;
  onToggle: (i: number) => void;
  hint: string;
  onPrint: () => void;
}) {
  const count = marked.size;
  return (
    <main className="no-print mx-auto w-full max-w-[980px] flex-[1_0_auto] animate-rise px-6 pb-7 pt-[22px]">
      <div className="flex flex-wrap items-end justify-between gap-x-5 gap-y-3.5">
        <div className="flex-[1_1_320px]">
          <h1 className="m-0 text-[26px] font-black leading-[1.15] tracking-[-0.02em] md:text-[36px]">
            Tap the words {name} misses
          </h1>
          <p className="mt-1.5 text-base font-semibold leading-normal text-ink-2">{hint}</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onPrint}
            className="tactile inline-flex min-h-12 items-center gap-2 rounded-chip border-2 border-line-strong bg-card px-4 text-[15px] font-extrabold text-ink shadow-edge-strong"
          >
            <Icon name="print" size={18} />
            Print
          </button>
          <div
            role="status"
            aria-live="polite"
            className="flex items-center gap-2.5 rounded-button border-2 border-lamp-line bg-lamp-tint py-1.5 pl-1.5 pr-4"
          >
            <span
              key={count}
              className="inline-flex h-10 min-w-10 animate-pop items-center justify-center rounded-xl bg-lamp px-1.5 text-[22px] font-black tabular-nums shadow-[0_3px_0_#D99A0B]"
            >
              {count}
            </span>
            <span className="text-[15px] font-black text-lamp-ink">{count === 1 ? "word marked" : "words marked"}</span>
          </div>
        </div>
      </div>
      <div className="mt-[18px] rounded-[28px] border-2 border-line bg-card p-[18px] shadow-edge sm:p-8 md:p-11">
        <TappablePassage text={text} marked={marked} onToggle={onToggle} />
      </div>
      <p className="mt-3.5 text-sm font-bold text-ink-3">Reading from paper? Keep this screen open and tap along as you listen.</p>
    </main>
  );
}
