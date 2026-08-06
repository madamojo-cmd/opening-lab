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

test("Hard, Good, and Easy remain distinct durable FSRS ratings", () => {
  const at = "2026-08-05T12:00:00.000Z";
  const good = gradeBlundrRecall({
    previous: null,
    correct: true,
    occurredAt: at,
  });
  const hard = gradeBlundrRecall({
    previous: null,
    correct: true,
    occurredAt: at,
    hinted: true,
  });
  const mature = { ...good.card, reps: 8 };
  const easy = gradeBlundrRecall({
    previous: mature,
    correct: true,
    occurredAt: "2026-08-06T12:00:00.000Z",
    elapsedMs: 4_000,
  });
  assert.equal(hard.rating, "hard");
  assert.equal(good.rating, "good");
  assert.equal(easy.rating, "easy");
  assert.notEqual(hard.dueAt, good.dueAt);
  assert.notEqual(easy.dueAt, good.dueAt);
});

test("rating is derived from evidence rather than a client assertion", () => {
  assert.equal(
    gradeBlundrRecall({
      previous: null,
      correct: false,
      occurredAt: "2026-08-05T12:00:00.000Z",
    }).rating,
    "again",
  );
  assert.equal(
    gradeBlundrRecall({
      previous: null,
      correct: true,
      hinted: true,
      occurredAt: "2026-08-05T12:00:00.000Z",
    }).rating,
    "hard",
  );
});
