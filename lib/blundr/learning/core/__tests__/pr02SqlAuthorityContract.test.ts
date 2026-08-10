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
const masteryReconciliationMigration = readFileSync(
  resolve(
    root,
    "supabase/migrations/20260806210000_blundr_mastery_canonical_reconciliation_v2.sql",
  ),
  "utf8",
);
const dailyTaskAuthorityMigration = readFileSync(
  resolve(
    root,
    "supabase/migrations/20260806120000_blundr_daily_task_evidence_authority_v3.sql",
  ),
  "utf8",
);
const dailyTaskNormalizationMigration = readFileSync(
  resolve(
    root,
    "supabase/migrations/20260806150000_blundr_daily_task_evidence_call_chain_v3.sql",
  ),
  "utf8",
);
const dailyWriter = readFileSync(
  resolve(root, "lib/blundr/daily/productionDailyService.server.ts"),
  "utf8",
);
const learningEventService = readFileSync(
  resolve(root, "lib/blundr/learning/core/learningEventService.server.ts"),
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
    "p_action->>'step_index'",
    "v_step_index <> v_expected_step",
    "jsonb_array_length(card->'privateSteps')-1",
    "daily_session_reservation_conflict",
    "jsonb_set(v_next,'{status}','\"in_progress\"'",
    "jsonb_array_length(v_cards)",
    "on conflict do nothing",
    "v_existing is distinct from v_deck",
    "v_existing_fingerprint is distinct from p_reservation->>'deck_fingerprint'",
    "jsonb_typeof(p_action->'learning_event') = 'object'",
  ])
    assert.match(migration, new RegExp(contract.replace(/[()]/g, "\\$&"), "i"));
});

test("Daily uses the single v3 wrapper and does not issue a second learning transport", () => {
  assert.match(repository, /rpc\("blundr_commit_daily_action_v3"/);
  assert.match(repository, /learning_event: input\.learningEvent/);
  assert.match(repository, /daily_evidence:/);
  assert.doesNotMatch(dailyWriter, /appendLearningEventV2/);
  assert.match(dailyWriter, /await dailyLearningEvent/);
  assert.match(
    migration,
    /blundr_project_learning_evidence_v2\(p_user_id, p_action->'learning_event'\)/,
  );
  assert.match(
    dailyTaskAuthorityMigration,
    /blundr_commit_daily_action_v2\(p_user_id,p_session_id,p_action\)/,
  );
});

test("Daily policy and projection contracts retain explicit no-fabrication boundaries", () => {
  assert.match(dailyWriter, /prepareLearningEventV2/);
  assert.doesNotMatch(dailyWriter, /buildLearningProjection/);
  assert.match(dailyWriter, /task_evidence/);
  assert.match(dailyWriter, /playedMoveUci: isMoveTask/);
  assert.match(dailyTaskAuthorityMigration, /daily_task_answer_not_reserved/);
  assert.match(dailyTaskAuthorityMigration, /daily_task_evidence_conflict/);
  assert.match(migration, /first_recall_requires_exposure/);
  assert.match(migration, /daily-completion:/);
});

test("Mastery reconciliation prefers exact rows and falls back to canonical runtime identity", () => {
  assert.match(
    learningEventService,
    /const \[review, masteryExact\] = await Promise\.all\(/,
  );
  assert.match(learningEventService, /canonicalMastery/);
  assert.match(
    learningEventService,
    /eq\("position_key", input\.position\.positionKey\)/,
  );
  assert.match(
    learningEventService,
    /eq\("opening_id", input\.position\.openingId\)/,
  );
  assert.match(
    learningEventService,
    /eq\("play_key", input\.position\.moveOrderKey\)/,
  );
  assert.match(
    learningEventService,
    /expected_mastery_state_version: Number\(/,
  );
  assert.match(masteryReconciliationMigration, /pg_advisory_xact_lock/);
  assert.match(
    masteryReconciliationMigration,
    /position_key = p_event->>'position_key'/,
  );
  assert.match(
    masteryReconciliationMigration,
    /opening_id = p_event->>'opening_id'/,
  );
  assert.match(
    masteryReconciliationMigration,
    /play_key = p_event->>'move_order_key'/,
  );
  assert.match(masteryReconciliationMigration, /v_mastery_found/);
  assert.match(masteryReconciliationMigration, /ctid = v_mastery_ctid/);
  assert.match(
    masteryReconciliationMigration,
    /learning_mastery_state_conflict/,
  );
});

test("Daily v3 normalization keeps task evidence as validated JSON object data", () => {
  assert.match(
    dailyTaskNormalizationMigration,
    /jsonb_typeof\(v_task\)\s*=\s*'string'/,
  );
  assert.match(
    dailyTaskNormalizationMigration,
    /jsonb_typeof\(v_event\)\s*=\s*'string'/,
  );
  assert.match(
    dailyTaskNormalizationMigration,
    /v_event->'task_evidence' is distinct from v_task/,
  );
  assert.match(
    dailyTaskNormalizationMigration,
    /return public\.blundr_commit_daily_action_v3_inner\(p_user_id, p_session_id, v_action\)/,
  );
  assert.match(dailyTaskNormalizationMigration, /v_learning_event_id := case/);
  assert.match(
    dailyTaskNormalizationMigration,
    /nullif\(v_event->>'event_id', ''\)/,
  );
  assert.doesNotMatch(dailyTaskNormalizationMigration, /v_result->>'eventId'/);
});

test("route derives correctness and scheduling from server authority", () => {
  assert.match(learningRoute, /resolveLearningAttemptAuthority\(\{/);
  assert.match(learningRoute, /expectedMoveUci: verified\.expectedMoveUci/);
  assert.match(learningRoute, /playedMoveUci: body\.playedMoveUci/);
  assert.match(
    learningRoute,
    /const receiptTime = new Date\(\)\.toISOString\(\)/,
  );
  assert.doesNotMatch(learningRoute, /body\.createdAt \?\?/);
  assert.match(learningRoute, /requestedType: body\.type/);
});

test("exposure retries cannot reproject and Daily omits first-attempt input", () => {
  assert.match(migration, /pg_advisory_xact_lock/);
  assert.match(migration, /not v_first_recall/);
  assert.doesNotMatch(dailyWriter, /first_attempt: true/);
});

test("SQL persists and validates the complete authoritative rating evidence", () => {
  for (const contract of [
    "answer_evidence jsonb",
    "review_rating text",
    "review_projection jsonb",
    "invalid_review_rating",
    "review_rating_contradicts_evidence",
    "review_rating_contradicts_reveal",
    "easy_rating_not_authorized",
    "invalid_fsrs_projection",
    "p_event#>>'{fsrs,rating}' is distinct from p_event->>'review_rating'",
    "'reviewRating',p_event->>'review_rating'",
  ])
    assert.match(migration, new RegExp(contract.replace(/[()]/g, "\\$&"), "i"));
  assert.doesNotMatch(learningRoute, /body\.rating|requestedRating/);
  assert.match(repository, /completed_at,updated_at/);
  assert.match(dailyWriter, /Date\.parse\(session\.updatedAt \?\? now\)/);
});
