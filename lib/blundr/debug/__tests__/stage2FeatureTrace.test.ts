import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { BlundrDiagnosticsPanel, buildDebugCopyEverythingPayload } from "../../../../components/debug/BlundrDiagnosticsPanel";
import { buildStage2FeatureTrace } from "../buildStage2FeatureTrace";
import { buildTrainerDebugSnapshot } from "../trainerDebugSnapshot";

type TraceInput = Record<string, unknown>;

function baseInput(overrides: TraceInput = {}): TraceInput {
  return {
    debugEnabled: true,
    trainerFrameId: 101,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: true,
    selectedOpeningId: "london-white",
    selectedLineId: "london-white",
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
    coachDecision: {
      shouldShowCoachCard: true,
      title: "e4 — Challenge the center",
      body: "Move the pawn to e4.",
      buttons: ["why", "replay", "hide"],
      debug: {
        coachDecisionSource: "live_coach",
        coachMoveUci: "e2e4",
        coachPieceType: "p",
        coachSafetyWarnings: [],
        selectedOpportunityId: "trace:central_pawn_advance",
      },
    },
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
    presentationFrame: {
      visual: { shouldRender: true, source: "visual_recipe" },
      coach: { owner: "intent_first_coach", title: "e4 — Challenge the center", body: "Move the pawn to e4." },
      legacy: {},
    },
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

function assertHasConcept(trace: any, conceptId: string): void {
  assert.equal(trace.detectedConcepts.some((concept: any) => concept.id === conceptId), true, `missing concept ${conceptId}`);
}

function assertHasFeature(trace: any, featureLabel: string): void {
  assert.equal(trace.detectedFeatures.some((feature: any) => feature.label === featureLabel), true, `missing feature ${featureLabel}`);
}

function assertTraceScenario(
  label: string,
  input: TraceInput,
  expected: {
    conceptIds: string[];
    featureLabel: string;
    moveUci: string;
    moveSan?: string;
    selectedConceptId?: string;
  },
): void {
  const bundle = buildStage2FeatureTrace(input);
  const trace = bundle.featureTrace as any;
  assert.equal(trace.moveUci, expected.moveUci, `${label}: moveUci`);
  if (expected.moveSan) assert.equal(trace.moveSan, expected.moveSan, `${label}: moveSan`);
  for (const conceptId of expected.conceptIds) assertHasConcept(trace, conceptId);
  assertHasFeature(trace, expected.featureLabel);
  assert.equal(trace.selectedOpportunity?.selected, true, `${label}: selected opportunity should be ranked first`);
  if (expected.selectedConceptId) {
    assert.equal(trace.selectedOpportunity?.conceptId, expected.selectedConceptId, `${label}: selected concept`);
  }
  assert.equal(trace.traceStatus === "complete" || trace.traceStatus === "partial" || trace.traceStatus === "missing", true, `${label}: valid status`);
  assert.equal(trace.missingReasons.includes("approved_content_disabled"), true, `${label}: approved content should be reported disabled`);
  assert.equal(trace.finalRenderedTitle, trace.coachCardResult.finalRendered.title, `${label}: final rendered title matches coach card result`);
  assert.equal(trace.finalRenderedBody, trace.coachCardResult.finalRendered.body, `${label}: final rendered body matches coach card result`);
  assert.equal(Array.isArray(bundle.featureTraceTimeline), true, `${label}: timeline array`);
  assert.equal(bundle.featureTraceTimeline.length >= 3, true, `${label}: timeline entries`);
  assert.equal(bundle.featureTraceTimeline[0]?.stage, "detected", `${label}: timeline detected stage`);
  assert.equal(bundle.featureTraceTimeline[1]?.stage, "ranked", `${label}: timeline ranked stage`);
  assert.equal(bundle.featureTraceTimeline[2]?.stage, "rendered", `${label}: timeline rendered stage`);
}

export function testStage2FeatureTrace(): void {
  assertTraceScenario(
    "e4",
    baseInput({
      trainerFrameId: 201,
      selectedOpeningId: "london-white",
      selectedLineId: "london-white",
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      instructionTargetUci: "e2e4",
      expectedMoveUci: "e2e4",
      expectedMoveSan: "e4",
      coachMoveUci: "e2e4",
      coachPieceType: "p",
      visualMoveUci: "e2e4",
      visualRecipeMoveUci: "e2e4",
      visualRecipeMoveSan: "e4",
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
      coachDecision: {
        shouldShowCoachCard: true,
        title: "e4 — Challenge the center",
        body: "Move the pawn to e4.",
        buttons: ["why", "replay", "hide"],
        debug: { coachDecisionSource: "live_coach", coachMoveUci: "e2e4", coachPieceType: "p", coachSafetyWarnings: [] },
      },
    }),
    { conceptIds: ["central_pawn_advance", "center_control"], featureLabel: "central_pawn_advance", moveUci: "e2e4", moveSan: "e4", selectedConceptId: "center_control" },
  );

  assertTraceScenario(
    "Nf3",
    baseInput({
      trainerFrameId: 202,
      selectedOpeningId: "italian-white",
      selectedLineId: "italian-white",
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      instructionTargetUci: "g1f3",
      expectedMoveUci: "g1f3",
      expectedMoveSan: "Nf3",
      coachMoveUci: "g1f3",
      coachPieceType: "n",
      visualMoveUci: "g1f3",
      visualRecipeMoveUci: "g1f3",
      visualRecipeMoveSan: "Nf3",
      coachDecision: {
        shouldShowCoachCard: true,
        title: "Nf3 — Develop the knight",
        body: "Move the knight to f3.",
        buttons: ["why", "replay", "hide"],
        debug: { coachDecisionSource: "live_coach", coachMoveUci: "g1f3", coachPieceType: "n", coachSafetyWarnings: [] },
      },
    }),
    { conceptIds: ["minor_piece_development", "development"], featureLabel: "minor_piece_development", moveUci: "g1f3", moveSan: "Nf3", selectedConceptId: "minor_piece_development" },
  );

  assertTraceScenario(
    "O-O",
    baseInput({
      trainerFrameId: 203,
      selectedOpeningId: "king-safety-white",
      selectedLineId: "king-safety-white",
      fen: "r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1",
      instructionTargetUci: "e1g1",
      expectedMoveUci: "e1g1",
      expectedMoveSan: "O-O",
      coachMoveUci: "e1g1",
      coachPieceType: "k",
      visualMoveUci: "e1g1",
      visualRecipeMoveUci: "e1g1",
      visualRecipeMoveSan: "O-O",
      coachDecision: {
        shouldShowCoachCard: true,
        title: "O-O — Prioritize king safety",
        body: "Castle to keep the king safe.",
        buttons: ["why", "replay", "hide"],
        debug: { coachDecisionSource: "live_coach", coachMoveUci: "e1g1", coachPieceType: "k", coachSafetyWarnings: [] },
      },
    }),
    { conceptIds: ["castling", "king_safety"], featureLabel: "castling", moveUci: "e1g1", moveSan: "O-O", selectedConceptId: "king_safety" },
  );

  assertTraceScenario(
    "capture",
    baseInput({
      trainerFrameId: 204,
      selectedOpeningId: "material-white",
      selectedLineId: "material-white",
      fen: "4k3/8/8/3p4/4P3/8/8/4K3 w - - 0 1",
      instructionTargetUci: "e4d5",
      expectedMoveUci: "e4d5",
      expectedMoveSan: "exd5",
      coachMoveUci: "e4d5",
      coachPieceType: "p",
      visualMoveUci: "e4d5",
      visualRecipeMoveUci: "e4d5",
      visualRecipeMoveSan: "exd5",
      coachDecision: {
        shouldShowCoachCard: true,
        title: "exd5 — Evaluate the exchange",
        body: "Capture on d5 when the material balance works.",
        buttons: ["why", "replay", "hide"],
        debug: { coachDecisionSource: "live_coach", coachMoveUci: "e4d5", coachPieceType: "p", coachSafetyWarnings: [] },
      },
    }),
    { conceptIds: ["capture", "material"], featureLabel: "capture", moveUci: "e4d5", moveSan: "exd5", selectedConceptId: "material" },
  );

  assertTraceScenario(
    "check",
    baseInput({
      trainerFrameId: 205,
      selectedOpeningId: "check-white",
      selectedLineId: "check-white",
      fen: "4k3/8/8/8/8/8/4Q3/4K3 w - - 0 1",
      instructionTargetUci: "e2e7",
      expectedMoveUci: "e2e7",
      expectedMoveSan: "Qe7+",
      coachMoveUci: "e2e7",
      coachPieceType: "q",
      visualMoveUci: "e2e7",
      visualRecipeMoveUci: "e2e7",
      visualRecipeMoveSan: "Qe7+",
      coachDecision: {
        shouldShowCoachCard: true,
        title: "Qe7+ — Force the king",
        body: "The check creates a forcing sequence.",
        buttons: ["why", "replay", "hide"],
        debug: { coachDecisionSource: "live_coach", coachMoveUci: "e2e7", coachPieceType: "q", coachSafetyWarnings: [] },
      },
    }),
    { conceptIds: ["forcing_move", "check"], featureLabel: "forcing_move", moveUci: "e2e7", moveSan: "Qe7+", selectedConceptId: "check" },
  );

  const fallbackBundle = buildStage2FeatureTrace(
    baseInput({
      trainerFrameId: 206,
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      instructionTargetUci: "e2e4",
      expectedMoveUci: "e2e4",
      expectedMoveSan: "e4",
      runtimeSafeFallbackUsed: true,
      runtimeSafeFallbackReason: "claim_validation_failed",
      coachDecision: {
        shouldShowCoachCard: true,
        title: "Safety Fallback",
        body: "Think about the safest improving move here.",
        buttons: ["show_more"],
        debug: {
          coachDecisionSource: "verified_safe_fallback",
          verifiedFallbackUsed: true,
          fallbackReason: "claim_validation_failed",
          coachMoveUci: "e2e4",
          coachPieceType: "p",
          coachSafetyWarnings: [],
        },
      },
    }),
  );
  assert.equal((fallbackBundle.featureTrace as any).coachCardResult.fallbackUsed, true, "fallback bundle should report fallbackUsed");
  assert.equal((fallbackBundle.featureTrace as any).coachCardResult.fallbackReason, "claim_validation_failed", "fallback bundle should report fallbackReason");

  const plainBundle = buildStage2FeatureTrace(
    baseInput({
      trainerFrameId: 207,
      trainerView: "plain",
      selectedOpeningId: "london-white",
      selectedLineId: "london-white",
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      instructionTargetUci: "e2e4",
      expectedMoveUci: "e2e4",
      expectedMoveSan: "e4",
      visibleTeachingSurface: {
        owner: "v28_visible_surface",
        mode: "plain_before_show_more",
        coach: {
          shouldRender: true,
          title: "Think about the center",
          body: "Look for a safe developing move before you ask for more detail.",
          buttons: ["hint", "show_more"],
        },
        safety: { blocked: false },
      },
      coachDecision: {
        shouldShowCoachCard: true,
        title: "e4 — Challenge the center",
        body: "Play e4 to challenge the center.",
        buttons: ["why", "replay", "hide"],
        debug: {
          coachDecisionSource: "live_coach",
          coachMoveUci: "e2e4",
          coachPieceType: "p",
          coachSafetyWarnings: [],
        },
      },
    }),
  );
  assert.equal((plainBundle.featureTrace as any).coachCardResult.renderedCopyAuthority, "visible_surface_v28", "plain pre-show-more should keep surface authority");
  const plainCoachText = `${(plainBundle.featureTrace as any).coachCardResult.visibleTitle} ${(plainBundle.featureTrace as any).coachCardResult.visibleBody}`;
  assert.equal(plainCoachText.includes("e2e4"), false, "plain pre-show-more coach copy must not leak target UCI");
  assert.equal(plainCoachText.includes("e4"), false, "plain pre-show-more coach copy must not leak target SAN");

  const parityBundle = buildStage2FeatureTrace(
    baseInput({
      trainerFrameId: 208,
      selectedOpeningId: "london-white",
      selectedLineId: "london-white",
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      instructionTargetUci: "e2e4",
      expectedMoveUci: "e2e4",
      expectedMoveSan: "e4",
      coachMoveUci: "e2e4",
      coachPieceType: "p",
      visualMoveUci: "e2e4",
      visualRecipe: null,
      visualRecipeOverlay: null,
      visualRecipePrimitiveIds: [],
      visualRecipeMoveUci: null,
      visualRecipeMoveSan: null,
      actualCoachCardTitle: "Final Rendered Title",
      actualCoachCardBody: "Final rendered body",
      actualCoachCardButtons: ["final"],
      actualCoachCardSource: "surfaceCoachCardDecision",
      actualVisualSource: "visible_surface_v28",
      renderedVisualPrimitiveCount: 2,
      surfaceVisualPrimitiveCount: 2,
      visibleTeachingSurface: {
        owner: "v28_visible_surface",
        mode: "assisted",
        coach: {
          shouldRender: true,
          title: "Pre Authority Title",
          body: "Pre authority body",
          buttons: ["surface"],
        },
        safety: { blocked: false },
      },
      coachDecision: {
        shouldShowCoachCard: true,
        title: "Pipeline Title",
        body: "Pipeline body",
        buttons: ["pipeline"],
        debug: { coachDecisionSource: "live_coach", coachMoveUci: "e2e4", coachPieceType: "p", coachSafetyWarnings: [] },
      },
    }),
  );
  assert.equal((parityBundle.featureTrace as any).coachCardResult.preAuthority.title, "Pre Authority Title", "pre-authority copy captured");
  assert.equal((parityBundle.featureTrace as any).coachCardResult.pipeline.title, "Pipeline Title", "pipeline copy captured");
  assert.equal((parityBundle.featureTrace as any).coachCardResult.finalRendered.title, "Final Rendered Title", "final rendered copy captured");
  assert.equal((parityBundle.featureTrace as any).finalRenderedTitle, "Final Rendered Title", "final rendered title exposed");
  assert.equal((parityBundle.featureTrace as any).visualRecipeResult.authority, "fallback_current_surface", "fallback/current surface visuals should be reported");
  assert.equal((parityBundle.featureTrace as any).visualRecipeResult.noVisualsRendered, false, "fallback/current surface visuals are not no visuals");
  assert.equal((parityBundle.featureTrace as any).visualRecipeResult.fallbackCurrentSurfaceRendered, true, "fallback/current surface visuals should be reported");

  const snapshot = buildTrainerDebugSnapshot(baseInput({ trainerFrameId: 301, fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" }));
  assert.equal(Boolean((snapshot as any).featureTrace), true, "snapshot should expose featureTrace");
  assert.equal(Array.isArray((snapshot as any).featureTraceTimeline), true, "snapshot should expose featureTraceTimeline");
  assert.equal((snapshot as any).featureTrace?.moveUci, "e2e4");
  assert.equal((snapshot as any).featureTrace?.coachCardResult?.moveUci, "e2e4");
  assert.equal((snapshot as any).featureTrace?.visualRecipeResult?.moveUci, "e2e4");
  assert.equal((snapshot as any).featureTrace?.finalRenderedTitle, (snapshot as any).coach?.visibleTitle, "feature trace should match final coach title");

  const copyEverything = buildDebugCopyEverythingPayload(snapshot as any);
  assert.equal(Boolean((copyEverything as any).featureTrace), true, "copy everything should include featureTrace");
  assert.equal(Array.isArray((copyEverything as any).featureTraceTimeline), true, "copy everything should include featureTraceTimeline");

  const html = renderToStaticMarkup(
    React.createElement(BlundrDiagnosticsPanel, {
      snapshot: snapshot as any,
      enabled: true,
      onEnabledChange: () => {},
      onClearEvents: () => {},
    }),
  );
  assert.equal(html.includes("Blundr Diagnostics"), true, "diagnostics panel should render safely with feature trace present");
}
