import type { PlanId } from "@/lib/client/api";

export interface PlanOption {
  id: PlanId;
  name: string;
  price: string;
  terms: string;
  per?: string;
  badge?: string;
}

export const PLAN_OPTIONS: PlanOption[] = [
  { id: "week", name: "1 week", price: "$6.93", terms: "then $19.99 every 4 weeks" },
  { id: "month", name: "4 weeks", price: "$14.99", terms: "then $19.99 every 4 weeks" },
  { id: "year", name: "1 year", price: "$119", terms: "then $119 every year", per: "$9.92/month", badge: "Best value" },
];

export const CHOSEN_PLAN_KEY = "readly:chosen-plan";

export function planById(id: string | null | undefined): PlanOption | undefined {
  return PLAN_OPTIONS.find((p) => p.id === id);
}

export function rememberPlan(id: PlanId) {
  try {
    window.sessionStorage.setItem(CHOSEN_PLAN_KEY, id);
  } catch {}
}

export function recallPlan(): PlanOption | undefined {
  try {
    return planById(window.sessionStorage.getItem(CHOSEN_PLAN_KEY));
  } catch {
    return undefined;
  }
}
