import "server-only";
import Stripe from "stripe";

export type PlanId = "week" | "month" | "year";

export const PLANS: Record<PlanId, { label: string }> = {
  week: { label: "1 week $6.93, then $19.99 every 4 weeks" },
  month: { label: "4 weeks $14.99, then $19.99 every 4 weeks" },
  year: { label: "1 year $119" },
};

const INTRO_COUPON = "readly-intro-4w-500";

export function stripeClient(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  return key ? new Stripe(key) : null;
}

async function ensureIntroCoupon(stripe: Stripe): Promise<string> {
  try {
    await stripe.coupons.retrieve(INTRO_COUPON);
  } catch {
    await stripe.coupons.create({ id: INTRO_COUPON, amount_off: 500, currency: "usd", duration: "once", name: "First 4 weeks" });
  }
  return INTRO_COUPON;
}

const product = { name: "Readly reading plan" };
const every4Weeks = { unit_amount: 1999, currency: "usd", product_data: product, recurring: { interval: "week" as const, interval_count: 4 } };

export async function createCheckoutSession(
  stripe: Stripe,
  plan: PlanId,
  origin: string,
  email?: string | null,
): Promise<string> {
  const base: Stripe.Checkout.SessionCreateParams = {
    mode: "subscription",
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/plans?canceled=1`,
    subscription_data: { metadata: { plan } },
    ...(email ? { customer_email: email } : {}),
  };
  let params: Stripe.Checkout.SessionCreateParams;
  if (plan === "year") {
    params = {
      ...base,
      line_items: [{ quantity: 1, price_data: { unit_amount: 11900, currency: "usd", product_data: product, recurring: { interval: "year" } } }],
    };
  } else if (plan === "month") {
    params = {
      ...base,
      line_items: [{ quantity: 1, price_data: every4Weeks }],
      discounts: [{ coupon: await ensureIntroCoupon(stripe) }],
    };
  } else {
    params = {
      ...base,
      line_items: [
        { quantity: 1, price_data: every4Weeks },
        { quantity: 1, price_data: { unit_amount: 693, currency: "usd", product_data: { name: "Readly first week" } } },
      ],
      subscription_data: { trial_period_days: 7, metadata: { plan } },
    };
  }
  const session = await stripe.checkout.sessions.create(params);
  if (!session.url) throw new Error("Stripe returned no checkout URL");
  return session.url;
}

export interface CheckoutResult {
  paid: boolean;
  email: string | null;
  createdAt: number;
}

export async function checkoutResult(stripe: Stripe, sessionId: string): Promise<CheckoutResult> {
  const s = await stripe.checkout.sessions.retrieve(sessionId);
  return {
    paid: s.status === "complete" && (s.payment_status === "paid" || s.payment_status === "no_payment_required"),
    email: s.customer_details?.email ?? s.customer_email ?? null,
    createdAt: s.created * 1000,
  };
}
