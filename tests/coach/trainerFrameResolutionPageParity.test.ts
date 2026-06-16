import assert from "node:assert/strict";

import { buildStage2FeatureTrace } from "../../lib/blundr/debug/buildStage2FeatureTrace";
import { buildTrainerDebugSnapshot } from "../../lib/blundr/debug/trainerDebugSnapshot";
import { buildTrainerFrameResolution } from "../../lib/blundr/debug/buildTrainerFrameResolution";

type Input = Record<string, unknown>;

function baseInput(overrides: Input = {}): Input {
  return {
    debugEnabled: true,
    trainerFrameId: 401,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: true,
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    selectedOpeningId: "london-white",
    selectedLineId: "london-white",
    instructionTargetUci: "e2e4",
    instructionTargetSan: "e4",
    instructionTargetPieceType: "p",
    expectedMoveUci: "e2e4",
    expectedMoveSan: "e4",
    coachMoveUci: "e2e4",
    coachPieceType: "p",
    visualMoveUci: "e2e4",
    visualRecipe: {
      visualRecipeId: "recipe:e4",
      patternId: "pattern:e4",
      moveUci: "e2e4",
      moveSan: "e4",
      beats: [{ primitives: [{ id: "p1" }, { id: "p2" }] }],
    },
    visualRecipeOverlay: {
      adapterAllowed: true,
      adapterSuppressedReason: null,
    },
    visualRecipePrimitiveIds: ["p1", "p2"],
    visualRecipeMoveUci: "e2e4",
    visualRecipeMoveSan: "e4",
    visualRecipeTargetMatchesInstructionTarget: true,
    visualRecipeBlockedByTargetMismatch: false,
    visibleTeachingSurface: {
      owner: "v28_visible_surface",
      mode: "assisted",
      coach: {
        shouldRender: true,
        title: "e4 — Challenge the center",
        body: "Move the pawn to e4.",
        buttons: ["hint", "answer"],
      },
      safety: { blocked: false },
    },
    displayedCoachDecision: {
      shouldShowCoachCard: true,
      title: "e4 — Challenge the center",
      body: "Move the pawn to e4.",
      buttons: ["why", "replay", "hide"],
      debug: { coachDecisionSource: "live_coach", coachMoveUci: "e2e4", coachPieceType: "p", coachSafetyWarnings: [] },
    },
    coachDecision: {
      shouldShowCoachCard: true,
      title: "e4 — Challenge the center",
      body: "Move the pawn to e4.",
      buttons: ["why", "replay", "hide"],
      debug: { coachDecisionSource: "live_coach", coachMoveUci: "e2e4", coachPieceType: "p", coachSafetyWarnings: [] },
    },
    presentationFrame: {
      visual: { shouldRender: true, source: "visual_recipe" },
      coach: { shouldRender: true, owner: "intent_first_coach", title: "e4 — Challenge the center", body: "Move the pawn to e4." },
      legacy: {},
    },
    renderedQualityScore: 42,
    renderedQualityScoreSource: "final_rendered",
    coachQuality: {
      qualityScore: 42,
      qualityScoreSource: "final_rendered",
      lowQualityTriggered: false,
    },
    renderedVisualPrimitiveCount: 2,
    surfaceVisualPrimitiveCount: 2,
    actualCoachCardTitle: "e4 — Challenge the center",
    actualCoachCardBody: "Move the pawn to e4.",
    actualCoachCardButtons: ["why", "replay", "hide"],
    actualCoachCardSource: "surfaceCoachCardDecision",
    actualActionSource: "visible_surface_v28",
    actualVisualSource: "visible_surface_v28",
    runtimeBookQueried: true,
    runtimeBookOpeningId: "london-white",
    runtimeBookPlayKeyBefore: "e2e4",
    runtimeBookStatus: "ready",
    runtimeBookCandidateCount: 2,
    runtimeBookTopCandidateUci: "e2e4",
    runtimeBookTopCandidateSan: "e4",
    runtimeBookTopCandidateRank: 1,
    runtimeBookTopCandidateGames: 1234,
    runtimeBookBookExhausted: false,
    runtimeBookFallbackUsed: false,
    runtimeBookFallbackAuthority: null,
    stage2CoachingResolverEnabled: true,
    stage2ApprovedContentEnabled: false,
    stage2SafeFallbackEnabled: true,
    stage2CoachingPacketKind: "safe_fallback",
    stage2CoachingSafetyStatus: "safe",
    stage2CoachingSurface: "assisted",
    stage2CoachingSourceFile: "stage2://safe-fallback",
    stage2CoachingRuntimeMatched: true,
    ...overrides,
  };
}

export function testTrainerFrameResolutionPageParity(): void {
  const input = baseInput();
  const resolution = buildTrainerFrameResolution(input);

  const snapshotWithResolution = buildTrainerDebugSnapshot({
    ...input,
    trainerFrameResolution: resolution,
  });
  const snapshotWithoutResolution = buildTrainerDebugSnapshot(input);

  assert.equal(resolution.coachCard.finalRendered.title, "e4 — Challenge the center");
  assert.equal(resolution.coachCard.finalRendered.body, "Move the pawn to e4.");
  assert.equal(snapshotWithResolution.coach.visibleTitle, resolution.coachCard.finalRendered.title);
  assert.equal(snapshotWithResolution.coach.visibleBody, resolution.coachCard.finalRendered.body);
  assert.deepEqual(snapshotWithResolution.health.criticalIssues, snapshotWithoutResolution.health.criticalIssues, "injecting TrainerFrameResolution must not change critical issues");
  assert.deepEqual(snapshotWithResolution.health.warnings, snapshotWithoutResolution.health.warnings, "injecting TrainerFrameResolution must not change warnings");
  assert.equal(snapshotWithResolution.visual.actualVisualSource, snapshotWithoutResolution.visual.actualVisualSource);
  assert.equal(snapshotWithResolution.visual.renderedVisualPrimitiveCount, snapshotWithoutResolution.visual.renderedVisualPrimitiveCount);

  const traceWithResolution = buildStage2FeatureTrace({
    ...input,
    trainerFrameResolution: resolution,
  });
  const traceWithoutResolution = buildStage2FeatureTrace(input);
  assert.equal((traceWithResolution.featureTrace as any).coachCardResult.finalRendered.title, resolution.coachCard.finalRendered.title);
  assert.equal((traceWithResolution.featureTrace as any).coachCardResult.finalRendered.body, resolution.coachCard.finalRendered.body);
  assert.equal((traceWithResolution.featureTrace as any).finalRenderedTitle, resolution.coachCard.finalRendered.title);
  assert.equal((traceWithResolution.featureTrace as any).finalRenderedBody, resolution.coachCard.finalRendered.body);
  assert.equal((traceWithResolution.featureTrace as any).visualRecipeResult.authority, resolution.visual.authority);
  assert.equal((traceWithResolution.featureTrace as any).visualRecipeResult.fallbackCurrentSurfaceRendered, true);
  assert.equal((traceWithResolution.featureTrace as any).visualRecipeResult.noVisualsRendered, false);
  assert.deepEqual((traceWithResolution.featureTrace as any).coachCardResult.finalRendered, (traceWithoutResolution.featureTrace as any).coachCardResult.finalRendered, "feature trace final coach card must remain stable");
  assert.deepEqual((traceWithResolution.featureTrace as any).visualRecipeResult, (traceWithoutResolution.featureTrace as any).visualRecipeResult, "feature trace visual result must remain stable");
}

testTrainerFrameResolutionPageParity();
console.log("trainerFrameResolutionPageParity ok");
