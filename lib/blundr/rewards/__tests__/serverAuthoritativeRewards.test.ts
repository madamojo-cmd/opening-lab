import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const legacyMigration = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/20260804130000_blundr_server_authoritative_rewards.sql",
  ),
  "utf8",
);
const v2Migration = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/20260805150000_blundr_rewards_runtime_v2.sql",
  ),
  "utf8",
);
const completionRoute = readFileSync(
  resolve(process.cwd(), "app/api/blundr/rewards/complete/route.ts"),
  "utf8",
);
const legacyRewardRoute = readFileSync(
  resolve(process.cwd(), "app/api/blundr/rewards/sync/route.ts"),
  "utf8",
);
const legacyProgressRoute = readFileSync(
  resolve(process.cwd(), "app/api/blundr/repertoire/sync/route.ts"),
  "utf8",
);
const dailyService = readFileSync(
  resolve(process.cwd(), "lib/blundr/daily-rings/dailyRingService.ts"),
  "utf8",
);

test("completion grants are service-only, evidence-backed, and idempotent", () => {
  assert.match(legacyMigration, /primary key \(user_id, completion_id\)/i);
  assert.match(v2Migration, /completion_evidence_unverified/i);
  assert.match(v2Migration, /pg_advisory_xact_lock/i);
  assert.match(
    v2Migration,
    /grant execute on function public\.blundr_apply_reward_transaction_v2[\s\S]*to service_role/i,
  );
  assert.doesNotMatch(
    v2Migration,
    /grant execute on function public\.blundr_apply_reward_transaction_v2[\s\S]*to authenticated/i,
  );
  assert.match(
    legacyMigration,
    /revoke insert, update, delete on public\.blundr_repertoire_point_events[\s\S]*from anon, authenticated/i,
  );
});

test("the API derives grants for the authenticated user", () => {
  assert.match(completionRoute, /allowLocalFallback:\s*false/);
  assert.match(completionRoute, /userId:\s*user\.userId/);
  assert.match(completionRoute, /applyRewardCompletion/);
  assert.doesNotMatch(completionRoute, /repertoirePointsAwarded|xpAwarded/);
});

test("v2 rewards use one atomic writer, an inventory ledger, and leased presentation inbox", () => {
  assert.match(
    v2Migration,
    /create or replace function public\.blundr_apply_reward_transaction_v2/i,
  );
  assert.match(v2Migration, /hmac\(/i);
  assert.match(v2Migration, /blundr_reward_grants_v2/i);
  assert.match(v2Migration, /blundr_reward_inventory_events_v2/i);
  assert.match(v2Migration, /blundr_reward_presentations_v2/i);
  assert.match(
    v2Migration,
    /create or replace function public\.blundr_claim_reward_presentation_v2/i,
  );
  assert.match(v2Migration, /for update skip locked/i);
  assert.match(v2Migration, /reward_presentation_lease_not_owned/i);
  assert.match(v2Migration, /opening_not_locked/i);
  assert.match(v2Migration, /insufficient_inventory/i);
});

test("legacy client-authored reward and repertoire writes are disabled", () => {
  assert.match(legacyRewardRoute, /client_authored_rewards_disabled/);
  assert.match(legacyProgressRoute, /client_authored_repertoire_disabled/);
  assert.doesNotMatch(
    legacyRewardRoute,
    /upsertRewardHistory|appendRewardRoll/,
  );
  assert.doesNotMatch(
    legacyProgressRoute,
    /appendRepertoirePointEvent|upsertUserRepertoire/,
  );
});

test("authenticated clients wait for server confirmation before local success", () => {
  const remoteBranch = dailyService.indexOf(
    'if (authoritative.mode === "remote")',
  );
  const firstCompletionWrite = dailyService.indexOf(
    "syncDailyRingSnapshotLocally(\n    result.dayRecord",
    remoteBranch,
  );
  assert.ok(remoteBranch > 0);
  assert.ok(firstCompletionWrite > remoteBranch);
  assert.match(dailyService, /reward_persistence_unavailable/);
});
