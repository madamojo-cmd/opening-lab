import assert from "node:assert/strict";
import test from "node:test";
import {
  buildRemoteLearningEventPayload,
  shouldPersistRemoteLearningEvent,
} from "../learningEvents";

test("remote learning payload keeps the canonical event id and Trainer play key", () => {
  const payload = buildRemoteLearningEventPayload({
    id: "learn-e-1",
    type: "move_correct",
    source: "train",
    createdAt: "2026-07-20T12:00:00.000Z",
    sessionId: "learn-s-1",
    openingId: "italian-white",
    moveOrderKey: "e2e4,e7e5,g1f3,b8c6,f1c4,f8c5",
    fen: "r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
    expectedMoveUci: "c2c3",
    playedMoveUci: "c2c3",
    correct: true,
  });
  assert.equal(payload.eventId, "learn-e-1");
  assert.equal(payload.id, "learn-e-1");
  assert.equal(payload.moveOrderKey, "e2e4,e7e5,g1f3,b8c6,f1c4,f8c5");
});

test("only outcome and reveal events cross the authenticated learning boundary", () => {
  assert.equal(
    shouldPersistRemoteLearningEvent({ type: "move_correct" }),
    true,
  );
  assert.equal(
    shouldPersistRemoteLearningEvent({ type: "move_incorrect" }),
    true,
  );
  assert.equal(
    shouldPersistRemoteLearningEvent({ type: "cue_revealed" }),
    true,
  );
  assert.equal(
    shouldPersistRemoteLearningEvent({ type: "position_loaded" }),
    false,
  );
  assert.equal(
    shouldPersistRemoteLearningEvent({ type: "move_attempted" }),
    false,
  );
  assert.equal(
    shouldPersistRemoteLearningEvent({ type: "teaching_cue_compiled" }),
    false,
  );
  assert.equal(
    shouldPersistRemoteLearningEvent({ type: "move_quality_checked" }),
    false,
  );
});
