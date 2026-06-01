import assert from "node:assert/strict";

import { computeTrainerPresentationFrame } from "../trainerPresentationFrame";

export function testPresentationVisualIndependence(): void {
  const frame = computeTrainerPresentationFrame({
    frameId: 7,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "restricted",
    activeBoard: true,
    isUserTurn: true,
    fen: "8/8/8/8/8/8/8/4K3 w - -",
    visualRecipeId: "vr",
    visualRecipeLines: [{ from: "e2", to: "e4" }],
    legacyLines: [],
    activePrimitiveIds: ["arrow"],
    recipeFrameMatchesBoard: true,
    recipeFenMatchesBoard: true,
    adapterAllowed: true,
    playbackReady: true,
    coachHiddenForFrame: true,
    coachShouldShow: false,
    coachSurfacePolicy: { allowLegacyTrainingCard: false, allowLegacyAnswerCard: false, allowMoveImpactCard: false, allowNextMoveText: false, owner: "none", reason: "hidden_for_frame" } as any,
  });
  assert.equal(frame.visual.shouldRender, true);
  assert.equal(frame.coach.shouldRender, false);
}
