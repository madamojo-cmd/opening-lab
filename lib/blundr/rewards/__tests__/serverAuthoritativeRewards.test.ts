import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const migration = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/20260804130000_blundr_server_authoritative_rewards.sql",
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
  assert.match(migration, /primary key \(user_id, completion_id\)/i);
  assert.match(migration, /completion_evidence_unverified/i);
  assert.match(migration, /pg_advisory_xact_lock/i);
  assert.match(
    migration,
    /grant execute on function public\.blundr_apply_activity_completion[\s\S]*to service_role/i,
  );
  assert.doesNotMatch(
    migration,
    /grant execute on function public\.blundr_apply_activity_completion[\s\S]*to authenticated/i,
  );
  assert.match(
    migration,
    /revoke insert, update, delete on public\.blundr_repertoire_point_events[\s\S]*from anon, authenticated/i,
  );
});

test("the API derives grants for the authenticated user", () => {
  assert.match(completionRoute, /allowLocalFallback:\s*false/);
  assert.match(completionRoute, /p_user_id:\s*user\.userId/);
  assert.match(completionRoute, /blundr_apply_activity_completion/);
  assert.doesNotMatch(completionRoute, /repertoirePointsAwarded|xpAwarded/);
});

test("legacy client-authored reward and repertoire writes are disabled", () => {
  assert.match(legacyRewardRoute, /client_authored_rewards_disabled/);
  assert.match(legacyProgressRoute, /client_authored_repertoire_disabled/);
  assert.doesNotMatch(legacyRewardRoute, /upsertRewardHistory|appendRewardRoll/);
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
