import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const migration =
  "supabase/migrations/20260904135434_blundr_billing_entitlement_authority.sql";

function sourceFiles(root: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(root)) {
    const path = join(root, entry);
    const stats = statSync(path);
    if (stats.isDirectory()) {
      files.push(...sourceFiles(path));
    } else if (/\.(ts|tsx)$/.test(path)) {
      files.push(path);
    }
  }
  return files;
}

test("billing migration exposes only own-row reads and service-only trial RPCs", () => {
  const sql = readFileSync(migration, "utf8");
  for (const table of [
    "blundr_billing_customers",
    "blundr_billing_subscriptions",
    "blundr_trusted_entitlements",
    "blundr_billing_provider_events",
    "blundr_billing_trial_eligibility",
  ]) {
    assert.match(
      sql,
      new RegExp(`alter table public\\.${table} enable row level security`, "i"),
    );
    assert.doesNotMatch(
      sql,
      new RegExp(`create policy ${table}_(?:insert|update|delete)`, "i"),
    );
  }
  for (const table of [
    "blundr_billing_customers",
    "blundr_billing_subscriptions",
    "blundr_trusted_entitlements",
    "blundr_billing_trial_eligibility",
  ]) {
    assert.match(
      sql,
      new RegExp(`create policy ${table}_select_own[\\s\\S]*user_id = auth\\.uid\\(\\)`, "i"),
    );
  }
  assert.doesNotMatch(
    sql,
    /grant select on public\.blundr_billing_provider_events[\s\S]*to authenticated/i,
  );
  for (const signature of [
    "blundr_reserve_pro_trial_v1(uuid, text, integer)",
    "blundr_record_checkout_trial_session_v1(uuid, text, uuid, text)",
    "blundr_mark_pro_trial_consumed_v1(uuid, text, text, text)",
  ]) {
    assert.match(
      sql,
      new RegExp(`revoke all on function public\\.${signature.replace(/[()]/g, "\\$&")}[\\s\\S]*from public, anon, authenticated`, "i"),
    );
    assert.match(
      sql,
      new RegExp(`grant execute on function public\\.${signature.replace(/[()]/g, "\\$&")}[\\s\\S]*to service_role`, "i"),
    );
  }
});

test("billing routes authenticate server-side and keep provider secrets out of client code", () => {
  for (const route of [
    "app/api/blundr/billing/checkout/route.ts",
    "app/api/blundr/billing/portal/route.ts",
  ]) {
    const source = readFileSync(route, "utf8");
    assert.match(source, /getCurrentBlundrUser/);
    assert.match(source, /allowLocalFallback:\s*false/);
  }
  const checkout = readFileSync("lib/blundr/billing/checkout.server.ts", "utf8");
  assert.match(checkout, /priceForBillingPlan/);
  assert.match(checkout, /client_billing_authority_rejected/);
  assert.doesNotMatch(checkout, /line_items:\s*\[\{\s*price:\s*body/i);
  const stripeWebhook = readFileSync(
    "app/api/blundr/billing/stripe/webhook/route.ts",
    "utf8",
  );
  assert.match(stripeWebhook, /request\.text\(\)/);
  assert.match(stripeWebhook, /constructEvent/);
  const clientSources = ["app", "components"].flatMap(sourceFiles);
  for (const file of clientSources) {
    const source = readFileSync(file, "utf8");
    if (/^\s*["']use client["']/m.test(source)) {
      assert.doesNotMatch(
        source,
        /STRIPE_SECRET_KEY|STRIPE_WEBHOOK_SECRET|REVENUECAT_WEBHOOK_AUTHORIZATION|REVENUECAT_REST_API_KEY|SUPABASE_SERVICE_ROLE_KEY/,
        file,
      );
    }
  }
});
