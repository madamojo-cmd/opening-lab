import assert from "node:assert/strict";
import test from "node:test";
import {
  BLUNDR_FSRS_ALGORITHM_VERSION,
  BLUNDR_FSRS_DESIRED_RETENTION,
  gradeBlundrRecall,
} from "../blundrFsrs";

test("blundr FSRS uses the pinned v1 authority and 0.90 retention", () => {
  assert.equal(BLUNDR_FSRS_ALGORITHM_VERSION, "blundr-fsrs-v1");
  assert.equal(BLUNDR_FSRS_DESIRED_RETENTION, 0.9);
});

test("the same canonical recall grades deterministically", () => {
  const input = {
    previous: null,
    correct: true,
    occurredAt: "2026-08-05T12:00:00.000Z",
  } as const;
  assert.deepEqual(gradeBlundrRecall(input), gradeBlundrRecall(input));
});

test("an incorrect recall receives the FSRS again grade and schedules a retry", () => {
  const result = gradeBlundrRecall({
    previous: null,
    correct: false,
    occurredAt: "2026-08-05T12:00:00.000Z",
  });
  assert.equal(result.rating, "again");
  assert.equal(result.card.reps, 1);
  assert.ok(Date.parse(result.dueAt) >= Date.parse("2026-08-05T12:00:00.000Z"));
});
