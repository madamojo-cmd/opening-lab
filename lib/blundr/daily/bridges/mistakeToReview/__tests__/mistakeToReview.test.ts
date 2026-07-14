import assert from "node:assert/strict";
import test from "node:test";
import {
  createPositionIdentity,
  type LearningEventV2,
} from "@/lib/blundr/contracts";
import { buildReviewQueue } from "..";
const event = (id: string): LearningEventV2 => ({
  schemaVersion: "2026-07-13.v1",
  eventId: id as never,
  attemptId: null,
  sessionId: "s" as never,
  userId: "u",
  occurredAt: "2026-07-13T00:00:00Z",
  taxonomy: "move_incorrect",
  position: createPositionIdentity({
    canonicalFen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1",
    openingId: "italian-white",
    repertoireSide: "white",
  }),
  finding: null,
  firstAttempt: true,
  idempotencyKey: id,
  source: "train",
  contentVersion: "v1",
  classifierVersion: "v1",
  migrationMarker: null,
  deletedAt: null,
});
test("mistakes deduplicate into one review card with accumulated evidence", () => {
  const queue = buildReviewQueue([event("a"), event("b")]);
  assert.equal(queue.length, 1);
  assert.deepEqual(queue[0].evidenceIds, ["a", "b"]);
});
