import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");

test("Wave 2C legal consent and data rights are explicit release surfaces", () => {
  const registry = read("docs/product/blundr-system-registry.json");
  const migration = read(
    "supabase/migrations/20260912120000_blundr_wave2c_data_rights_privacy.sql",
  );
  const signup = read("app/api/blundr/auth/signup/route.ts");
  const settings = read("components/settings/SettingsPage.tsx");

  assert.match(registry, /LEGAL-DATA-RIGHTS-001/);
  assert.match(registry, /ANALYTICS-CONSENT-001/);
  assert.match(migration, /blundr_user_legal_acceptances/);
  assert.match(migration, /blundr_user_privacy_preferences/);
  assert.match(migration, /blundr_account_deletion_audit/);
  assert.match(signup, /recordCurrentLegalAcceptances/);
  assert.match(signup, /accepted_terms_version/);
  assert.match(signup, /accepted_privacy_version/);
  assert.match(settings, /\/api\/blundr\/account\/export/);
  assert.match(settings, /\/api\/blundr\/account\/delete/);
  assert.match(settings, /DELETE MY ACCOUNT/);
  assert.match(settings, /\/api\/blundr\/privacy\/preferences/);
});

test("commercial lifecycle UX supports launch states without granting Pro from Stripe", () => {
  const access = read("lib/blundr/commercial/commercialAccess.server.ts");
  const model = read("lib/blundr/commercial/commercialLifecycle.ts");
  const settings = read("components/settings/SettingsPage.tsx");

  assert.match(access, /blundr_trusted_entitlements/);
  assert.match(access, /entitlementSource: "revenuecat"/);
  assert.match(access, /resolveCommercialLifecycleState/);
  assert.match(model, /"past_due"/);
  assert.match(model, /"canceling"/);
  assert.match(model, /"expired"/);
  assert.match(settings, /Payment problem/);
  assert.match(settings, /Subscription canceled/);
  assert.match(settings, /commercialPlanLabel/);
  assert.doesNotMatch(
    access,
    /Stripe.*grant|status === "active".*plan: "pro"/is,
  );
});

test("analytics consent gates optional launch funnel events", () => {
  const events = read("lib/blundr/analytics/blundrAnalyticsEvents.ts");
  const client = read("lib/blundr/analytics/blundrAnalyticsService.ts");
  const telemetry = read("app/api/blundr/telemetry/route.ts");
  const settings = read("components/settings/SettingsPage.tsx");
  const paywall = read("components/billing/PaywallPlanSelection.tsx");

  for (const event of [
    "SIGNUP_STARTED",
    "SIGNUP_COMPLETED",
    "PAYWALL_VIEWED",
    "PLAN_SELECTED",
    "CHECKOUT_STARTED",
    "TRIAL_STARTED",
    "PRO_ACTIVATED",
    "BILLING_PORTAL_OPENED",
    "SUBSCRIPTION_CANCEL_SCHEDULED",
    "ANALYTICS_CONSENT_UPDATED",
  ]) {
    assert.match(events, new RegExp(event));
    assert.match(telemetry, new RegExp(event));
  }
  assert.match(client, /BLUNDR_OPTIONAL_ANALYTICS_CONSENT_STORAGE_KEY/);
  assert.match(client, /OPERATIONAL_TELEMETRY_EVENTS/);
  assert.match(
    client,
    /if \(!optionalAllowed && !OPERATIONAL_TELEMETRY_EVENTS/,
  );
  assert.match(settings, /Allow optional product analytics/);
  assert.match(paywall, /trackBlundrAnalyticsEvent\("PAYWALL_VIEWED"/);
  assert.match(paywall, /trackBlundrAnalyticsEvent\("CHECKOUT_STARTED"/);
  assert.doesNotMatch(
    telemetry.match(
      /const PUBLIC_PAYLOAD_KEYS = new Set\(\[([\s\S]*?)\]\);/,
    )?.[1] ?? "",
    /email|card|cvc|password|token/i,
  );
});

test("operations runbooks cover launch, provider, refund, and deletion incidents", () => {
  const runbook = read(
    "docs/operations/wave2c2d-launch-operations-runbooks.md",
  );
  for (const heading of [
    "Production Billing Cutover",
    "Billing Rollback",
    "Entitlement Incident",
    "Stripe Webhook Incident",
    "RevenueCat Webhook Incident",
    "Refund Handling",
    "Account Deletion Failure",
    "Deployment Rollback",
  ]) {
    assert.match(runbook, new RegExp(`## ${heading}`));
  }
  for (const section of [
    "SYMPTOM",
    "CONFIRMATION",
    "SAFE ACTION",
    "DO NOT DO",
    "ROLLBACK",
    "VERIFICATION",
  ]) {
    assert.match(runbook, new RegExp(section));
  }
});
