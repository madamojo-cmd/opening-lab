import assert from "node:assert/strict";

import { computeTrainerPresentationFrame } from "../trainerPresentationFrame";

export function testTrainerPresentationFrame(): void {
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
    coachShouldShow: true,
    coachTitle: "Opening pattern",
    coachBody: "The bishop develops.",
    coachButtons: ["why"],
    coachHiddenForFrame: false,
    coachSurfacePolicy: { allowLegacyTrainingCard: false, allowLegacyAnswerCard: false, allowMoveImpactCard: false, allowNextMoveText: false, owner: "evidence_coach", reason: "coach_active" } as any,
  });
  assert.equal(frame.visual.shouldRender, true);
  assert.equal(frame.coach.shouldRender, true);
  assert.equal(frame.legacy.allowTrainingCard, false);

  const continuationFrame = computeTrainerPresentationFrame({
    frameId: 8,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "continuation",
    activeBoard: true,
    isUserTurn: true,
    fen: "8/8/8/8/8/8/8/4K3 w - -",
    visualRecipeLines: [],
    continuationCandidateLines: [{ from: "e4", to: "d5" }],
    legacyLines: [],
    activePrimitiveIds: [],
    recipeFrameMatchesBoard: false,
    recipeFenMatchesBoard: false,
    adapterAllowed: false,
    playbackReady: false,
    coachShouldShow: false,
    coachHiddenForFrame: false,
    coachSurfacePolicy: { allowLegacyTrainingCard: false, allowLegacyAnswerCard: false, allowMoveImpactCard: false, allowNextMoveText: false, owner: "none", reason: "no_recipe" } as any,
  });
  assert.equal(continuationFrame.visual.shouldRender, true);
  assert.equal(continuationFrame.visual.source, "continuation_candidate");
  assert.equal(continuationFrame.visual.lines.length, 1);

  const safeMoveFrame = computeTrainerPresentationFrame({
    frameId: 9,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "restricted",
    activeBoard: true,
    isUserTurn: true,
    fen: "8/8/8/8/8/8/8/4K3 w - -",
    visualRecipeLines: [],
    safeMoveArrowLines: [{ from: "b1", to: "d2" }],
    legacyLines: [],
    activePrimitiveIds: [],
    recipeFrameMatchesBoard: false,
    recipeFenMatchesBoard: false,
    adapterAllowed: false,
    playbackReady: false,
    coachShouldShow: false,
    coachHiddenForFrame: false,
    coachSurfacePolicy: { allowLegacyTrainingCard: false, allowLegacyAnswerCard: false, allowMoveImpactCard: false, allowNextMoveText: false, owner: "none", reason: "no_recipe" } as any,
  });
  assert.equal(safeMoveFrame.visual.shouldRender, true);
  assert.equal(safeMoveFrame.visual.source, "guided_target_fallback");

  const branchTransitionFrame = computeTrainerPresentationFrame({
    frameId: 10,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "restricted",
    activeBoard: true,
    isUserTurn: true,
    fen: "8/8/8/8/8/8/8/4K3 w - -",
    visualRecipeLines: [],
    legacyLines: [],
    activePrimitiveIds: [],
    recipeFrameMatchesBoard: false,
    recipeFenMatchesBoard: false,
    adapterAllowed: false,
    playbackReady: false,
    coachShouldShow: false,
    coachHiddenForFrame: false,
    branchTransitionSurface: true,
    branchTransitionTitle: "Continue from here",
    branchTransitionBody: "This branch is beyond the guided line.",
    branchTransitionButtons: ["show_plan"],
    coachSurfacePolicy: { allowLegacyTrainingCard: false, allowLegacyAnswerCard: false, allowMoveImpactCard: false, allowNextMoveText: false, owner: "none", reason: "no_recipe" } as any,
  });
  assert.equal(branchTransitionFrame.coach.shouldRender, true);
  assert.equal(branchTransitionFrame.coach.owner, "branch_transition_surface");
}
