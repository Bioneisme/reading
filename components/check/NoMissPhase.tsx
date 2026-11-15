import { Glim } from "@/components/kit";

export function NoMissPhase({ name, words, tomorrow }: { name: string; words: number; tomorrow: string }) {
  return (
    <main className="mx-auto w-full max-w-[680px] flex-[1_0_auto] animate-rise px-6 pb-10 pt-12 text-center">
      <div className="flex animate-pop justify-center">
        <Glim pose="cheer" size={150} />
      </div>
      <h1 className="mt-[18px] text-[32px] font-black leading-[1.1] tracking-[-0.02em] md:text-[46px]">No misses tonight!</h1>
      <p className="mx-auto mt-3 max-w-[480px] text-lg font-semibold leading-[1.6] text-ink-2">
        {name} read all {words} words without a slip. That&apos;s a strong sign.
      </p>
      <div className="mx-auto mt-7 max-w-[520px] rounded-[22px] border-2 border-line bg-card px-[22px] py-5 text-left shadow-edge">
        <div className="text-xs font-black uppercase tracking-[0.1em] text-indigo">Tomorrow</div>
        <div className="mt-1.5 text-lg font-extrabold leading-[1.45]">{tomorrow}</div>
      </div>
    </main>
  );
}
