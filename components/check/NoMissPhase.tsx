export function NoMissPhase({ name, words, tomorrow }: { name: string; words: number; tomorrow: string }) {
  const tile = "absolute inline-flex items-center justify-center border-2 font-read font-bold";
  return (
    <main className="mx-auto w-full max-w-[680px] flex-[1_0_auto] px-6 pb-10 pt-12 text-center">
      <div aria-hidden="true" className="relative mx-auto h-[150px] w-[220px]">
        <span className={`${tile} left-2.5 top-[46px] h-[52px] w-[46px] -rotate-12 rounded-[13px] border-edge bg-card text-[28px] shadow-[0_5px_0_#E4DBCB]`}>
          a
        </span>
        <span className={`${tile} left-16 top-1 h-[100px] w-[92px] rounded-[26px] border-[#E8AE1C] bg-lamp text-ink shadow-[0_7px_0_#D99A0B]`}>
          <svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </span>
        <span className={`${tile} right-2 top-[60px] h-[52px] w-[46px] rotate-[10deg] rounded-[13px] border-[#3F33CF] bg-indigo text-[28px] text-white shadow-[0_5px_0_#3328B0]`}>
          e
        </span>
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
