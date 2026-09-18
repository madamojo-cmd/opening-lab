import assert from "node:assert/strict";
import test from "node:test";
import {
  buildImportedEvidencePriorityMap,
  shouldPromoteImportedEvidenceToDailyPriority,
  type ImportedEvidencePriorityRecord,
} from "../importedEvidencePriority";

function record(
  overrides: Partial<ImportedEvidencePriorityRecord> = {},
): ImportedEvidencePriorityRecord {
  return {
    userId: "user-a",
    positionKey: "position-a",
    openingId: "italian-white",
    moveOrderKey: "e2e4,e7e5,g1f3,b8c6",
    outcome: "missed_known_move",
    importWeight: 0.8,
    observedAt: "2026-09-14T00:00:00.000Z",
    status: "active",
    ...overrides,
  };
}

test("repeated imported misses boost more than one miss and remain capped", () => {
  const one = buildImportedEvidencePriorityMap({
    userId: "user-a",
    now: "2026-09-14T00:00:00.000Z",
    records: [record()],
  }).get("position-a");
  const many = buildImportedEvidencePriorityMap({
    userId: "user-a",
    now: "2026-09-14T00:00:00.000Z",
    records: Array.from({ length: 10 }, (_, index) =>
      record({ observedAt: `2026-09-14T00:00:0${index % 9}.000Z` }),
    ),
  }).get("position-a");
  assert.ok(one);
  assert.ok(many);
  assert.equal(many.missCount, 10);
  assert.ok(many.boost > one.boost);
  assert.equal(many.boost, 1.5);
  assert.equal(shouldPromoteImportedEvidenceToDailyPriority(many), true);
});

test("positive evidence does not erase or create negative priority", () => {
  const priority = buildImportedEvidencePriorityMap({
    userId: "user-a",
    now: "2026-09-14T00:00:00.000Z",
    records: [
      record({
        outcome: "followed_known_repertoire",
        importWeight: -0.1,
      }),
    ],
  }).get("position-a");
  assert.ok(priority);
  assert.equal(priority.positiveCount, 1);
  assert.equal(priority.hasNegativeEvidence, false);
  assert.equal(priority.boost, 0);
  assert.equal(shouldPromoteImportedEvidenceToDailyPriority(priority), false);
});

test("locked, deleted, duplicate, and cross-user rows are excluded deterministically", () => {
  const deduped = new Map<string, ImportedEvidencePriorityRecord>();
  for (const candidate of [
    record(),
    record(),
    record({ status: "gated_pending", observedAt: "2026-09-14T00:00:01.000Z" }),
    record({ status: "deleted", observedAt: "2026-09-14T00:00:02.000Z" }),
    record({ userId: "user-b" }),
  ]) {
    deduped.set(
      `${candidate.userId}:${candidate.positionKey}:${candidate.observedAt}:${candidate.outcome}`,
      candidate,
    );
  }
  const priority = buildImportedEvidencePriorityMap({
    userId: "user-a",
    now: "2026-09-14T00:00:00.000Z",
    records: [...deduped.values()],
  });
  assert.equal(priority.size, 1);
  assert.equal(priority.get("position-a")?.missCount, 1);
});
