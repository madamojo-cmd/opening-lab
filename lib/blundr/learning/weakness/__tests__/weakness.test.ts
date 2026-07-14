import assert from "node:assert/strict";
import test from "node:test";
import {
  createPositionIdentity,
  type LearningEventV2,
} from "@/lib/blundr/contracts";
import {
  InMemoryLearningEventStore,
  InMemoryNodeMasteryRepository,
  replayLearningEventOutbox,
} from "@/lib/blundr/learning/core";
import { calculateWeaknessConfidence } from "../weaknessConfidence";
import { projectWeaknesses } from "../weaknessProjection";
const position = createPositionIdentity({
  canonicalFen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1",
  openingId: "italian-white",
  repertoireSide: "white",
  expectedMoveUci: "g1f3",
});
const event = (
  id: string,
  taxonomy: LearningEventV2["taxonomy"],
  source: LearningEventV2["source"] = "train",
): LearningEventV2 => ({
  schemaVersion: "2026-07-13.v1",
  eventId: id as LearningEventV2["eventId"],
  attemptId: null,
  sessionId: "session" as LearningEventV2["sessionId"],
  userId: "user-a",
  occurredAt: `2026-07-13T00:00:0${id.length}Z`,
  taxonomy,
  position,
  finding: null,
  firstAttempt: taxonomy === "move_incorrect",
  idempotencyKey: id,
  source,
  contentVersion: "content",
  classifierVersion: "classifier",
  migrationMarker: null,
  deletedAt: null,
});
test("Learning Core replays idempotently and keeps first attempt immutable", () => {
  const store = new InMemoryLearningEventStore();
  const incorrect = event("1", "move_incorrect");
  assert.deepEqual(replayLearningEventOutbox(store, [incorrect, incorrect]), {
    inserted: 1,
    duplicates: 1,
    rejected: 0,
  });
  const repository = new InMemoryNodeMasteryRepository();
  const access = {
    openingId: "italian-white",
    repertoireSide: "white" as const,
    decision: "active" as const,
    checkedAt: new Date().toISOString(),
    authorityVersion: "v1",
    expiresAt: null,
  };
  repository.apply(incorrect, access);
  repository.apply(event("22", "move_correct"), access);
  assert.equal(
    repository.get("user-a", position.positionKey)?.firstAttemptResult,
    "incorrect",
  );
  assert.equal(repository.get("user-a", position.positionKey)?.attempts, 2);
});
test("weakness projections join positions and exclude locked access", () => {
  const active = new Map([
    [position.positionKey, { decision: "active" as const }],
  ]);
  const locked = new Map([
    [position.positionKey, { decision: "unknown" as const }],
  ]);
  const finding = {
    findingId: "f1",
    position,
    category: "opening_move" as const,
    confidence: 0.6,
    severity: "medium" as const,
    source: {
      source: "train" as const,
      sourceId: "1",
      observedAt: "2026-07-13T00:00:00Z",
      firstAttempt: true,
    },
    explanation: "Review the move order.",
    recommendedDailyIntervention: "review_position" as const,
  };
  assert.equal(
    projectWeaknesses({
      userId: "user-a",
      findings: [
        finding,
        {
          ...finding,
          findingId: "f2",
          source: { ...finding.source, sourceId: "2" },
        },
      ],
      accessByPosition: active,
    }).length,
    1,
  );
  assert.equal(
    projectWeaknesses({
      userId: "user-a",
      findings: [finding],
      accessByPosition: locked,
    }).length,
    0,
  );
});
test("one ambiguous imported finding remains low confidence", () => {
  assert.ok(
    calculateWeaknessConfidence({
      independentMisses: 1,
      ambiguousEvidence: 1,
      sourceCount: 1,
    }) < 0.4,
  );
});
