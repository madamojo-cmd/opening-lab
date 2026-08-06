import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
const sql = readFileSync(
  resolve(
    import.meta.dirname,
    "../../../../supabase/migrations/20260806100000_blundr_review_attempt_authority_v1.sql",
  ),
  "utf8",
);
const learningService = readFileSync(
  resolve(
    import.meta.dirname,
    "../../learning/core/learningEventService.server.ts",
  ),
  "utf8",
);
test("Review mutation is service-only and keeps v3 rating/projector atomic", () => {
  assert.match(sql, /blundr_review_attempts/);
  assert.match(sql, /blundr_project_learning_evidence_v3/);
  assert.doesNotMatch(
    sql,
    /create or replace function public\.blundr_project_learning_evidence_v2/,
  );
  assert.match(sql, /for update/);
  assert.match(sql, /blundr_project_learning_evidence_v3\(p_user_id,p_event\)/);
  assert.match(sql, /review_v3_requires_reserved_rating_evidence/);
  assert.match(sql, /invalid_review_projection/);
  assert.match(sql, /revoke all on function[\s\S]*authenticated/);
  assert.match(sql, /to service_role/);
  assert.match(sql, /review_rating_idempotency_conflict/);
  assert.match(sql, /review_item_not_reserved/);
  assert.match(sql, /unique \(user_id, rating_idempotency_id\)/);
  assert.doesNotMatch(sql, /rating_idempotency_id text unique/);
});

test("Review extensions preserve legacy v2 authority fingerprints", () => {
  assert.match(
    learningService,
    /\.\.\.\(input\.requestedRating \? \[input\.requestedRating\] : \[\]\)/,
  );
  assert.doesNotMatch(learningService, /requestedRating \?\? "derived"/);
});
