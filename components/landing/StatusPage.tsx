import type { ReactNode } from "react";
import { AppHeader, Glim } from "@/components/kit";
import { Mail } from "./LegalPage";

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
      <main className="mx-auto w-full max-w-[620px] flex-[1_0_auto] animate-rise px-6 pt-16 pb-12 text-center">
        <div className="flex justify-center">
          <Glim pose={art === "bulb" ? "sleepy" : "reading"} size={150} className="[animation-delay:600ms]" />
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
