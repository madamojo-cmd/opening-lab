import assert from "node:assert/strict";
import test from "node:test";

import { resolveCommercialLifecycleState } from "../commercialLifecycle";

const nowMs = Date.parse("2026-09-12T12:00:00.000Z");
const future = "2026-09-19T12:00:00.000Z";
const past = "2026-09-01T12:00:00.000Z";

test("commercial lifecycle keeps RevenueCat entitlement as access authority", () => {
  assert.equal(
    resolveCommercialLifecycleState({
      entitlementActive: false,
      subscriptionStatus: null,
      trialEndAt: null,
      expiresAt: null,
      currentPeriodEndAt: null,
      cancelAtPeriodEnd: false,
      planInterval: null,
      nowMs,
    }),
    "free",
  );
  assert.equal(
    resolveCommercialLifecycleState({
      entitlementActive: true,
      subscriptionStatus: "trialing",
      trialEndAt: future,
      expiresAt: future,
      currentPeriodEndAt: future,
      cancelAtPeriodEnd: false,
      planInterval: "monthly",
      nowMs,
    }),
    "trialing",
  );
  assert.equal(
    resolveCommercialLifecycleState({
      entitlementActive: true,
      subscriptionStatus: "active",
      trialEndAt: past,
      expiresAt: future,
      currentPeriodEndAt: future,
      cancelAtPeriodEnd: false,
      planInterval: "annual",
      nowMs,
    }),
    "active",
  );
  assert.equal(
    resolveCommercialLifecycleState({
      entitlementActive: true,
      subscriptionStatus: "active",
      trialEndAt: past,
      expiresAt: future,
      currentPeriodEndAt: future,
      cancelAtPeriodEnd: true,
      planInterval: "annual",
      nowMs,
    }),
    "canceling",
  );
  assert.equal(
    resolveCommercialLifecycleState({
      entitlementActive: true,
      subscriptionStatus: "past_due",
      trialEndAt: past,
      expiresAt: future,
      currentPeriodEndAt: future,
      cancelAtPeriodEnd: false,
      planInterval: "monthly",
      nowMs,
    }),
    "past_due",
  );
  assert.equal(
    resolveCommercialLifecycleState({
      entitlementActive: false,
      subscriptionStatus: "canceled",
      trialEndAt: past,
      expiresAt: past,
      currentPeriodEndAt: past,
      cancelAtPeriodEnd: false,
      planInterval: "monthly",
      nowMs,
    }),
    "expired",
  );
});
