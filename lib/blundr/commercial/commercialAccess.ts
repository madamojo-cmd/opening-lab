export type CommercialPlan = "free" | "pro";

export type CommercialAccess = {
  plan: CommercialPlan;
  entitlementActive: boolean;
  entitlementSource: "revenuecat" | null;
  trialStatus: "none" | "active" | "expired";
  expiresAt: string | null;
  currentPeriodEndAt: string | null;
  cancelAtPeriodEnd: boolean;
  limits: {
    dailyBlundrCards: number;
    reviewCompletionsPerDay: number | null;
    activeOpenings: number | null;
    premiumInsights: boolean;
  };
};

export const FREE_ACTIVE_OPENING_LIMIT = 3;
export const FREE_DAILY_BLUNDR_CARD_LIMIT = 5;
export const FREE_DAILY_REVIEW_COMPLETION_LIMIT = 5;
export const PRO_DAILY_BLUNDR_CARD_MAX = 99;

export const FREE_COMMERCIAL_ACCESS: CommercialAccess = {
  plan: "free",
  entitlementActive: false,
  entitlementSource: null,
  trialStatus: "none",
  expiresAt: null,
  currentPeriodEndAt: null,
  cancelAtPeriodEnd: false,
  limits: {
    dailyBlundrCards: FREE_DAILY_BLUNDR_CARD_LIMIT,
    reviewCompletionsPerDay: FREE_DAILY_REVIEW_COMPLETION_LIMIT,
    activeOpenings: FREE_ACTIVE_OPENING_LIMIT,
    premiumInsights: false,
  },
};

export function isTrustedProAccess(access: CommercialAccess): boolean {
  return access.plan === "pro" && access.entitlementActive;
}

export function effectiveDailyBlundrCardGoal(
  requested: number,
  access: CommercialAccess,
): number {
  const normalized = Math.max(1, Math.min(PRO_DAILY_BLUNDR_CARD_MAX, requested));
  return isTrustedProAccess(access)
    ? normalized
    : Math.min(FREE_DAILY_BLUNDR_CARD_LIMIT, normalized);
}

export function sanitizeCommercialAccess(access: CommercialAccess) {
  return access;
}
