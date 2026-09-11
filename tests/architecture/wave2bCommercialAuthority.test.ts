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
  assert.match(paidOffer, /client_billing_authority_rejected/);
  assert.match(paidOffer, /priceId/);
  assert.match(paidOffer, /customerId/);
  assert.match(paidOffer, /userId/);
  assert.match(paidOffer, /trialEligible/);
  assert.match(paidOffer, /entitlement/);
});

test("billing settings and portal never accept browser customer authority", () => {
  const settings = read("components/settings/SettingsPage.tsx");
  const billingUpgradeRoute = read("app/billing/upgrade/page.tsx");
  const billingUpgrade = read("components/billing/BillingUpgradePage.tsx");
  const paywall = read("components/billing/PaywallPlanSelection.tsx");
  const billingSuccess = read("components/billing/BillingResultPage.tsx");
  const portalRoute = read("app/api/blundr/billing/portal/route.ts");
  const checkoutService = read("lib/blundr/billing/checkout.server.ts");

  assert.match(settings, /\/api\/blundr\/billing\/status/);
  assert.match(settings, /\/api\/blundr\/billing\/portal/);
  assert.match(settings, /href="\/billing\/upgrade"/);
  assert.doesNotMatch(settings, /href="\/onboarding\/plan"/);
  assert.match(billingSuccess, /href="\/billing\/upgrade"/);
  assert.doesNotMatch(billingSuccess, /href="\/onboarding\/plan"/);
  assert.match(billingUpgradeRoute, /BillingUpgradePage/);
  assert.match(billingUpgrade, /<PaywallPlanSelection[\s\S]*mode="upgrade"/);
  assert.match(
    billingUpgrade,
    /access\?\.plan === "pro" && access\.entitlementActive === true/,
  );
  assert.match(billingUpgrade, /\/api\/blundr\/billing\/status/);
  assert.match(billingUpgrade, /\/api\/blundr\/billing\/portal/);
  assert.match(paywall, /mode\?: "onboarding" \| "upgrade"/);
  assert.match(paywall, /!upgradeMode \? \(/);
  assert.match(paywall, /Return to Settings -&gt; Billing/);
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
  const billingRouteTable = browserHarness.match(
    /const billingReturnRouteChecks = \[([\s\S]*?)\];/,
  );
  const protectedRouteTable = browserHarness.match(
    /const protectedRouteChecks = \[([\s\S]*?)\];/,
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
  assert.match(
    workflow,
    /String\(process\.env\[config\.env\] \?\? ""\)\.trim\(\)/,
  );
  assert.match(workflow, /\/api\/health did not expose the expected SHA/);
  assert.match(workflow, /node scripts\/wave2b-browser-qa\.mjs/);
  assert.match(browserHarness, /classification: "BROWSER_CONTRACT_QA"/);
  assert.match(browserHarness, /acceptanceEligible: false/);
  assert.match(browserHarness, /requiredBrowserEnv/);
  assert.match(browserHarness, /createBrowserQaUser/);
  assert.match(browserHarness, /deleteBrowserQaUser/);
  assert.match(browserHarness, /BLUNDR_STAGING_SUPABASE_SECRET_KEY/);
  assert.match(browserHarness, /browser_qa_supabase_secret_must_be_sb_secret/);
  assert.match(browserHarness, /missing_or_empty:\$\{name\}/);
  assert.match(browserHarness, /missing_or_invalid:WAVE2B_QA_SUPABASE_UUID/);
  assert.match(browserHarness, /expectInputCommitted/);
  assert.match(browserHarness, /`\$\{label\}_input_not_committed`/);
  assert.match(browserHarness, /expectInputCommitted\(password, "password"\)/);
  assert.match(browserHarness, /waitForExpectedBrowserSession/);
  assert.match(browserHarness, /`\$\{label\}_session_not_established`/);
  assert.match(browserHarness, /login_auth_request_not_observed/);
  assert.match(browserHarness, /login_auth_rejected/);
  assert.match(browserHarness, /userMatchesExpected/);
  assert.match(browserHarness, /url\.pathname === "\/auth\/v1\/token"/);
  assert.match(
    browserHarness,
    /getByRole\("button", \{ name: "Log in", exact: true \}\)/,
  );
  assert.doesNotMatch(browserHarness, /name: \/sign in\|log in\|continue\/i/);
  assert.match(browserHarness, /entitlementSource: null/);
  assert.match(browserHarness, /trialStatus: "none"/);
  assert.match(browserHarness, /currentPeriodEndAt: null/);
  assert.match(browserHarness, /limits: \{/);
  assert.match(browserHarness, /dailyBlundrCards: 5/);
  assert.match(browserHarness, /reviewCompletionsPerDay: 5/);
  assert.match(browserHarness, /activeOpenings: 3/);
  assert.doesNotMatch(browserHarness, /\btier\b/);
  assert.doesNotMatch(browserHarness, /\bisPro\b/);
  assert.doesNotMatch(browserHarness, /\btrialActive\b/);
  assert.doesNotMatch(browserHarness, /\bcurrentPeriodEnd:/);
  assert.doesNotMatch(browserHarness, /\bdailyCardLimit\b/);
  assert.doesNotMatch(browserHarness, /\breviewCompletionLimit\b/);
  assert.doesNotMatch(browserHarness, /\bactiveOpeningLimit\b/);
  assert.doesNotMatch(browserHarness, /routeScope\.getByText\(text\)\.first/);
  assert.match(browserHarness, /billingReturnRouteChecks/);
  assert.match(browserHarness, /protectedRouteChecks/);
  assert.match(browserHarness, /completeFreeOnboarding/);
  assert.match(browserHarness, /validateSettingsUpgrade/);
  assert.match(browserHarness, /pathname === "\/billing\/upgrade"/);
  assert.match(browserHarness, /Upgrade to Blundr Pro\./);
  assert.match(browserHarness, /assertCheckoutRequestContainsOnlyPlan/);
  assert.match(browserHarness, /name: "Continue with Free"[\s\S]*exact: true/);

  assert.ok(
    billingRouteTable,
    "browser QA billingReturnRouteChecks table must be present",
  );
  assert.ok(
    protectedRouteTable,
    "browser QA protectedRouteChecks table must be present",
  );
  const allRouteTables = `${billingRouteTable[1]}\n${protectedRouteTable[1]}`;
  assert.doesNotMatch(allRouteTables, /path: "\/rings"/);
  assert.doesNotMatch(allRouteTables, /path: "\/rewards"/);
  assert.doesNotMatch(allRouteTables, /requiredText: \[\/blundr\/i\]/i);
  assert.doesNotMatch(browserHarness, /locator\("body"\)\)\.toContainText/);
  assert.match(browserHarness, /hasVisibleRequiredTextMatch/);
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
    protectedRouteTable[1],
    /label: "settings-billing"[\s\S]*scopeSelector: "#billing"[\s\S]*Manage your Blundr plan from trusted billing state/,
  );
  assert.match(
    protectedRouteTable[1],
    /label: "progress"[\s\S]*path: "\/progress"[\s\S]*Daily rings[\s\S]*Tempo[\s\S]*Battery[\s\S]*Daily Blundr[\s\S]*STREAK & CONSISTENCY/,
  );

  const paths = [...allRouteTables.matchAll(/path: "([^"]+)"/g)].map(
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

test("Wave 2B route required text accepts a visible duplicate after a hidden match", async () => {
  process.env.WAVE2B_PREVIEW_URL ??= "https://blundr-staging.example.test";
  process.env.WAVE2B_QA_EMAIL ??= "qa@example.test";
  process.env.WAVE2B_QA_PASSWORD ??= "not-a-real-password";
  process.env.WAVE2B_QA_SUPABASE_UUID ??=
    "11111111-1111-4111-8111-111111111111";
  process.env.ARTIFACT_DIR ??= "/tmp/blundr-wave2b-test-artifacts";
  const browserHarness = await import("../../scripts/wave2b-browser-qa.mjs");
  const visibilityByText = new Map<string, boolean[]>([
    ["Tempo", [false, true]],
    ["Battery", [false, false]],
  ]);
  const fakeScope = {
    getByText(text: RegExp) {
      const key = String(text).replace(/^\/|\/[a-z]*$/gi, "");
      const visibility = visibilityByText.get(key) ?? [];
      return {
        async count() {
          return visibility.length;
        },
        nth(index: number) {
          return {
            async isVisible() {
              return visibility[index] === true;
            },
          };
        },
      };
    },
  };

  assert.equal(
    await browserHarness.hasVisibleRequiredTextMatch(fakeScope, /Tempo/i),
    true,
    "hidden first match must not fail when a later duplicate is visible",
  );
  assert.equal(
    await browserHarness.hasVisibleRequiredTextMatch(fakeScope, /Battery/i),
    false,
    "required text must still fail when every duplicate is hidden",
  );
});

test("Wave 2B browser harness fails immediately when onboarding reset fails", async () => {
  process.env.WAVE2B_PREVIEW_URL ??= "https://blundr-staging.example.test";
  process.env.WAVE2B_QA_EMAIL ??= "qa@example.test";
  process.env.WAVE2B_QA_PASSWORD ??= "not-a-real-password";
  process.env.WAVE2B_QA_SUPABASE_UUID ??=
    "11111111-1111-4111-8111-111111111111";
  process.env.ARTIFACT_DIR ??= "/tmp/blundr-wave2b-test-artifacts";
  const browserHarness = await import("../../scripts/wave2b-browser-qa.mjs");
  const message = browserHarness.buildResetFailureMessage({
    status: 403,
    errorCode: "developer_access_denied",
    errorMessage:
      "User 11111111-1111-4111-8111-111111111111 is not allowlisted.",
  });

  assert.match(
    message,
    /QA onboarding reset failed: HTTP 403 developer_access_denied/,
  );
  assert.doesNotMatch(message, /11111111-1111-4111-8111-111111111111/);
  assert.match(message, /\[redacted(?:-uuid)?\]/);

  const source = read("scripts/wave2b-browser-qa.mjs");
  assert.match(
    source,
    /throw new Error\(buildResetFailureMessage\(diagnostics\.resetAttempt\)\)/,
  );
  assert.doesNotMatch(
    source,
    /if \(!diagnostics\.resetAttempt\.ok\) return state/,
  );
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
  assert.match(
    workflow,
    /Run Wave 2B provider configuration check[\s\S]*continue-on-error: true/,
  );
  assert.match(workflow, /Require real Wave 2B sandbox integration proof/);
  assert.match(workflow, /node scripts\/wave2b-sandbox-integration-proof\.mjs/);
  assert.match(workflow, /Record Wave 2B aggregate result/);
  assert.match(workflow, /wave2b-aggregate-result\.json/);
  assert.match(workflow, /providerCheckGatesSandbox: false/);
  assert.match(workflow, /mocksCanGrantAcceptance: false/);
  assert.match(workflow, /PROVIDER_CONFIGURATION_OUTCOME/);
  assert.match(workflow, /SANDBOX_INTEGRATION_OUTCOME/);
  assert.match(
    workflow,
    /STRIPE_WEBHOOK_SECRET: \$\{\{ secrets\.STRIPE_WEBHOOK_SECRET \}\}/,
  );
  assert.match(workflow, /REVENUECAT_V2_SECRET_API_KEY/);
  assert.match(
    workflow,
    /REVENUECAT_SANDBOX_APP_ID: \$\{\{ secrets\.REVENUECAT_SANDBOX_APP_ID \}\}/,
  );
  assert.match(workflow, /BLUNDR_STAGING_SUPABASE_SECRET_KEY/);
  assert.match(
    workflow,
    /sandboxIntegrationProof: "blocked_until_real_provider_journey"/,
  );

  assert.match(workflow, /timeout-minutes: 35/);
  assert.match(workflow, /uses: actions\/cache@v4/);
  assert.match(workflow, /~\/\.cache\/ms-playwright/);
  assert.match(workflow, /hashFiles\('package-lock\.json'\)/);
  assert.doesNotMatch(workflow, /playwright install --with-deps chromium/);
  assert.match(workflow, /npm exec -- playwright install-deps chromium/);
  assert.match(workflow, /npm exec -- playwright install chromium/);
  assert.match(
    workflow,
    /Install Chromium system dependencies[\s\S]*timeout-minutes: 8/,
  );
  assert.match(
    workflow,
    /Install Chromium browser if not cached[\s\S]*timeout-minutes: 8/,
  );
  assert.match(workflow, /Launch Chromium smoke test[\s\S]*timeout-minutes: 3/);
  assert.match(workflow, /import \{ chromium \} from "playwright"/);
  assert.match(workflow, /Run Wave 2B browser QA[\s\S]*timeout-minutes: 10/);
  assert.match(
    workflow,
    /Run Wave 2B browser QA[\s\S]*continue-on-error: true/,
  );
  assert.match(
    workflow,
    /Run Wave 2B provider configuration check[\s\S]*timeout-minutes: 5/,
  );
  assert.match(
    workflow,
    /Require real Wave 2B sandbox integration proof[\s\S]*timeout-minutes: 10/,
  );
  assert.match(
    workflow,
    /Require real Wave 2B sandbox integration proof[\s\S]*continue-on-error: true/,
  );
  assert.match(workflow, /Require Wave 2B acceptance-critical outcomes/);
  assert.match(workflow, /BROWSER_QA/);
  assert.match(workflow, /SANDBOX_INTEGRATION_PROOF/);
  assert.ok(
    workflow.indexOf("Preflight non-production configuration") <
      workflow.indexOf("Restore Playwright browser cache"),
    "preflight must fail before browser installation starts",
  );
  assert.ok(
    workflow.indexOf("Verify preview commit identity when exposed") <
      workflow.indexOf("Install Chromium system dependencies"),
    "preview identity must fail before Chromium installation starts",
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
  assert.match(
    providerCheck,
    /STRIPE_WEBHOOK_SECRET must be a Stripe webhook signing secret/,
  );
  assert.match(providerCheck, /revenueCatV1ApiAuthenticated/);
  assert.match(providerCheck, /revenueCatV2ApiAuthenticated/);
  assert.match(providerCheck, /revenueCatSandboxAppVerified/);
  assert.match(providerCheck, /revenueCatProductMappingVerified/);
  assert.match(providerCheck, /REVENUECAT_REST_API_KEY/);
  assert.match(providerCheck, /REVENUECAT_V2_SECRET_API_KEY/);
  assert.match(providerCheck, /REVENUECAT_SANDBOX_APP_ID/);
  assert.match(providerCheck, /appe3b4140fc1/);
  assert.match(providerCheck, /REVENUECAT_V2_API_ORIGIN/);
  assert.match(providerCheck, /api\.revenuecat\.com\/v2/);
  assert.match(providerCheck, /revenueCatV2\("\/projects"\)/);
  assert.match(providerCheck, /listItems\(projects\)\.map\(readId\)/);
  assert.match(
    providerCheck,
    /projects\/\$\{encodeURIComponent\(projectId\)\}\/apps/,
  );
  assert.doesNotMatch(
    providerCheck,
    /revenueCatV2\(`\/projects\/\$\{encodeURIComponent\(projectId\)\}`\)/,
  );
  assert.match(providerCheck, /apps\/\$\{encodeURIComponent\(appId\)\}/);
  assert.match(providerCheck, /findUniqueLookupResource/);
  assert.match(providerCheck, /lookup_key === lookupKey/);
  assert.match(providerCheck, /entitlementResourceId/);
  assert.match(providerCheck, /offeringResourceId/);
  assert.match(
    providerCheck,
    /entitlements\/\$\{encodeURIComponent\(entitlementResourceId\)\}/,
  );
  assert.match(
    providerCheck,
    /offerings\/\$\{encodeURIComponent\(offeringResourceId\)\}/,
  );
  assert.doesNotMatch(
    providerCheck,
    /entitlements\/\$\{encodeURIComponent\(entitlementId\)\}/,
  );
  assert.doesNotMatch(
    providerCheck,
    /offerings\/\$\{encodeURIComponent\(offeringId\)\}/,
  );
  assert.match(providerCheck, /RevenueCat entitlement identifier must be pro/);
  assert.match(providerCheck, /RevenueCat offering identifier must be default/);
  assert.match(providerCheck, /revenueCatEntitlementLookupKey/);
  assert.match(providerCheck, /revenueCatEntitlementResourceVerified/);
  assert.match(providerCheck, /revenueCatOfferingLookupKey/);
  assert.match(providerCheck, /revenueCatOfferingResourceVerified/);
  assert.match(providerCheck, /REVENUECAT_REST_API_KEY/);

  assert.match(sandboxProof, /classification: "SANDBOX_INTEGRATION_PROOF"/);
  assert.match(
    sandboxProof,
    /getByRole\("button", \{ name: "Log in", exact: true \}\)/,
  );
  assert.doesNotMatch(sandboxProof, /name: \/sign in\/i/);
  assert.doesNotMatch(
    sandboxProof,
    /\.catch\(async \(\) => \{[\s\S]*waitForLoadState\("networkidle"\)/,
  );
  assert.match(sandboxProof, /getByLabel\("Password", \{ exact: true \}\)/);
  assert.match(sandboxProof, /input\[autocomplete="current-password"\]/);
  assert.doesNotMatch(sandboxProof, /getByLabel\(\/password\/i\)/);
  assert.match(
    sandboxProof,
    /authSessionMechanism: "supabase_browser_persisted_session"/,
  );
  assert.match(sandboxProof, /waitForEphemeralBrowserSession/);
  assert.match(sandboxProof, /readBrowserSession/);
  assert.match(sandboxProof, /ephemeral_bearer_session_unaccepted/);
  assert.doesNotMatch(sandboxProof, /page\.waitForResponse/);
  assert.doesNotMatch(sandboxProof, /auth-token/);
  assert.match(
    sandboxProof,
    /blundr-staging-git-launc-291807-adamconnor00-gmailcoms-projects\.vercel\.app/,
  );
  assert.match(sandboxProof, /\$\{label\}Sha/);
  assert.match(sandboxProof, /verifyPreviewSha\("before"\)/);
  assert.match(sandboxProof, /verifyPreviewSha\("after"\)/);
  assert.match(sandboxProof, /verifyStableCallbackHostSha\("before"\)/);
  assert.match(sandboxProof, /verifyStableCallbackHostSha\("after"\)/);
  assert.match(sandboxProof, /acceptanceEligible: false/);
  assert.match(sandboxProof, /acceptanceEligible = true/);
  assert.match(sandboxProof, /pollUntil\("revenuecatProEntitlement"/);
  assert.match(sandboxProof, /pollUntil\("backendTrustedProState"/);
  assert.match(sandboxProof, /verifyProviderLedgers/);
  assert.match(sandboxProof, /verifyPostStripeAuthorityOnly/);
  assert.match(sandboxProof, /stripe_sourced_paid_entitlement_forbidden/);
  assert.match(sandboxProof, /readPersistedCheckoutSessionId/);
  assert.match(sandboxProof, /checkout\.sessions\.retrieve\(checkoutSessionId/);
  assert.doesNotMatch(sandboxProof, /checkout\.sessions\.list\(/);
  assert.match(sandboxProof, /checkout_session_id_not_persisted/);
  assert.match(sandboxProof, /stripe_checkout_session_metadata_user_mismatch/);
  assert.match(sandboxProof, /stripe_checkout_session_price_mismatch/);
  assert.match(sandboxProof, /selectCardPaymentMethod/);
  assert.match(sandboxProof, /name: \/pay with card\/i/);
  assert.match(sandboxProof, /card-accordion-item-button/);
  assert.match(sandboxProof, /\[role="radio"\]\[value="card"\]/);
  assert.match(sandboxProof, /cardFieldsMounted/);
  assert.doesNotMatch(sandboxProof, /force: true/);
  assert.match(sandboxProof, /stripe_checkout_card_payment_method_missing/);
  assert.match(
    sandboxProof,
    /stripe_checkout_card_payment_method_not_selected/,
  );
  assert.match(sandboxProof, /disableStripeLinkSave/);
  assert.match(sandboxProof, /save my information for faster checkout/);
  assert.match(sandboxProof, /captureCheckoutDiagnostics/);
  assert.match(sandboxProof, /stripe-checkout-diagnostic\.png/);
  assert.match(sandboxProof, /fillVisibleStripeField/);
  assert.match(sandboxProof, /fillVisibleStripeFieldByFallbacks/);
  assert.match(sandboxProof, /waitForVisibleStripeField/);
  assert.match(sandboxProof, /stripe_checkout_card_number_field_missing/);
  assert.match(
    sandboxProof,
    /revenuecat_v1_subscriber_not_found_or_wrong_context:404/,
  );
  assert.match(sandboxProof, /status: "network_error"/);
  assert.match(sandboxProof, /revenueCatConfigurationDiagnosis/);
  assert.match(sandboxProof, /deleteEphemeralStripeCustomer/);
  assert.match(sandboxProof, /stripeProviderEventLedgerExactlyOnce/);
  assert.match(sandboxProof, /revenueCatWebhookProviderEventProcessed/);
  assert.match(sandboxProof, /revenueCatTrustedEntitlementWebhookCreated/);
  assert.match(sandboxProof, /subscriptionCancelVerified/);
  assert.match(sandboxProof, /userDeleteVerified/);
  assert.match(sandboxProof, /cleanupSucceeded/);
  assert.match(sandboxProof, /proof\.cleanup\.completed/);
  assert.match(
    sandboxProof,
    /if \(!mainError && proof\.cleanup\.completed\)[\s\S]*proof\.status = "passed";[\s\S]*proof\.acceptanceEligible = true/,
  );
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
  assert.match(sandboxProof, /access\??\.plan !== "free"/);
  assert.match(sandboxProof, /access\??\.plan === "pro"/);
  assert.match(sandboxProof, /access\??\.entitlementActive === true/);
  assert.match(sandboxProof, /access\??\.entitlementSource === "revenuecat"/);
  assert.doesNotMatch(sandboxProof, /access\?\.tier/);
  assert.doesNotMatch(sandboxProof, /access\?\.isPro/);
  assert.doesNotMatch(workflow, /REVENUECAT_WEBHOOK_AUTHORIZATION/);

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

test("Wave 2B billing controls have non-text-only evidence destinations", () => {
  const inventory = read(
    "docs/operations/wave2b-billing-control-inventory-20260910.md",
  );
  for (const control of [
    "Landing signup plan link",
    "Pricing plan links",
    "Onboarding Free card",
    "Parent Free continuation",
    "Monthly",
    "Annual",
    "Acknowledgement",
    "Checkout",
    "Billing success refresh",
    "Billing success Settings link",
    "Billing cancel plan-selection/upgrade link",
    "Settings Upgrade",
    "Settings Manage Billing",
    "Settings Refresh",
    "Subscription Terms",
    "Upgrade-page return control",
    "Customer Portal creation and return",
  ]) {
    assert.ok(inventory.includes(`| ${control} |`));
  }
  assert.doesNotMatch(inventory, /verified solely because/i);
  assert.match(inventory, /browser-contract and provider-real/);
  assert.match(inventory, /sandbox proof validates/);
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
