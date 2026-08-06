import assert from "node:assert/strict";
import test from "node:test";
import { buildLearningProjection } from "../learningProjection";

test("imported observations never become memory failures", () => {
  const projection = buildLearningProjection({
    source: "imported_game",
    firstAttempt: true,
    exposureId: "forged-exposure",
    correct: false,
    occurredAt: "2026-08-05T12:00:00.000Z",
    previousFsrs: null,
    previousMastery: null,
  });
  assert.deepEqual(projection, {
    evidenceKind: "imported_observation",
    firstAttempt: false,
  });
});

test("recall needs a server exposure before it can claim first attempt", () => {
  assert.throws(
    () =>
      buildLearningProjection({
        source: "train",
        firstAttempt: true,
        exposureId: null,
        correct: false,
        occurredAt: "2026-08-05T12:00:00.000Z",
        previousFsrs: null,
        previousMastery: null,
      }),
    /first_recall_requires_exposure/,
  );
});

test("incorrect recall increments a weak mastery projection with v1 FSRS", () => {
  const projection = buildLearningProjection({
    source: "daily",
    firstAttempt: true,
    exposureId: "daily:session:card",
    correct: false,
    occurredAt: "2026-08-05T12:00:00.000Z",
    previousFsrs: null,
    previousMastery: null,
  });
  assert.equal(projection.evidenceKind, "recall_attempt");
  if (projection.evidenceKind !== "recall_attempt") return;
  assert.equal(projection.fsrs.algorithmVersion, "blundr-fsrs-v1");
  assert.equal(projection.mastery.state, "weak");
  assert.equal(projection.mastery.lapseCount, 1);
});

test("reveal persists Again while a retry cannot replace first recall", () => {
  const reveal = buildLearningProjection({
    source: "daily",
    firstAttempt: true,
    exposureId: "daily:session:card",
    correct: false,
    hinted: true,
    occurredAt: "2026-08-05T12:00:00.000Z",
    previousFsrs: null,
    previousMastery: null,
  });
  assert.equal(reveal.evidenceKind, "recall_attempt");
  if (reveal.evidenceKind === "recall_attempt")
    assert.equal(reveal.fsrs.rating, "again");
  assert.deepEqual(
    buildLearningProjection({
      source: "daily",
      firstAttempt: false,
      exposureId: "daily:session:card",
      correct: true,
      occurredAt: "2026-08-05T12:00:10.000Z",
      previousFsrs: null,
      previousMastery: null,
    }),
    { evidenceKind: "system_observation", firstAttempt: false },
  );
});
