import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "supabase/migrations/20260703_001_blundr_accounts_foundation.sql"), "utf8");

const tables = [
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

for (const table of tables) {
  assert.ok(source.includes(`create table if not exists public.${table}`), `Expected migration to define ${table}.`);
}

assert.ok(source.includes("create extension if not exists pgcrypto"));
assert.ok(source.includes("blundr_touch_updated_at"));

console.log("schemaShape.test.ts passed");
