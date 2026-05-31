import assert from "node:assert/strict";

import { computeTrainerPresentationFrame } from "../trainerPresentationFrame";

export function testPresentationLegacySuppression(): void {
  const frame = computeTrainerPresentationFrame({
    frameId: 1,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "continuation",
    activeBoard: true,
    isUserTurn: true,
    fen: "8/8/8/8/8/8/8/4K3 w - -",
    visualRecipeLines: [],
    legacyLines: [{ from: "a2", to: "a4" }],
    activePrimitiveIds: [],
    recipeFrameMatchesBoard: false,
    recipeFenMatchesBoard: false,
    adapterAllowed: false,
    playbackReady: false,
    coachShouldShow: false,
    coachHiddenForFrame: true,
    coachSurfacePolicy: { allowLegacyTrainingCard: true, allowLegacyAnswerCard: true, allowMoveImpactCard: true, allowNextMoveText: true, owner: "none", reason: "test" } as any,
  });
  assert.equal(frame.legacy.allowTrainingCard, false);
  assert.equal(frame.legacy.allowNextMoveText, false);
}
