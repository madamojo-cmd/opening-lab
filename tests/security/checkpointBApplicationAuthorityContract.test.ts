import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const root = resolve(import.meta.dirname, "../..");
const read = (path: string) => readFileSync(resolve(root, path), "utf8");
const migration = read(
  "supabase/migrations/20260812192625_checkpoint_b_application_authority.sql",
);
const service = read(
  "lib/blundr/continuation/continuationCompletionService.server.ts",
);
const trainer = read("app/page.tsx");
const rewardRoute = read("app/api/blundr/rewards/complete/route.ts");
const rewardAuthority = read("lib/blundr/rewards/rewardAuthority.ts");

test("continuation completion is service-only, owner-bound, and idempotent", () => {
  for (const contract of [
    "blundr_continuation_completions_v1_session_owner_fk",
    "enable row level security",
    "revoke all on public.blundr_continuation_completions_v1",
    "blundr_commit_continuation_completion_v1",
    "continuation_completion_idempotency_conflict",
    "to service_role",
  ])
    assert.match(migration, new RegExp(contract, "i"));
  assert.match(service, /resolveVerifiedTrainerRuntimeLine/);
  assert.match(service, /verifyContinuationPath/);
  assert.doesNotMatch(service, /input\.(terminalFen|completedFen|openingId)/);
});

test("continuation does not enter restricted learning persistence", () => {
  assert.match(
    trainer,
    /if \(trainingMode === "continuation"\) return true;[\s\S]{0,120}setTrainerPersistencePending/,
  );
  assert.match(trainer, /persistContinuationCompletion\(completionPath\)/);
  assert.match(trainer, /dailySessionId: evidence\.evidenceId/);
});

test("one hydrated reward writer owns all three evidence sources", () => {
  assert.match(rewardRoute, /"continuation_completed"/);
  assert.match(rewardAuthority, /blundr_apply_completion_reward_v3/);
  for (const contract of [
    "blundr_apply_completion_reward_v3",
    "blundr_apply_reward_transaction_v2",
    "blundr_completion_grants",
    "blundr_daily_retention_progress",
    "dayRecord",
    "streakRecord",
    "ringClosedThisAction",
  ])
    assert.match(migration, new RegExp(contract, "i"));
  assert.match(
    migration,
    /create or replace function public\.blundr_apply_reward_transaction_v2[\s\S]*select public\.blundr_apply_completion_reward_v3/i,
  );
  assert.match(
    migration,
    /blundr_apply_completion_reward_v3[\s\S]*pg_advisory_xact_lock\(hashtextextended\(p_user_id::text, 403\)\)[\s\S]*v_tx\.policy_version is distinct from p_policy_version[\s\S]*reward_idempotency_conflict/i,
  );
});

test("reward authority failures retain actionable HTTP semantics", () => {
  assert.match(
    rewardRoute,
    /continuation_trainer_terminal_unverified[\s\S]*return 422/,
  );
  assert.match(
    rewardRoute,
    /continuation_completion_idempotency_conflict[\s\S]*completion_projection_idempotency_conflict[\s\S]*return 409/,
  );
});

test("Daily completion passes its durable session identity unchanged", () => {
  const daily = read("lib/blundr/daily/productionDailyService.server.ts");
  assert.match(daily, /evidenceId: input\.session\.sessionId/);
  assert.doesNotMatch(daily, /evidenceId: `daily-completion:/);
});
