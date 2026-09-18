import type { BillingPlan } from "@/lib/blundr/billing/billingConfig";

export type CommercialLifecycleState =
  | "free"
  | "trialing"
  | "active"
  | "canceling"
  | "past_due"
  | "expired";

export type CommercialLifecycleInput = {
  entitlementActive: boolean;
  subscriptionStatus: string | null;
  trialEndAt: string | null;
  expiresAt: string | null;
  currentPeriodEndAt: string | null;
  cancelAtPeriodEnd: boolean;
  planInterval: BillingPlan | null;
  nowMs: number;
};

function future(value: string | null, nowMs: number): boolean {
  return Boolean(value && Date.parse(value) > nowMs);
}

export function resolveCommercialLifecycleState(
  input: CommercialLifecycleInput,
): CommercialLifecycleState {
  const status = String(input.subscriptionStatus ?? "").toLowerCase();
  if (status === "past_due" || status === "unpaid") return "past_due";
  if (input.entitlementActive) {
    if (input.cancelAtPeriodEnd) return "canceling";
    if (status === "trialing" && future(input.trialEndAt, input.nowMs)) {
      return "trialing";
    }
    return "active";
  }
  if (
    status === "canceled" ||
    status === "incomplete_expired" ||
    status === "expired" ||
    input.expiresAt ||
    input.currentPeriodEndAt
  ) {
    return "expired";
  }
  return "free";
}

export function commercialPlanLabel(planInterval: BillingPlan | null): string {
  if (planInterval === "annual") return "$69.99/year";
  if (planInterval === "monthly") return "$9.99/month";
  return "current provider price";
}
