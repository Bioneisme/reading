"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { Button, ButtonLink, Glim, Icon } from "@/components/kit";
import { ChildHeader } from "@/components/result/ChildHeader";
import { computeProfile, SKILLS } from "@/lib/engine";
import { verifyCheckout } from "@/lib/client/api";
import { store, useStore, type AppState } from "@/lib/client/store";
import { recallPlan } from "./plans";
import { Reminder } from "./Reminder";

type Status = "checking" | "paid" | "unpaid" | "error" | "missing";

const RISE = "animate-rise motion-safe:[animation-delay:var(--d)]";

function delay(ms: number) {
  return { "--d": `${ms}ms` } as CSSProperties;
}

function Step({ icon, tone, title, text, wait }: { icon: ReactNode; tone: string; title: string; text: string; wait: number }) {
  return (
    <li className={`flex items-start gap-3.5 rounded-[18px] border-2 border-line bg-card px-4 py-3.5 ${RISE}`} style={delay(wait)}>
      <span aria-hidden="true" className={`inline-flex h-10 w-10 flex-none items-center justify-center rounded-xl ${tone}`}>
        {icon}
      </span>
      <span>
        <span className="block text-[17px] font-black">{title}</span>
        <span className="mt-0.5 block text-[15px] font-semibold leading-normal text-ink-2">{text}</span>
      </span>
    </li>
  );
}

function MoonIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24">
      <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" fill="currentColor" />
    </svg>
  );
}

