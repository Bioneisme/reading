import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import type Stripe from "stripe";
import { NO_SUBSCRIPTION, planOf, subscriptionFor } from "@/lib/server/subscription";

type Sub = Parameters<typeof planOf>[0];

const sub = (opts: { plan?: string; interval?: Stripe.Price.Recurring.Interval; trialEnd?: number | null }): Sub =>
  ({
    metadata: opts.plan ? { plan: opts.plan } : {},
    items: { data: opts.interval ? [{ price: { recurring: { interval: opts.interval } } }] : [] },
    trial_end: opts.trialEnd ?? null,
  }) as unknown as Sub;

describe("planOf", () => {
  it("trusts a known plan in the metadata", () => {
    expect(planOf(sub({ plan: "week", interval: "year" }))).toBe("week");
    expect(planOf(sub({ plan: "month" }))).toBe("month");
    expect(planOf(sub({ plan: "year" }))).toBe("year");
  });

  it("ignores unknown metadata and falls back to the price", () => {
    expect(planOf(sub({ plan: "lifetime", interval: "year" }))).toBe("year");
  });

  it("tells the weekly start from the 4-week plan by its trial", () => {
    expect(planOf(sub({ interval: "week", trialEnd: 1_800_000_000 }))).toBe("week");
    expect(planOf(sub({ interval: "week" }))).toBe("month");
    expect(planOf(sub({}))).toBe("month");
  });
});

describe("subscriptionFor", () => {
  it("reports no subscription when payments are not configured", async () => {
    await expect(subscriptionFor(null, "a@b.co")).resolves.toEqual(NO_SUBSCRIPTION);
  });
});
