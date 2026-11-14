"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { createCheckout, type PlanId } from "@/lib/client/api";
import { useStore } from "@/lib/client/store";
import { Shell } from "@/components/Shell";
import { Button, Card, CheckIcon, Eyebrow, H1, Loading } from "@/components/ui";

const PLANS: { id: PlanId; name: string; price: string; note: string; badge?: string }[] = [
  { id: "week", name: "1 week", price: "$6.93", note: "then $19.99 every 4 weeks" },
  { id: "month", name: "4 weeks", price: "$14.99", note: "then $19.99 every 4 weeks" },
  { id: "year", name: "1 year", price: "$119", note: "$9.92/month, billed yearly", badge: "Best value" },
];

const INCLUDED = [
  "A practice story every night, built for the skill your child needs (every word checked)",
  "The full 28-day plan, updated from each night's misses",
  "A 10-minute check every night, with “Say this” scripts",
  "Skills map and progress across all 11 reading skills",
  "A weekly summary in plain language",
];

export default function PlansPage() {
  return (
    <Suspense fallback={<Shell><Loading /></Shell>}>
      <Plans />
    </Suspense>
  );
}

function Plans() {
  const snap = useStore();
  const params = useSearchParams();
  const canceled = params.get("canceled") === "1";
  const [plan, setPlan] = useState<PlanId>("year");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const name = snap?.state.child?.name;

  const go = async () => {
    setBusy(true);
    setError(null);
    try {
      const { url } = await createCheckout(plan);
      window.location.assign(url);
    } catch {
      setError("We couldn't open the secure checkout just now. Please try again in a moment.");
      setBusy(false);
    }
  };

  return (
    <Shell width="max-w-2xl">
      {canceled && (
        <div role="status" className="mb-6 rounded-2xl border border-line bg-surface p-4">
          <p className="font-semibold">No problem — you weren&apos;t charged.</p>
          <p className="text-ink-soft">Your free results and tomorrow&apos;s plan are still here whenever you need them.</p>
        </div>
      )}
      <Eyebrow>Your plan</Eyebrow>
      <H1 className="mt-2">{name ? `${name}'s` : "Your child's"} 28-day reading plan is ready.</H1>

      <fieldset className="mt-6 grid gap-3">
        <legend className="sr-only">Choose a plan</legend>
        {PLANS.map((p) => {
          const on = plan === p.id;
          return (
            <label
              key={p.id}
              className={`relative flex min-h-20 cursor-pointer items-center gap-4 rounded-2xl border-2 p-4 transition-colors has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-brand ${
                on ? "border-brand bg-brand-soft" : "border-line bg-surface hover:border-brand/50"
              }`}
            >
              <input
                type="radio"
                name="plan"
                value={p.id}
                checked={on}
                onChange={() => setPlan(p.id)}
                className="h-5 w-5 shrink-0 accent-[#2f6b5e]"
              />
              <span className="flex-1">
                <span className="flex flex-wrap items-center gap-2 text-lg font-semibold">
                  {p.name}
                  {p.badge && (
                    <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-white">{p.badge}</span>
                  )}
                </span>
                <span className="block text-sm text-ink-soft">{p.note}</span>
              </span>
              <span className="font-display text-2xl font-semibold">{p.price}</span>
            </label>
          );
        })}
      </fieldset>

      <Button variant="accent" className="mt-6 w-full" onClick={go} disabled={busy}>
        {busy ? "Opening secure checkout…" : "Continue"}
      </Button>
      {error && (
        <p role="alert" className="mt-3 rounded-xl bg-accent-soft p-3 text-[#8a3d1c]">
          {error}
        </p>
      )}
      <p className="mt-3 text-center text-sm text-ink-soft">Cancel anytime in one click · Secure payment by Stripe</p>
      <p className="mt-4 rounded-2xl border border-dashed border-ink-soft/40 bg-paper p-3 text-center text-sm">
        <strong>Test mode</strong> — use card 4242 4242 4242 4242, any future date, any CVC.
      </p>

      <Card className="mt-8">
        <p className="font-semibold">What&apos;s included</p>
        <ul className="mt-3 grid gap-2">
          {INCLUDED.map((t) => (
            <li key={t} className="flex items-start gap-2">
              <CheckIcon className="mt-1 h-4 w-4 shrink-0 text-brand" />
              {t}
            </li>
          ))}
        </ul>
      </Card>
    </Shell>
  );
}
