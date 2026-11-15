"use client";

import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/kit";
import { store } from "@/lib/client/store";
import { Moon } from "./icons";
import type { MoonState } from "./derive";

const MOON: Record<MoonState, { fill: string; stroke: string; label: string; aria: string }> = {
  read: { fill: "#FFC93C", stroke: "#FFC93C", label: "text-white", aria: "Read" },
  tonight: { fill: "transparent", stroke: "#FFD95E", label: "text-white", aria: "Tonight" },
  none: { fill: "transparent", stroke: "#5A55AE", label: "text-[#8F89E0]", aria: "No reading" },
};

export function JournalHeader({
  title,
  line,
  demo,
  streak,
  week,
}: {
  title: string;
  line: string;
  demo: boolean;
  streak: string;
  week: { letter: string; state: MoonState }[];
}) {
  const router = useRouter();
  return (
    <div className="on-dark bg-night text-white">
      <AppHeader
        dark
        right={
          demo ? (
            <button
              type="button"
              onClick={() => {
                store.exitDemo();
                router.push("/start");
              }}
              className="text-link shrink-0 cursor-pointer text-sm font-extrabold text-[#FFD95E] underline underline-offset-2"
            >
              Start with my child
            </button>
          ) : null
        }
      />
      <div className="mx-auto flex max-w-[1120px] flex-wrap items-end justify-between gap-5 px-6 pb-[30px] pt-[22px]">
        <div className="min-w-0 flex-[1_1_320px]">
          <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2.5">
            <h1 className="text-[clamp(36px,4.2vw,56px)] font-black leading-[1.04] tracking-[-0.03em]">{title}</h1>
            {demo && (
              <span
                title="Five sample nights, run through the real engine"
                className="rounded-full border-[1.5px] border-lamp-line bg-lamp-tint px-2.5 py-1 text-xs font-black uppercase tracking-[0.06em] text-lamp-ink"
              >
                Simulated week
              </span>
            )}
          </div>
          <p className="mt-2 text-lg font-bold leading-normal text-indigo-soft">{line}</p>
        </div>
        <div className="flex-[0_1_auto] animate-fade rounded-[22px] bg-night-2 px-[18px] py-3.5 shadow-[0_5px_0_#14124A]">
          <div className="text-[17px] font-black text-[#FFD95E]">{streak}</div>
          <ol aria-label="This week" className="mt-2.5 flex gap-2">
            {week.map((d, i) => {
              const m = MOON[d.state];
              return (
                <li
                  key={i}
                  aria-label={m.aria}
                  style={{ animationDelay: `${120 + i * 70}ms` }}
                  className="flex w-[30px] animate-rise flex-col items-center gap-1"
                >
                  <span
                    style={{ animationDelay: `${380 + i * 70}ms` }}
                    className={`inline-flex ${d.state === "read" ? "animate-pop" : ""}`}
                  >
                    <Moon fill={m.fill} stroke={m.stroke} />
                  </span>
                  <span aria-hidden="true" className={`text-[11px] font-black ${m.label}`}>
                    {d.letter}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}
