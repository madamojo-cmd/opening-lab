import assert from "node:assert/strict";

import { buildOpeningTree } from "../../lib/blundr/openings/openingTree";
import { resolveExpectedMoveForFrame } from "../../lib/blundr/openings/expectedMoveResolver";
import { buildCurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";

export function testStage2OpeningFamilyPlanCannotCreateTargetlessTeachingFrame(): void {
  const openingTree = buildOpeningTree([] as any);
  const resolution = resolveExpectedMoveForFrame({
    openingTree,
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    trainerPhase: "ready_for_user",
    trainingMode: "restricted",
    trainerView: "assisted",
    isUserTurn: true,
    userColor: "w",
    opponentColor: "b",
    legacyExpectedMoveCandidate: null,
    enginePreview: null,
    allowEngineFallbackInRestricted: false,
  });

  assert.equal(resolution.source, "opening_family_plan");
  assert.equal(Boolean(resolution.expectedMoveUci), true);

  const guidedMoveAuthorityEligible =
    Boolean(resolution.expectedMoveUci) &&
    resolution.source !== "continuation_candidate" &&
    resolution.source !== "opening_family_plan";

  const frame = buildCurrentInstructionFrame({
    frameId: 1002,
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    trainingMode: "restricted",
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    isUserTurn: true,
    guidedMove: guidedMoveAuthorityEligible ? {
      uci: resolution.expectedMoveUci,
      san: resolution.expectedMoveSan,
      source: resolution.source,
      kind: "guided_move",
      trust: "book_verified",
    } : null,
  } as any);

  assert.equal(frame.kind, "blocked");
  assert.equal(frame.target, null);
  assert.equal(frame.nullReason != null, true);
}

testStage2OpeningFamilyPlanCannotCreateTargetlessTeachingFrame();
console.log("stage2OpeningFamilyPlanCannotCreateTargetlessTeachingFrame ok");
