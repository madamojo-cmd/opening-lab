import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");

test("paywall has no preselected paid plan and requires explicit acknowledgement", () => {
  const onboarding = read("components/onboarding/OnboardingV11Flow.tsx");
  const paywall = read("components/billing/PaywallPlanSelection.tsx");

  assert.match(onboarding, /selected=\{String\(selected \?\? ""\)\}/);
  assert.match(onboarding, /if \(step === "plan"\) return undefined;/);
  assert.doesNotMatch(onboarding, /selected \?\? state\.planIntent/);
  assert.match(paywall, /const \[acknowledged, setAcknowledged\] = useState\(false\)/);
  assert.match(paywall, /disabled=\{!acknowledged \|\| busy\}/);
  assert.match(paywall, /Start 7-day Pro trial - \$0 today/);
  assert.match(paywall, /\$9\.99\/month after trial/);
  assert.match(paywall, /\$69\.99\/year after trial/);
  assert.match(paywall, /Save 42%/);
});

test("checkout uses the Wave 2A authority path plus paid-offer consent", () => {
  const checkoutRoute = read("app/api/blundr/billing/checkout/route.ts");
  const checkoutService = read("lib/blundr/billing/checkout.server.ts");
  const paidOffer = read("lib/blundr/billing/paidOffer.server.ts");

  assert.match(checkoutRoute, /requireAcceptedOffer: true/);
  assert.match(checkoutService, /invalidClientAuthority/);
  assert.match(checkoutService, /priceForBillingPlan\(input\.config, body\.plan\)/);
  assert.match(checkoutService, /STRIPE_APP_USER_ID_METADATA_KEY/);
  assert.match(checkoutService, /claimAcceptedPaidOffer/);
  assert.match(paidOffer, /PAID_OFFER_VERSION = "paid-offer-v1"/);
  assert.match(paidOffer, /accepted_at/);
  assert.match(paidOffer, /checkout_started_at/);
  assert.match(paidOffer, /paid_offer_stale_or_unavailable/);
});

test("billing settings and portal never accept browser customer authority", () => {
  const settings = read("components/settings/SettingsPage.tsx");
  const portalRoute = read("app/api/blundr/billing/portal/route.ts");
  const checkoutService = read("lib/blundr/billing/checkout.server.ts");

  assert.match(settings, /\/api\/blundr\/billing\/status/);
  assert.match(settings, /\/api\/blundr\/billing\/portal/);
  assert.doesNotMatch(settings, /customerId/);
  assert.match(portalRoute, /createBillingPortalSession/);
  assert.match(checkoutService, /client_customer_rejected/);
  assert.match(checkoutService, /getStripeCustomerId/);
});

test("application enforcement reads trusted backend entitlement authority", () => {
  const access = read("lib/blundr/commercial/commercialAccess.server.ts");
  const gameData = read("lib/blundr/gameData/gameDataService.ts");
  const daily = read("lib/blundr/daily/productionDailyService.server.ts");
  const dailyHttp = read("lib/blundr/daily/dailyActionHttp.server.ts");
  const review = read("lib/blundr/reviewQueue/dailyReviewLimit.server.ts");
  const progress = read("lib/blundr/progress/durableProgressSummary.server.ts");

  assert.match(access, /blundr_trusted_entitlements/);
  assert.doesNotMatch(access, /user_metadata|raw_user_meta_data/);
  assert.match(gameData, /loadFreeActiveOpeningPolicy/);
  assert.match(daily, /effectiveDailyBlundrCardGoal/);
  assert.match(daily, /daily_card_limit_reached/);
  assert.match(dailyHttp, /daily_card_limit_reached/);
  assert.match(review, /MAX_DAILY_REVIEW_COMPLETIONS_PER_FREE_USER = 5/);
  assert.match(review, /resolveCommercialAccess/);
  assert.match(progress, /isTrustedProAccess/);
  assert.match(progress, /Upgrade to Blundr Pro to see weak-area/);
});

test("Wave 2B migration exposes safe read-only client state only", () => {
  const migration = read(
    "supabase/migrations/20260904170758_blundr_paywall_enforcement_authority.sql",
  );

  assert.match(migration, /create table if not exists public\.blundr_paid_offer_acceptances/);
  assert.match(migration, /create table if not exists public\.blundr_free_active_opening_selections/);
  assert.match(migration, /enable row level security/);
  assert.match(migration, /grant select on public\.blundr_paid_offer_acceptances/);
  assert.match(migration, /to authenticated/);
  assert.match(migration, /grant select, insert, update, delete/);
  assert.match(migration, /to service_role/);
  assert.match(migration, /using \(user_id = auth\.uid\(\)\)/);
  assert.doesNotMatch(migration, /for insert to authenticated|for update to authenticated|for delete to authenticated/);
  assert.doesNotMatch(migration, /user_metadata|raw_user_meta_data/);
});
