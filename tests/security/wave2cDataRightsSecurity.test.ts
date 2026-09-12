import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");

test("legal consent migration is immutable to ordinary authenticated clients", () => {
  const sql = read(
    "supabase/migrations/20260912120000_blundr_wave2c_data_rights_privacy.sql",
  );
  assert.match(
    sql,
    /alter table public\.blundr_user_legal_acceptances enable row level security/i,
  );
  assert.match(
    sql,
    /create policy blundr_user_legal_acceptances_select_own[\s\S]*user_id = auth\.uid\(\)/i,
  );
  assert.doesNotMatch(
    sql,
    /create policy blundr_user_legal_acceptances_(insert|update|delete)/i,
  );
  assert.match(
    sql,
    /grant select, insert, update, delete on public\.blundr_user_legal_acceptances[\s\S]*to service_role/i,
  );
});

test("privacy preferences are own-row only and separate from legal consent", () => {
  const sql = read(
    "supabase/migrations/20260912120000_blundr_wave2c_data_rights_privacy.sql",
  );
  assert.match(
    sql,
    /create table if not exists public\.blundr_user_privacy_preferences/i,
  );
  assert.match(
    sql,
    /optional_analytics_consent boolean not null default false/i,
  );
  assert.match(
    sql,
    /for insert to authenticated[\s\S]*with check \(user_id = auth\.uid\(\)\)/i,
  );
  assert.match(
    sql,
    /for update to authenticated[\s\S]*using \(user_id = auth\.uid\(\)\)[\s\S]*with check \(user_id = auth\.uid\(\)\)/i,
  );
});

test("account export and deletion derive authority from the authenticated session", () => {
  const exportRoute = read("app/api/blundr/account/export/route.ts");
  const deleteRoute = read("app/api/blundr/account/delete/route.ts");
  const service = read("lib/blundr/accounts/accountDataRights.server.ts");

  for (const route of [exportRoute, deleteRoute]) {
    assert.match(route, /getCurrentBlundrUser/);
    assert.match(route, /allowLocalFallback:\s*false/);
    assert.doesNotMatch(route, /body\?\.userId|body\.userId|targetUserId/);
  }
  assert.match(service, /EXPORT_TABLES/);
  assert.match(service, /\.eq\("user_id", userId\)/);
  assert.match(service, /ACTIVE_PROVIDER_STATUSES/);
  assert.match(service, /account_deletion_billing_cleanup_unavailable/);
  assert.match(service, /subscriptions\.cancel/);
  assert.match(service, /auth\.admin\.deleteUser/);
});

test("new account and billing operations emit sanitized names-only telemetry", () => {
  const operational = read(
    "lib/blundr/telemetry/operationalTelemetry.server.ts",
  );
  const exportRoute = read("app/api/blundr/account/export/route.ts");
  const deleteRoute = read("app/api/blundr/account/delete/route.ts");
  const checkout = read("app/api/blundr/billing/checkout/route.ts");
  const portal = read("app/api/blundr/billing/portal/route.ts");

  for (const event of [
    "billing_checkout_started",
    "billing_checkout_failed",
    "billing_portal_started",
    "billing_portal_failed",
    "account_export_created",
    "account_export_failed",
    "account_deletion_completed",
    "account_deletion_failed",
  ]) {
    assert.match(operational, new RegExp(event));
  }
  assert.match(exportRoute, /account_export_created/);
  assert.match(deleteRoute, /account_deletion_completed/);
  assert.match(checkout, /billing_checkout_started/);
  assert.match(portal, /billing_portal_started/);
  for (const source of [
    operational,
    exportRoute,
    deleteRoute,
    checkout,
    portal,
  ]) {
    assert.doesNotMatch(
      source,
      /STRIPE_SECRET_KEY|WEBHOOK_SECRET|SERVICE_ROLE_KEY|password|cardNumber|cardCvc/,
    );
  }
});
