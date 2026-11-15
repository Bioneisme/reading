"use client";

import { useState } from "react";
import { Button, Icon } from "@/components/kit";
import { createCheckout, type PlanId } from "@/lib/client/api";
import { LIFT } from "@/components/quiz/PictureCard";
import { PLAN_OPTIONS, rememberPlan } from "./plans";

function friendly(err: unknown): string {
  const msg = err instanceof Error ? err.message : "";
  if (/not configured/i.test(msg)) return "Checkout isn't switched on here yet. The free plan and tomorrow's session still work.";
  return "We couldn't open the secure checkout just now. Check your connection and try again in a moment.";
}

export function PlanPicker() {
  const [plan, setPlan] = useState<PlanId>("year");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chosen = PLAN_OPTIONS.find((p) => p.id === plan) ?? PLAN_OPTIONS[2];

  const go = async () => {
    setBusy(true);
    setError(null);
    try {
      const { url } = await createCheckout(plan);
      rememberPlan(plan);
      window.location.assign(url);
    } catch (e) {
      setError(friendly(e));
      setBusy(false);
    }
  };

  return (
    <section aria-labelledby="pick-title" className="rounded-[28px] border-2 border-line bg-card p-[26px] shadow-edge max-sm:p-5">
      <h2 id="pick-title" className="text-[22px] font-black">
        Choose a plan
      </h2>
      <div role="radiogroup" aria-labelledby="pick-title" className="mt-[18px] flex flex-col gap-3.5">
        {PLAN_OPTIONS.map((p) => {
          const sel = p.id === plan;
          return (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={sel}
              onClick={() => setPlan(p.id)}
              className={`option ${LIFT} relative flex w-full cursor-pointer items-center gap-3.5 rounded-[20px] border-2 p-[18px] text-left text-ink max-sm:gap-3 max-sm:p-4 ${
                sel
                  ? "border-indigo bg-[#F4F2FF] shadow-[0_4px_0_#4B3FE0] hover:shadow-[0_7px_0_#4B3FE0]"
                  : "border-edge bg-card shadow-[0_4px_0_#E4DBCB] hover:shadow-[0_7px_0_#DCD3C3]"
              }`}
            >
              {p.badge && (
                <span className="absolute -top-[13px] left-[18px] rounded-full border-[1.5px] border-[#E8AE1C] bg-lamp px-2.5 py-[3px] text-xs font-black">
                  {p.badge}
                </span>
              )}
              <span
                aria-hidden="true"
                className={`inline-flex h-[26px] w-[26px] flex-none items-center justify-center rounded-full border-2 transition-colors duration-200 ${sel ? "border-indigo" : "border-unchecked-line"}`}
              >
                <span
                  className={`h-3 w-3 rounded-full bg-indigo transition-[scale,opacity] duration-200 ease-out ${sel ? "scale-100 opacity-100" : "scale-0 opacity-0"}`}
                />
              </span>
              <span className="min-w-0 flex-auto">
                <span className="block text-lg font-black">{p.name}</span>
                <span className="mt-0.5 block text-sm font-bold text-ink-2 max-[400px]:text-[13px]">
                  {p.terms.split(/ (?=every )/).map((part, i) => (
                    <span key={part}>
                      {i > 0 && " "}
                      <span className="whitespace-nowrap">{part}</span>
                    </span>
                  ))}
                </span>
              </span>
              <span className="flex-none text-right">
                <span className="block text-2xl font-black tracking-[-0.02em] max-[400px]:text-xl">{p.price}</span>
                {p.per && <span className="block text-sm font-extrabold text-[#2B2290]">{p.per}</span>}
              </span>
            </button>
          );
        })}
      </div>
      <Button onClick={go} disabled={busy} block className="mt-[22px] min-h-[60px] text-lg font-black whitespace-nowrap max-sm:px-4 max-[400px]:text-base">
        <Icon name="lock" size={18} strokeWidth={2.4} />
        {busy ? (
          "Opening secure checkout..."
        ) : (
          <span>
            Continue ·{" "}
            <span key={chosen.id} className="inline-block animate-pop">
              <span className="inline-block animate-fade">{chosen.price}</span>
            </span>{" "}
            today
          </span>
        )}
      </Button>
      {error && (
        <p role="alert" className="mt-3 rounded-2xl border-2 border-lamp-line bg-lamp-tint px-4 py-3 text-[15px] font-bold leading-normal text-lamp-ink">
          {error}
        </p>
      )}
      <ul className="mt-4 flex flex-wrap justify-center gap-x-[22px] gap-y-2">
        <li className="inline-flex items-center gap-2 text-sm font-extrabold">
          <Icon name="check" size={18} strokeWidth={2.6} className="text-mastered" />
          Cancel anytime in one click
        </li>
        <li className="inline-flex items-center gap-2 text-sm font-extrabold">
          <Icon name="shield" size={18} strokeWidth={2.2} className="text-indigo" />
          Secure payment by Stripe
        </li>
      </ul>
      <div className="mt-[18px] rounded-2xl border-2 border-dashed border-[#E8C65A] bg-[#FFFBEE] px-4 py-3.5">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2">
          <span className="rounded-full bg-lamp px-2.5 py-0.5 text-[11px] font-black uppercase tracking-[0.08em]">Test mode</span>
          <span className="text-sm font-extrabold">No real money is charged.</span>
        </div>
        <p className="mt-1.5 text-[15px] font-bold leading-normal text-[#4A3500]">
          Use card <span className="font-black tracking-[0.04em] whitespace-nowrap text-ink tabular-nums">4242 4242 4242 4242</span>, any future
          date, any CVC.
        </p>
      </div>
      <p className="mt-3.5 text-[13px] font-bold leading-[1.55] text-ink-3">
        Plans renew automatically until you cancel. Cancel in Settings in one click. No emails, no calls.
      </p>
    </section>
  );
}
