import type { ReactNode } from "react";
import { AppHeader, Icon } from "@/components/kit";
import { Mail } from "./LegalPage";

const TILE =
  "absolute inline-flex h-14 w-[50px] items-center justify-center rounded-chip border-2 font-read text-[30px] font-bold";

export function StatusPage({
  art,
  title,
  body,
  actions,
}: {
  art: "bulb" | "book";
  title: string;
  body: ReactNode;
  actions: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <AppHeader />
      <main className="mx-auto w-full max-w-[620px] flex-[1_0_auto] px-6 pt-16 pb-12 text-center">
        <div aria-hidden="true" className="relative mx-auto h-[132px] w-[180px]">
          <span className={`${TILE} top-10 left-1.5 -rotate-[14deg] border-edge bg-card shadow-[0_5px_0_#E4DBCB]`}>o</span>
          <span className="absolute top-0.5 left-14 inline-flex h-[82px] w-[72px] items-center justify-center rounded-[22px] bg-night text-lamp shadow-edge-night">
            {art === "bulb" ? (
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9V16h7v-2.1A6 6 0 0 0 12 3z" />
              </svg>
            ) : (
              <Icon name="book" size={40} strokeWidth={2.2} />
            )}
          </span>
          <span className={`${TILE} top-[50px] right-1 rotate-12 border-dashed border-[#BDB29F] bg-card text-[#A39A88]`}>p</span>
        </div>
        <h1 className="mt-[22px] text-[clamp(30px,3.4vw,42px)] leading-[1.12] font-black tracking-[-0.02em] text-balance">
          {title}
        </h1>
        <p className="mx-auto mt-3 max-w-[460px] text-lg leading-[1.6] font-semibold text-ink-2">{body}</p>
        <div className="mt-[26px] flex flex-wrap justify-center gap-3">{actions}</div>
        <p className="mt-[22px] text-sm font-bold text-ink-3">
          If this keeps happening, write to us at <Mail />.
        </p>
      </main>
    </div>
  );
}

export const STATUS_BUTTON = "min-h-14 max-w-[260px] flex-[1_1_200px] px-[22px] text-[17px]";
