import assert from "node:assert/strict";
import test from "node:test";

import {
  LOCKED_STRIPE_PRO_ANNUAL_PRICE_ID,
  LOCKED_STRIPE_PRO_MONTHLY_PRICE_ID,
  priceForBillingPlan,
  readBillingConfig,
} from "../billingConfig";

const envNames = [
  "BLUNDR_BILLING_ENVIRONMENT",
  "BLUNDR_APP_ORIGIN",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_PRO_MONTHLY_PRICE_ID",
  "STRIPE_PRO_ANNUAL_PRICE_ID",
  "REVENUECAT_WEBHOOK_AUTHORIZATION",
  "REVENUECAT_REST_API_KEY",
] as const;

test("billing config fails closed and allows only locked test prices", () => {
  const previous = Object.fromEntries(
    envNames.map((name) => [name, process.env[name]]),
  );
  try {
    for (const name of envNames) delete process.env[name];
    assert.throws(() => readBillingConfig(), /billing_env_missing/);
    process.env.BLUNDR_BILLING_ENVIRONMENT = "test";
    process.env.BLUNDR_APP_ORIGIN = "https://blundr.test/path";
    process.env.STRIPE_SECRET_KEY = "sk_test";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec";
    process.env.STRIPE_PRO_MONTHLY_PRICE_ID = LOCKED_STRIPE_PRO_MONTHLY_PRICE_ID;
    process.env.STRIPE_PRO_ANNUAL_PRICE_ID = LOCKED_STRIPE_PRO_ANNUAL_PRICE_ID;
    process.env.REVENUECAT_WEBHOOK_AUTHORIZATION = "Bearer rc";
    const config = readBillingConfig();
    assert.equal(config.appOrigin, "https://blundr.test");
    assert.deepEqual(priceForBillingPlan(config, "monthly"), {
      ok: true,
      plan: "monthly",
      priceId: LOCKED_STRIPE_PRO_MONTHLY_PRICE_ID,
    });
    assert.deepEqual(priceForBillingPlan(config, "price_attacker"), {
      ok: false,
    });
    process.env.STRIPE_PRO_ANNUAL_PRICE_ID = "price_wrong";
    assert.throws(() => readBillingConfig(), /stripe_annual_price_mismatch/);
  } finally {
    for (const name of envNames) {
      if (previous[name]) process.env[name] = previous[name];
      else delete process.env[name];
    }
  }
});