export function SuccessScreen() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const snap = useStore();
  const [result, setResult] = useState<{ id: string; status: Status } | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [plan] = useState(recallPlan);

  useEffect(() => {
    if (!sessionId) return;
    let alive = true;
    verifyCheckout(sessionId)
      .then(({ paid }) => {
        if (!alive) return;
        if (paid) store.setPro(true, plan?.id);
        setResult({ id: `${sessionId}:${attempt}`, status: paid ? "paid" : "unpaid" });
      })
      .catch((e: unknown) => {
        const unknown = e instanceof Error && /unknown session/i.test(e.message);
        if (alive) setResult({ id: `${sessionId}:${attempt}`, status: unknown ? "unpaid" : "error" });
      });
    return () => {
      alive = false;
    };
  }, [sessionId, attempt, plan]);

  const state = snap?.state ?? null;
  const settled = result && result.id === `${sessionId}:${attempt}` ? result.status : null;
  const status: Status = !sessionId ? (state?.pro ? "paid" : "missing") : (settled ?? "checking");

  const name = state?.child?.name ?? "your child";
  const Name = state?.child?.name ?? "Your child";
  const sessions = state?.sessions;
  const profile = useMemo(() => (sessions && sessions.length ? computeProfile(sessions) : null), [sessions]);
  const tonight = profile
    ? `A 10-minute session on ${SKILLS[profile.focus].name}, round ${profile.round} — with a new story.`
    : "A 10-minute session built from the first check — with a new story.";

  if (!snap || status === "checking") {
    return (
      <Shell state={state}>
        <div role="status" className="flex flex-col items-start gap-4 py-10">
          <span className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-tint border-t-indigo" aria-hidden="true" />
          <p className="text-xl font-black">Confirming your payment…</p>
          <p className="text-base font-semibold text-ink-2">This takes a few seconds.</p>
        </div>
      </Shell>
    );
  }

  if (status !== "paid") {
    const title =
      status === "error"
        ? "We couldn't reach the payment service"
        : status === "missing"
          ? "No payment to confirm here"
          : "We couldn't confirm the payment yet";
    const text =
      status === "error"
        ? "Nothing is lost. Check your connection and try again."
        : status === "missing"
          ? "Pick a plan to unlock the full 28-day plan. Tomorrow's free plan works either way."
          : "If you just paid, give it a few seconds and try again. If you closed the checkout, no charge was made.";
    return (
      <Shell state={state}>
        <section className="max-w-[640px] rounded-[28px] border-2 border-line bg-card p-[26px] shadow-edge">
          <h1 className="text-[28px] font-black leading-tight tracking-[-0.02em]">{title}</h1>
          <p className="mt-2 text-base font-semibold leading-normal text-ink-2">{text}</p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            {sessionId && (
              <Button onClick={() => setAttempt((a) => a + 1)}>
                <Icon name="retry" size={18} strokeWidth={2.4} />
                Try again
              </Button>
            )}
            <ButtonLink href="/plans" variant="secondary">
              Back to plans
            </ButtonLink>
          </div>
        </section>
      </Shell>
    );
  }

  return (
    <Shell state={state}>
      <div className="flex flex-wrap-reverse items-start gap-x-12 gap-y-8">
        <div className="min-w-0 flex-[1_1_460px]">
          <div className="inline-flex animate-pop motion-safe:[animation-delay:420ms]">
            <Glim pose="cheer" size={112} className="max-sm:size-24" />
          </div>
          <h1 className={`mt-5 text-[clamp(32px,3.8cqi,50px)] font-black leading-[1.06] tracking-[-0.03em] text-balance ${RISE}`} style={delay(60)}>
            You&apos;re all set. {Name}&apos;s plan is unlocked.
          </h1>
          <p
            className={`mt-3.5 inline-flex flex-wrap items-center gap-2 rounded-full border-2 border-line bg-card px-3 py-1.5 text-sm font-extrabold text-ink-2 ${RISE}`}
            style={delay(140)}
          >
            {plan ? `${plan.name} · ${plan.price}` : "28-day plan"}
            <span className="rounded-full bg-lamp-tint px-2 py-px text-[11px] font-black uppercase tracking-[0.06em] text-lamp-ink">Test payment</span>
          </p>

          <h2 className="mt-7 text-xl font-black">What happens next</h2>
          <ol className="mt-3 flex flex-col gap-2.5">
            <Step icon={<MoonIcon />} tone="bg-night text-lamp" title="Tonight" text={tonight} wait={220} />
            <Step
              icon={<Icon name="retry" size={22} strokeWidth={2.2} />}
              tone="bg-indigo-tint text-indigo"
              title="Every night"
              wait={300}
              text={`The plan updates from what ${name} reads. Tap, pick, done.`}
            />
            <Step
              icon={<Icon name="improving" size={22} strokeWidth={2.2} />}
              tone="bg-lamp-tint text-lamp-ink"
              title="Every week"
              wait={380}
              text={`A short summary in ${name}'s journal: what moved, what's next.`}
            />
          </ol>
          <ButtonLink href="/journal" block className="mt-[22px] min-h-[58px] max-w-[420px] text-lg font-black">
            See tonight&apos;s plan
            <Icon name="next" size={18} strokeWidth={2.4} />
          </ButtonLink>

          <Reminder name={state?.child?.name ?? ""} initial={state?.reminderTime ?? "19:30"} />

          <div className="mt-4 flex items-start gap-3 rounded-[18px] bg-indigo-tint px-4 py-3.5">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4B3FE0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="mt-px flex-none">
              <path d="M6 3h12v18l-6-4-6 4z" />
            </svg>
            <p className="text-[15px] font-bold leading-normal text-[#2B2290]">
              No login needed. {Name}&apos;s journal lives in this browser — bookmark it to come back tomorrow.
            </p>
          </div>
        </div>

        <div className={`relative min-w-0 flex-[1_1_380px] ${RISE}`} style={delay(120)}>
          <div className="aspect-[4/3] overflow-hidden rounded-hero bg-indigo-tint shadow-[0_6px_0_#DCD6FF]">
            <Image
              src="/images/photo-4-dad-boy.jpg"
              alt="A dad and his son high-five in the kitchen"
              width={612}
              height={408}
              priority
              className="block h-full w-full object-cover object-[35%_40%]"
            />
          </div>
          <div className="absolute -bottom-[18px] left-4 flex -rotate-2 animate-rise items-center gap-2.5 rounded-[18px] bg-night py-2.5 pl-2.5 pr-4 text-white shadow-[0_5px_0_#14124A] motion-safe:[animation-delay:520ms]">
            <span aria-hidden="true" className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] bg-lamp text-ink">
              <Icon name="check" size={20} strokeWidth={3} />
            </span>
            <span className="text-base font-black">28-day plan unlocked</span>
          </div>
        </div>
      </div>
    </Shell>
  );
}

function Shell({ state, children }: { state: AppState | null; children: ReactNode }) {
  return (
    <div className="@container min-h-screen bg-paper pb-14">
      <ChildHeader state={state} />
      <main className="mx-auto max-w-[1120px] px-6 pt-8 max-[399px]:px-4">{children}</main>
    </div>
  );
}
