import assert from "node:assert/strict";
import { existsSync } from "node:fs";
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
  assert.match(
    paywall,
    /const \[acknowledged, setAcknowledged\] = useState\(false\)/,
  );
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
  assert.match(
    checkoutService,
    /priceForBillingPlan\(input\.config, body\.plan\)/,
  );
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

  assert.match(
    migration,
    /create table if not exists public\.blundr_paid_offer_acceptances/,
  );
  assert.match(
    migration,
    /create table if not exists public\.blundr_free_active_opening_selections/,
  );
  assert.match(migration, /enable row level security/);
  assert.match(
    migration,
    /grant select on public\.blundr_paid_offer_acceptances/,
  );
  assert.match(migration, /to authenticated/);
  assert.match(migration, /grant select, insert, update, delete/);
  assert.match(migration, /to service_role/);
  assert.match(migration, /using \(user_id = auth\.uid\(\)\)/);
  assert.doesNotMatch(
    migration,
    /for insert to authenticated|for update to authenticated|for delete to authenticated/,
  );
  assert.doesNotMatch(migration, /user_metadata|raw_user_meta_data/);
});

test("Wave 2B browser route checks are backed by real pages and reject 404s", () => {
  const workflowPath =
    ".github/workflows/blundr-wave2b-commercial-validation.yml";
  const workflow = read(workflowPath);
  const browserHarness = read("scripts/wave2b-browser-qa.mjs");
  const routeTable = browserHarness.match(
    /const routeChecks = \[([\s\S]*?)\];/,
  );

  assert.doesNotMatch(workflow, /push:\s*\n\s*branches:/);
  assert.match(workflow, /workflow_dispatch:\s*\n\s*inputs:/);
  assert.match(
    workflow,
    /preview_url:\s*\n\s*description: Exact immutable non-production deployment URL/,
  );
  assert.match(
    workflow,
    /expected_sha:\s*\n\s*description: Exact 40-character candidate SHA/,
  );
  assert.match(workflow, /WAVE2B_PREVIEW_URL: \$\{\{ inputs\.preview_url \}\}/);
  assert.match(
    workflow,
    /WAVE2B_EXPECTED_SHA: \$\{\{ inputs\.expected_sha \}\}/,
  );
  assert.doesNotMatch(workflow, /WAVE2B_PREVIEW_URL: \$\{\{ secrets\./);
  assert.match(
    workflow,
    /expected_sha must be exactly 40 hexadecimal characters/,
  );
  assert.match(workflow, /expected_sha does not match the checked-out HEAD/);
  assert.match(workflow, /\/api\/health did not expose the expected SHA/);
  assert.match(workflow, /node scripts\/wave2b-browser-qa\.mjs/);
  assert.match(browserHarness, /classification: "BROWSER_CONTRACT_QA"/);
  assert.match(browserHarness, /acceptanceEligible: false/);

  assert.ok(routeTable, "browser QA routeChecks table must be present");
  assert.doesNotMatch(routeTable[1], /path: "\/rings"/);
  assert.doesNotMatch(routeTable[1], /path: "\/rewards"/);
  assert.doesNotMatch(routeTable[1], /requiredText: \[\/blundr\/i\]/i);
  assert.doesNotMatch(browserHarness, /locator\("body"\)\)\.toContainText/);
  assert.doesNotMatch(
    browserHarness,
    /toContainText\(text, \{ timeout: 15000 \}\)/,
  );
  assert.match(browserHarness, /did not produce a main-document response/);
  assert.match(browserHarness, /returned HTTP \$\{response\.status\(\)\}/);
  assert.match(browserHarness, /ended on unexpected path/);
  assert.match(browserHarness, /This page could not be found/);
  assert.match(browserHarness, /rendered a Not Found or generic error page/);
  assert.match(
    routeTable[1],
    /label: "settings-billing"[\s\S]*scopeSelector: "#billing"[\s\S]*Manage your Blundr plan from trusted billing state/,
  );
  assert.match(
    routeTable[1],
    /label: "progress"[\s\S]*path: "\/progress"[\s\S]*Daily rings[\s\S]*Tempo[\s\S]*Battery[\s\S]*Daily Blundr[\s\S]*STREAK & CONSISTENCY/,
  );

  const paths = [...routeTable[1].matchAll(/path: "([^"]+)"/g)].map(
    ([, path]) => path.split(/[?#]/)[0],
  );
  assert.ok(paths.length > 0, "browser QA must list standalone routes");
  for (const path of paths) {
    const pagePath =
      path === "/"
        ? "app/page.tsx"
        : join("app", path.replace(/^\//, ""), "page.tsx");
    assert.ok(
      existsSync(join(root, pagePath)),
      `${path} must have a real route at ${pagePath}`,
    );
  }
});

test("Wave 2B distinguishes mocked browser QA from real sandbox integration proof", () => {
  const workflow = read(
    ".github/workflows/blundr-wave2b-commercial-validation.yml",
  );
  const browserHarness = read("scripts/wave2b-browser-qa.mjs");
  const providerCheck = read("scripts/wave2b-provider-configuration-check.mjs");
  const sandboxProof = read("scripts/wave2b-sandbox-integration-proof.mjs");
  const billingConfig = read("lib/blundr/billing/billingConfig.ts");

  assert.match(workflow, /Run Wave 2B provider configuration check/);
  assert.match(
    workflow,
    /node scripts\/wave2b-provider-configuration-check\.mjs/,
  );
  assert.match(workflow, /Require real Wave 2B sandbox integration proof/);
  assert.match(workflow, /node scripts\/wave2b-sandbox-integration-proof\.mjs/);
  assert.match(workflow, /REVENUECAT_V2_SECRET_API_KEY/);
  assert.match(workflow, /BLUNDR_STAGING_SUPABASE_SECRET_KEY/);
  assert.match(
    workflow,
    /sandboxIntegrationProof: "blocked_until_real_provider_journey"/,
  );

  assert.match(providerCheck, /classification: "PROVIDER_CONFIGURATION_CHECK"/);
  assert.match(providerCheck, /provider-configuration-check\.json/);
  assert.match(providerCheck, /STABLE_CALLBACK_HOST/);
  assert.match(
    providerCheck,
    /blundr-staging-git-launc-291807-adamconnor00-gmailcoms-projects\.vercel\.app/,
  );
  assert.match(providerCheck, /callbackHostShaVerified/);
  assert.match(providerCheck, /method: "POST"/);
  assert.match(providerCheck, /stripeWebhookReachable/);
  assert.match(providerCheck, /revenueCatWebhookReachable/);
  assert.match(providerCheck, /monthlyPriceVerified/);
  assert.match(providerCheck, /annualPriceVerified/);
  assert.match(providerCheck, /customerPortalConfigured/);
  assert.match(providerCheck, /revenueCatV2ApiAuthenticated/);
  assert.match(providerCheck, /REVENUECAT_V2_SECRET_API_KEY/);
  assert.match(providerCheck, /api\.revenuecat\.com\/v2\/projects/);
  assert.match(providerCheck, /RevenueCat entitlement identifier must be pro/);
  assert.match(providerCheck, /RevenueCat offering identifier must be default/);
  assert.doesNotMatch(providerCheck, /REVENUECAT_REST_API_KEY/);

  assert.match(sandboxProof, /classification: "SANDBOX_INTEGRATION_PROOF"/);
  assert.match(
    sandboxProof,
    /blundr-staging-git-launc-291807-adamconnor00-gmailcoms-projects\.vercel\.app/,
  );
  assert.match(sandboxProof, /\$\{label\}CallbackHostSha/);
  assert.match(sandboxProof, /verifyStableCallbackHostSha\("before"\)/);
  assert.match(sandboxProof, /verifyStableCallbackHostSha\("after"\)/);
  assert.match(sandboxProof, /acceptanceEligible: false/);
  assert.match(sandboxProof, /acceptanceEligible = true/);
  assert.match(sandboxProof, /BLUNDR_STAGING_SUPABASE_SECRET_KEY/);
  assert.match(sandboxProof, /sb_secret_/);
  assert.match(sandboxProof, /auth\/v1\/admin\/users/);
  assert.match(sandboxProof, /price_1UDmveLuqtbLOQt39LJ8Pp4v/);
  assert.match(sandboxProof, /price_1UDmw4LuqtbLOQt3G6bgL5mY/);
  assert.match(sandboxProof, /stripe\.webhooks\.generateTestHeaderString/);
  assert.match(sandboxProof, /stripeWebhookDuplicateIdempotent/);
  assert.match(sandboxProof, /api\.revenuecat\.com\/v1\/subscribers/);
  assert.match(sandboxProof, /REVENUECAT_REST_API_KEY/);
  assert.match(sandboxProof, /backendProState/);
  assert.match(sandboxProof, /customerPortalCreated/);

  assert.match(billingConfig, /LOCKED_STRIPE_TEST_PRO_MONTHLY_PRICE_ID/);
  assert.match(billingConfig, /LOCKED_STRIPE_TEST_PRO_ANNUAL_PRICE_ID/);
  assert.match(billingConfig, /price_1UDmveLuqtbLOQt39LJ8Pp4v/);
  assert.match(billingConfig, /price_1UDmw4LuqtbLOQt3G6bgL5mY/);

  assert.match(
    browserHarness,
    /billingCoverage: "mocked_browser_contract_only"/,
  );
  assert.match(
    browserHarness,
    /providerProof: "separate_sandbox_integration_required"/,
  );
  assert.doesNotMatch(workflow, /WAVE2B_ACCEPTED=yes/);
  assert.doesNotMatch(workflow, /automated_checkout_not_enabled/);
  assert.doesNotMatch(workflow, /operator_checkout_required/);
});

test("Wave 2B sandbox validation excludes retired live Stripe prices from active code", () => {
  const retiredLivePrices = [
    "price_1UBaUQLGvBclDkdEYam8Nz43",
    "price_1UBaUQLGvBclDkdEZNLeAfpq",
  ];
  const activePaths = [
    ".github/workflows/blundr-wave2b-commercial-validation.yml",
    "scripts/wave2b-browser-qa.mjs",
    "scripts/wave2b-provider-configuration-check.mjs",
    "scripts/wave2b-sandbox-integration-proof.mjs",
    "lib/blundr/billing/billingConfig.ts",
    "lib/blundr/billing/stripeWebhook.server.ts",
    "lib/blundr/billing/__tests__/billingConfig.test.ts",
    "lib/blundr/billing/__tests__/checkoutAuthority.test.ts",
    "lib/blundr/billing/__tests__/providerWebhookAuthority.test.ts",
  ];

  for (const path of activePaths) {
    const source = read(path);
    for (const retiredLivePrice of retiredLivePrices) {
      assert.doesNotMatch(
        source,
        new RegExp(retiredLivePrice),
        `retired live price ${retiredLivePrice} must not appear in active Wave 2B path ${path}`,
      );
    }
  }
});
