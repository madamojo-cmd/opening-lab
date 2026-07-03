import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "supabase/migrations/20260703_001_blundr_accounts_foundation.sql"), "utf8");

const tablesWithRls = [
  "blundr_user_profiles",
  "blundr_user_repertoires",
  "blundr_daily_retention_progress",
  "blundr_opening_unlock_progress",
  "blundr_opening_unlock_events",
  "blundr_streak_records",
  "blundr_reward_history",
  "blundr_reward_rolls",
  "blundr_validation_snapshots",
  "blundr_developer_audit_log",
];

for (const table of tablesWithRls) {
  assert.ok(source.includes(`alter table public.${table} enable row level security;`), `Expected RLS enablement for ${table}.`);
}

const userOwnedPolicyNames = [
  "blundr_user_profiles_select_own",
  "blundr_user_profiles_insert_own",
  "blundr_user_profiles_update_own",
  "blundr_user_profiles_delete_own",
  "blundr_user_repertoires_select_own",
  "blundr_daily_retention_progress_select_own",
  "blundr_opening_unlock_progress_select_own",
  "blundr_opening_unlock_events_select_own",
  "blundr_streak_records_select_own",
  "blundr_reward_history_select_own",
  "blundr_reward_rolls_select_own",
  "blundr_validation_snapshots_select_own",
];

for (const policy of userOwnedPolicyNames) {
  assert.ok(source.includes(policy), `Expected policy ${policy}.`);
}

assert.ok(!source.includes("blundr_developer_audit_log_select_own"));
assert.ok(!source.includes("blundr_developer_audit_log_insert_own"));
assert.ok(!source.includes("blundr_developer_audit_log_update_own"));
assert.ok(!source.includes("blundr_developer_audit_log_delete_own"));

console.log("rlsPolicyShape.test.ts passed");
