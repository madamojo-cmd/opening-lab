import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const root = resolve(import.meta.dirname, "../../../../../");
const migration = readFileSync(
  resolve(
    root,
    "supabase/migrations/20260805140000_blundr_learning_daily_runtime_v2.sql",
  ),
  "utf8",
);
const dailyWriter = readFileSync(
  resolve(root, "lib/blundr/daily/productionDailyService.server.ts"),
  "utf8",
);
const repository = readFileSync(
  resolve(root, "lib/blundr/daily/productionDailyRepository.server.ts"),
  "utf8",
);
const learningRoute = readFileSync(
  resolve(root, "app/api/blundr/learning/events/route.ts"),
  "utf8",
);

test("PR-02 SQL authority is service-only and fail-closed at every mutation boundary", () => {
  for (const name of [
    "blundr_project_learning_evidence_v2",
    "blundr_reserve_daily_v2",
    "blundr_commit_daily_action_v2",
  ])
    assert.match(migration, new RegExp(`public\\.${name}`));
  assert.match(
    migration,
    /grant execute on function public\.blundr_project_learning_evidence_v2[\s\S]*to service_role/,
  );
  assert.match(migration, /daily_session_not_found/);
  assert.match(migration, /invalid_learning_evidence_kind/);
  assert.match(migration, /imported_observation_cannot_be_recall/);
});

test("PR-02 blocks spoofing, stale writes, duplicate actions, and reservation races", () => {
  for (const contract of [
    "p_event->>'user_id' <> p_user_id::text",
    "for update",
    "learning_review_state_conflict",
    "learning_mastery_state_conflict",
    "pg_advisory_xact_lock",
    "v_first_recall",
    "action_id",
    "daily_session_conflict",
    "daily_action_idempotency_conflict",
    "daily_step_not_reserved",
    "daily_session_reservation_conflict",
    "jsonb_set(v_next,'{status}','\"in_progress\"'",
    "jsonb_array_length(v_cards)",
    "on conflict (user_id,local_date) do nothing",
  ])
    assert.match(migration, new RegExp(contract.replace(/[()]/g, "\\$&"), "i"));
});

test("Daily uses exactly one commit RPC and does not issue a second learning transport", () => {
  assert.match(repository, /rpc\("blundr_commit_daily_action_v2"/);
  assert.match(repository, /learning_event: input\.learningEvent/);
  assert.doesNotMatch(dailyWriter, /appendLearningEventV2/);
  assert.match(dailyWriter, /await dailyLearningEvent/);
  assert.match(
    migration,
    /blundr_project_learning_evidence_v2\(p_user_id, p_action->'learning_event'\)/,
  );
});

test("Daily policy and projection contracts retain explicit no-fabrication boundaries", () => {
  assert.match(
    dailyWriter,
    /previousFsrs: \(review\.data\?\.srs_state as never\) \?\? null/,
  );
  assert.match(dailyWriter, /expected_review_state_version/);
  assert.match(dailyWriter, /expected_mastery_state_version/);
  assert.match(migration, /first_recall_requires_exposure/);
  assert.match(migration, /daily-completion:/);
});

test("route derives correctness and scheduling from server authority", () => {
  assert.match(learningRoute, /resolveLearningAttemptAuthority\(\{ expectedMoveUci: verified\.expectedMoveUci, playedMoveUci: body\.playedMoveUci/);
  assert.match(learningRoute, /const receiptTime = new Date\(\)\.toISOString\(\)/);
  assert.doesNotMatch(learningRoute, /body\.createdAt \?\?/);
  assert.match(learningRoute, /requestedType: body\.type/);
});

test("exposure retries cannot reproject and Daily omits first-attempt input", () => {
  assert.match(migration, /pg_advisory_xact_lock/);
  assert.match(migration, /not v_first_recall/);
  assert.doesNotMatch(dailyWriter, /first_attempt: true/);
});
