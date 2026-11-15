import "server-only";
import type Stripe from "stripe";
import { normalizeEmail } from "./auth";
import type { PlanId } from "./stripe";

export interface SubscriptionInfo {
  pro: boolean;
  plan: PlanId | null;
  since: string | null;
  renewsAt: string | null;
  cancelAtPeriodEnd: boolean;
}

export const NO_SUBSCRIPTION: SubscriptionInfo = { pro: false, plan: null, since: null, renewsAt: null, cancelAtPeriodEnd: false };

const LIVE = new Set<Stripe.Subscription.Status>(["active", "trialing", "past_due"]);
const cache = new Map<string, { at: number; value: SubscriptionInfo }>();
const TTL = 60_000;

function planOf(sub: Stripe.Subscription): PlanId {
  const meta = sub.metadata?.plan;
  if (meta === "week" || meta === "month" || meta === "year") return meta;
  const interval = sub.items.data[0]?.price?.recurring?.interval;
  if (interval === "year") return "year";
  return sub.trial_end ? "week" : "month";
}

function periodEnd(sub: Stripe.Subscription): number | null {
  const item = sub.items.data[0] as (Stripe.SubscriptionItem & { current_period_end?: number }) | undefined;
  const legacy = (sub as Stripe.Subscription & { current_period_end?: number }).current_period_end;
  return item?.current_period_end ?? legacy ?? null;
}

async function liveSubscriptions(stripe: Stripe, email: string): Promise<Stripe.Subscription[]> {
  const customers = await stripe.customers.list({ email: normalizeEmail(email), limit: 10 });
  const subs: Stripe.Subscription[] = [];
  for (const c of customers.data) {
    const list = await stripe.subscriptions.list({ customer: c.id, status: "all", limit: 20 });
    subs.push(...list.data.filter((s) => LIVE.has(s.status)));
  }
  return subs.sort((a, b) => b.created - a.created);
}

export async function subscriptionFor(stripe: Stripe | null, email: string, fresh = false): Promise<SubscriptionInfo> {
  if (!stripe) return NO_SUBSCRIPTION;
  const key = normalizeEmail(email);
  const hit = cache.get(key);
  if (!fresh && hit && Date.now() - hit.at < TTL) return hit.value;
  const [sub] = await liveSubscriptions(stripe, key);
  const end = sub ? periodEnd(sub) : null;
  const value: SubscriptionInfo = sub
    ? {
        pro: true,
        plan: planOf(sub),
        since: new Date(sub.created * 1000).toISOString(),
        renewsAt: end ? new Date(end * 1000).toISOString() : null,
        cancelAtPeriodEnd: Boolean(sub.cancel_at_period_end),
      }
    : NO_SUBSCRIPTION;
  cache.set(key, { at: Date.now(), value });
  return value;
}

export async function setCancelAtPeriodEnd(stripe: Stripe, email: string, cancel: boolean): Promise<SubscriptionInfo> {
  const subs = await liveSubscriptions(stripe, email);
  await Promise.all(subs.map((s) => stripe.subscriptions.update(s.id, { cancel_at_period_end: cancel })));
  return subscriptionFor(stripe, email, true);
}
