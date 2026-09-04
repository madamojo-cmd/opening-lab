import assert from "node:assert/strict";
import test from "node:test";

import {
  effectiveDailyBlundrCardGoal,
  FREE_ACTIVE_OPENING_LIMIT,
  FREE_COMMERCIAL_ACCESS,
  FREE_DAILY_BLUNDR_CARD_LIMIT,
  FREE_DAILY_REVIEW_COMPLETION_LIMIT,
  isTrustedProAccess,
  PRO_DAILY_BLUNDR_CARD_MAX,
  type CommercialAccess,
} from "../commercialAccess";

const proAccess: CommercialAccess = {
  plan: "pro",
  entitlementActive: true,
  entitlementSource: "revenuecat",
  trialStatus: "active",
  expiresAt: "2026-09-11T00:00:00.000Z",
  currentPeriodEndAt: "2026-09-11T00:00:00.000Z",
  cancelAtPeriodEnd: false,
  limits: {
    dailyBlundrCards: PRO_DAILY_BLUNDR_CARD_MAX,
    reviewCompletionsPerDay: null,
    activeOpenings: null,
    premiumInsights: true,
  },
};

test("missing or inactive entitlement resolves to the Free limits", () => {
  assert.equal(FREE_COMMERCIAL_ACCESS.plan, "free");
  assert.equal(FREE_COMMERCIAL_ACCESS.entitlementActive, false);
  assert.equal(
    FREE_COMMERCIAL_ACCESS.limits.activeOpenings,
    FREE_ACTIVE_OPENING_LIMIT,
  );
  assert.equal(
    FREE_COMMERCIAL_ACCESS.limits.dailyBlundrCards,
    FREE_DAILY_BLUNDR_CARD_LIMIT,
  );
  assert.equal(
    FREE_COMMERCIAL_ACCESS.limits.reviewCompletionsPerDay,
    FREE_DAILY_REVIEW_COMPLETION_LIMIT,
  );
  assert.equal(FREE_COMMERCIAL_ACCESS.limits.premiumInsights, false);
  assert.equal(isTrustedProAccess(FREE_COMMERCIAL_ACCESS), false);
});

test("only a trusted active Pro entitlement unlocks Pro limits", () => {
  assert.equal(isTrustedProAccess(proAccess), true);
  assert.equal(effectiveDailyBlundrCardGoal(1, proAccess), 1);
  assert.equal(effectiveDailyBlundrCardGoal(99, proAccess), 99);
  assert.equal(effectiveDailyBlundrCardGoal(120, proAccess), 99);
});

test("downgraded users keep stored goals but receive the Free effective Daily cap", () => {
  assert.equal(
    effectiveDailyBlundrCardGoal(99, FREE_COMMERCIAL_ACCESS),
    FREE_DAILY_BLUNDR_CARD_LIMIT,
  );
  assert.equal(effectiveDailyBlundrCardGoal(1, FREE_COMMERCIAL_ACCESS), 1);
});
