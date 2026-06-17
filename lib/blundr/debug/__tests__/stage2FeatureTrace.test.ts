import assert from "node:assert/strict";
import { Chess } from "chess.js";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { BlundrDiagnosticsPanel, buildDebugCopyEverythingPayload } from "../../../../components/debug/BlundrDiagnosticsPanel";
import { buildStage2FeatureTrace } from "../buildStage2FeatureTrace";
import { findApprovedPacket, packetPlayKeyAtTarget, packetPlayKeyBefore } from "../../../../tests/coach/stage2ApprovedContentTestHelpers";
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
    stage2ApprovedContentEnabled: true,
    stage2SafeFallbackEnabled: true,
    stage2CoachingPacketKind: "approved_packet",
    stage2CoachingSafetyStatus: "safe",
    stage2CoachingSurface: "assisted",
    stage2CoachingSourceFile: "stage2://approved",
    stage2CoachingRuntimeMatched: true,
    stage2ApprovedPacketMatched: true,
    stage2ApprovedPacketKind: "approved_packet",
    stage2ApprovedPacketId: "trace:approved",
    stage2ApprovedPacketSourceBundle: "stage2-approved-content-approved-5openings-v1",
    stage2ApprovedPacketSourceFile: "data/blundr/stage2-approved-content-approved-5openings-v1/approved-packets.jsonl",
    stage2ApprovedPacketStatus: "approved",
    stage2ApprovedPacketApprovalReadiness: "app_validated",
    stage2ApprovedPacketMissReason: null,
    stage2ApprovedPacketFallbackReason: null,
    stage2ApprovedPacketVisualSource: "approved_recipe",
    ...overrides,
  };
}

function assertHasConcept(trace: any, conceptId: string): void {
  assert.equal(trace.detectedConcepts.some((concept: any) => concept.id === conceptId), true, `missing concept ${conceptId}`);
}

function assertHasFeature(trace: any, featureLabel: string): void {
  assert.equal(trace.detectedFeatures.some((feature: any) => feature.label === featureLabel), true, `missing feature ${featureLabel}`);
}

function fenBeforePacketMove(packet: any): string {
  const chess = new Chess();
  const sequence = Array.isArray(packet.playSequenceUci) ? packet.playSequenceUci : [];
  for (const moveUci of sequence.slice(0, Math.max(0, Number(packet.ply ?? sequence.length) - 1))) {
    chess.move({ from: String(moveUci).slice(0, 2), to: String(moveUci).slice(2, 4), promotion: String(moveUci).slice(4, 5) || undefined });
  }
  return chess.fen();
}

const e4Packet = findApprovedPacket((entry) => entry.openingId === "queens-gambit-white" && entry.moveUci === "e2e4" && entry.status === "approved");
const nf3Packet = findApprovedPacket((entry) => entry.openingId === "london-white" && entry.lineId === "london-white-line-002" && entry.moveUci === "g1f3" && entry.moveSan === "Nf3" && entry.status === "approved");
const castlePacket = findApprovedPacket((entry) => entry.openingId === "ruy-lopez-white" && entry.moveUci === "e1g1" && entry.status === "approved");
const capturePacket = findApprovedPacket((entry) => entry.openingId === "italian-white" && entry.moveUci === "e4d5" && entry.status === "approved");
const checkPacket = findApprovedPacket((entry) => entry.openingId === "italian-white" && entry.moveUci === "c4b5" && entry.status === "approved");

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
  assert.equal(trace.missingReasons.includes("approved_content_disabled"), false, `${label}: approved content should be enabled`);
  assert.equal(trace.missingReasons.includes("approved_content_not_matched"), false, `${label}: approved content should match exact gates`);
  assert.equal(trace.approvedPacket.matched, true, `${label}: approved packet should match`);
  assert.equal(trace.approvedPacket.packetKind, "approved_packet", `${label}: packet kind`);
  assert.equal(Boolean(trace.approvedPacket.packetId), true, `${label}: packet id`);
  assert.equal(Boolean(trace.approvedPacket.sourceBundle), true, `${label}: source bundle`);
  assert.equal(Boolean(trace.approvedPacket.visualSource), true, `${label}: visual source`);
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
      selectedOpeningId: e4Packet.openingId,
      selectedLineId: e4Packet.lineId,
      playKeyBefore: packetPlayKeyBefore(e4Packet),
      playKey: packetPlayKeyAtTarget(e4Packet),
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      instructionTargetUci: e4Packet.moveUci,
      expectedMoveUci: e4Packet.moveUci,
      expectedMoveSan: e4Packet.moveSan,
      coachMoveUci: e4Packet.moveUci,
      coachPieceType: "p",
      visualMoveUci: e4Packet.moveUci,
      visualRecipeMoveUci: e4Packet.moveUci,
      visualRecipeMoveSan: e4Packet.moveSan,
      visibleTeachingSurface: {
        owner: "v28_visible_surface",
        mode: "assisted",
        coach: {
          shouldRender: true,
          title: e4Packet.coachCard.title,
          body: e4Packet.coachCard.body,
          buttons: ["hint", "answer"],
        },
        safety: { blocked: false },
      },
      coachDecision: {
        shouldShowCoachCard: true,
        title: e4Packet.coachCard.title,
        body: e4Packet.coachCard.body,
        buttons: ["why", "replay", "hide"],
        debug: { coachDecisionSource: "live_coach", coachMoveUci: e4Packet.moveUci, coachPieceType: "p", coachSafetyWarnings: [] },
      },
      actualCoachCardTitle: e4Packet.coachCard.title,
      actualCoachCardBody: e4Packet.coachCard.body,
      actualCoachCardButtons: [],
      actualCoachCardSource: "surfaceCoachCardDecision",
      actualVisualSource: "approved_recipe",
      renderedVisualPrimitiveCount: 2,
      surfaceVisualPrimitiveCount: 2,
      stage2CoachingPacketKind: "approved_packet",
      stage2ApprovedPacketMatched: true,
      stage2ApprovedPacketKind: "approved_packet",
      stage2ApprovedPacketId: e4Packet.packetId,
      stage2ApprovedPacketSourceBundle: e4Packet.sourceCandidatePackages?.[0] ?? e4Packet.sourceCandidatePackage ?? null,
      stage2ApprovedPacketSourceFile: e4Packet.sourceFile,
      stage2ApprovedPacketStatus: "approved",
      stage2ApprovedPacketApprovalReadiness: "app_validated",
      stage2ApprovedPacketMissReason: null,
      stage2ApprovedPacketFallbackReason: null,
      stage2ApprovedPacketVisualSource: "approved_recipe",
      stage2CoachingSafetyStatus: e4Packet.safetyStatus,
      stage2CoachingSourceFile: e4Packet.sourceFile,
      stage2CoachingRuntimeMatched: true,
      visualRecipe: e4Packet.visualRecipe,
    }),
    { conceptIds: ["central_pawn_advance", "center_control"], featureLabel: "central_pawn_advance", moveUci: e4Packet.moveUci, moveSan: e4Packet.moveSan, selectedConceptId: "center_control" },
  );

  assertTraceScenario(
    "Nf3",
    baseInput({
      trainerFrameId: 202,
      selectedOpeningId: nf3Packet.openingId,
      selectedLineId: nf3Packet.lineId,
      playKeyBefore: packetPlayKeyBefore(nf3Packet),
      playKey: packetPlayKeyAtTarget(nf3Packet),
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      instructionTargetUci: nf3Packet.moveUci,
      expectedMoveUci: nf3Packet.moveUci,
      expectedMoveSan: nf3Packet.moveSan,
      coachMoveUci: nf3Packet.moveUci,
      coachPieceType: "n",
      visualMoveUci: nf3Packet.moveUci,
      visualRecipeMoveUci: nf3Packet.moveUci,
      visualRecipeMoveSan: nf3Packet.moveSan,
      coachDecision: {
        shouldShowCoachCard: true,
        title: nf3Packet.coachCard.title,
        body: nf3Packet.coachCard.body,
        buttons: ["why", "replay", "hide"],
        debug: { coachDecisionSource: "live_coach", coachMoveUci: nf3Packet.moveUci, coachPieceType: "n", coachSafetyWarnings: [] },
      },
      actualCoachCardTitle: nf3Packet.coachCard.title,
      actualCoachCardBody: nf3Packet.coachCard.body,
      actualCoachCardButtons: [],
      actualCoachCardSource: "surfaceCoachCardDecision",
      actualVisualSource: "approved_recipe",
      renderedVisualPrimitiveCount: 2,
      surfaceVisualPrimitiveCount: 2,
      stage2CoachingPacketKind: "approved_packet",
      stage2ApprovedPacketMatched: true,
      stage2ApprovedPacketKind: "approved_packet",
      stage2ApprovedPacketId: nf3Packet.packetId,
      stage2ApprovedPacketSourceBundle: nf3Packet.sourceCandidatePackages?.[0] ?? nf3Packet.sourceCandidatePackage ?? null,
      stage2ApprovedPacketSourceFile: nf3Packet.sourceFile,
      stage2ApprovedPacketStatus: "approved",
      stage2ApprovedPacketApprovalReadiness: "app_validated",
      stage2ApprovedPacketMissReason: null,
      stage2ApprovedPacketFallbackReason: null,
      stage2ApprovedPacketVisualSource: "approved_recipe",
      stage2CoachingSafetyStatus: nf3Packet.safetyStatus,
      stage2CoachingSourceFile: nf3Packet.sourceFile,
      stage2CoachingRuntimeMatched: true,
      visualRecipe: nf3Packet.visualRecipe,
    }),
    { conceptIds: ["minor_piece_development", "development"], featureLabel: "minor_piece_development", moveUci: nf3Packet.moveUci, moveSan: nf3Packet.moveSan, selectedConceptId: "minor_piece_development" },
  );

  assertTraceScenario(
    "O-O",
    baseInput({
      trainerFrameId: 203,
      selectedOpeningId: castlePacket.openingId,
      selectedLineId: castlePacket.lineId,
      playKeyBefore: packetPlayKeyBefore(castlePacket),
      playKey: packetPlayKeyAtTarget(castlePacket),
      fen: "r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1",
      instructionTargetUci: castlePacket.moveUci,
      expectedMoveUci: castlePacket.moveUci,
      expectedMoveSan: castlePacket.moveSan,
      coachMoveUci: castlePacket.moveUci,
      coachPieceType: "k",
      visualMoveUci: castlePacket.moveUci,
      visualRecipeMoveUci: castlePacket.moveUci,
      visualRecipeMoveSan: castlePacket.moveSan,
      coachDecision: {
        shouldShowCoachCard: true,
        title: castlePacket.coachCard.title,
        body: castlePacket.coachCard.body,
        buttons: ["why", "replay", "hide"],
        debug: { coachDecisionSource: "live_coach", coachMoveUci: castlePacket.moveUci, coachPieceType: "k", coachSafetyWarnings: [] },
      },
      actualCoachCardTitle: castlePacket.coachCard.title,
      actualCoachCardBody: castlePacket.coachCard.body,
      actualCoachCardButtons: [],
      actualCoachCardSource: "surfaceCoachCardDecision",
      actualVisualSource: "approved_recipe",
      renderedVisualPrimitiveCount: 2,
      surfaceVisualPrimitiveCount: 2,
      stage2CoachingPacketKind: "approved_packet",
      stage2ApprovedPacketMatched: true,
      stage2ApprovedPacketKind: "approved_packet",
      stage2ApprovedPacketId: castlePacket.packetId,
      stage2ApprovedPacketSourceBundle: castlePacket.sourceCandidatePackages?.[0] ?? castlePacket.sourceCandidatePackage ?? null,
      stage2ApprovedPacketSourceFile: castlePacket.sourceFile,
      stage2ApprovedPacketStatus: "approved",
      stage2ApprovedPacketApprovalReadiness: "app_validated",
      stage2ApprovedPacketMissReason: null,
      stage2ApprovedPacketFallbackReason: null,
      stage2ApprovedPacketVisualSource: "approved_recipe",
      stage2CoachingSafetyStatus: castlePacket.safetyStatus,
      stage2CoachingSourceFile: castlePacket.sourceFile,
      stage2CoachingRuntimeMatched: true,
      visualRecipe: castlePacket.visualRecipe,
    }),
    { conceptIds: ["castling", "king_safety"], featureLabel: "castling", moveUci: castlePacket.moveUci, moveSan: castlePacket.moveSan, selectedConceptId: "king_safety" },
  );

  assertTraceScenario(
    "capture",
    baseInput({
      trainerFrameId: 204,
      selectedOpeningId: capturePacket.openingId,
      selectedLineId: capturePacket.lineId,
      playKeyBefore: packetPlayKeyBefore(capturePacket),
      playKey: packetPlayKeyAtTarget(capturePacket),
      fen: "4k3/8/8/3p4/4P3/8/8/4K3 w - - 0 1",
      instructionTargetUci: capturePacket.moveUci,
      expectedMoveUci: capturePacket.moveUci,
      expectedMoveSan: capturePacket.moveSan,
      coachMoveUci: capturePacket.moveUci,
      coachPieceType: "p",
      visualMoveUci: capturePacket.moveUci,
      visualRecipeMoveUci: capturePacket.moveUci,
      visualRecipeMoveSan: capturePacket.moveSan,
      coachDecision: {
        shouldShowCoachCard: true,
        title: capturePacket.coachCard.title,
        body: capturePacket.coachCard.body,
        buttons: ["why", "replay", "hide"],
        debug: { coachDecisionSource: "live_coach", coachMoveUci: capturePacket.moveUci, coachPieceType: "p", coachSafetyWarnings: [] },
      },
      actualCoachCardTitle: capturePacket.coachCard.title,
      actualCoachCardBody: capturePacket.coachCard.body,
      actualCoachCardButtons: [],
      actualCoachCardSource: "surfaceCoachCardDecision",
      actualVisualSource: "approved_recipe",
      renderedVisualPrimitiveCount: 2,
      surfaceVisualPrimitiveCount: 2,
      stage2CoachingPacketKind: "approved_packet",
      stage2ApprovedPacketMatched: true,
      stage2ApprovedPacketKind: "approved_packet",
      stage2ApprovedPacketId: capturePacket.packetId,
      stage2ApprovedPacketSourceBundle: capturePacket.sourceCandidatePackages?.[0] ?? capturePacket.sourceCandidatePackage ?? null,
      stage2ApprovedPacketSourceFile: capturePacket.sourceFile,
      stage2ApprovedPacketStatus: "approved",
      stage2ApprovedPacketApprovalReadiness: "app_validated",
      stage2ApprovedPacketMissReason: null,
      stage2ApprovedPacketFallbackReason: null,
      stage2ApprovedPacketVisualSource: "approved_recipe",
      stage2CoachingSafetyStatus: capturePacket.safetyStatus,
      stage2CoachingSourceFile: capturePacket.sourceFile,
      stage2CoachingRuntimeMatched: true,
      visualRecipe: capturePacket.visualRecipe,
    }),
    { conceptIds: ["capture", "material"], featureLabel: "capture", moveUci: capturePacket.moveUci, moveSan: capturePacket.moveSan, selectedConceptId: "material" },
  );

  assertTraceScenario(
    "check",
    baseInput({
      trainerFrameId: 205,
      selectedOpeningId: checkPacket.openingId,
      selectedLineId: checkPacket.lineId,
      playKeyBefore: packetPlayKeyBefore(checkPacket),
      playKey: packetPlayKeyAtTarget(checkPacket),
      fen: fenBeforePacketMove(checkPacket),
      instructionTargetUci: checkPacket.moveUci,
      expectedMoveUci: checkPacket.moveUci,
      expectedMoveSan: checkPacket.moveSan,
      coachMoveUci: checkPacket.moveUci,
      coachPieceType: "q",
      visualMoveUci: checkPacket.moveUci,
      visualRecipeMoveUci: checkPacket.moveUci,
      visualRecipeMoveSan: checkPacket.moveSan,
      coachDecision: {
        shouldShowCoachCard: true,
        title: checkPacket.coachCard.title,
        body: checkPacket.coachCard.body,
        buttons: ["why", "replay", "hide"],
        debug: { coachDecisionSource: "live_coach", coachMoveUci: checkPacket.moveUci, coachPieceType: "q", coachSafetyWarnings: [] },
      },
      actualCoachCardTitle: checkPacket.coachCard.title,
      actualCoachCardBody: checkPacket.coachCard.body,
      actualCoachCardButtons: [],
      actualCoachCardSource: "surfaceCoachCardDecision",
      actualVisualSource: "approved_recipe",
      renderedVisualPrimitiveCount: 2,
      surfaceVisualPrimitiveCount: 2,
      stage2CoachingPacketKind: "approved_packet",
      stage2ApprovedPacketMatched: true,
      stage2ApprovedPacketKind: "approved_packet",
      stage2ApprovedPacketId: checkPacket.packetId,
      stage2ApprovedPacketSourceBundle: checkPacket.sourceCandidatePackages?.[0] ?? checkPacket.sourceCandidatePackage ?? null,
      stage2ApprovedPacketSourceFile: checkPacket.sourceFile,
      stage2ApprovedPacketStatus: "approved",
      stage2ApprovedPacketApprovalReadiness: "app_validated",
      stage2ApprovedPacketMissReason: null,
      stage2ApprovedPacketFallbackReason: null,
      stage2ApprovedPacketVisualSource: "approved_recipe",
      stage2CoachingSafetyStatus: checkPacket.safetyStatus,
      stage2CoachingSourceFile: checkPacket.sourceFile,
      stage2CoachingRuntimeMatched: true,
      visualRecipe: checkPacket.visualRecipe,
    }),
    { conceptIds: ["forcing_move", "check"], featureLabel: "forcing_move", moveUci: checkPacket.moveUci, moveSan: checkPacket.moveSan, selectedConceptId: "check" },
  );

  const fallbackBundle = buildStage2FeatureTrace(
    baseInput({
      trainerFrameId: 206,
      selectedOpeningId: "unknown-opening",
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      instructionTargetUci: "e2e4",
      expectedMoveUci: "e2e4",
      expectedMoveSan: "e4",
      stage2CoachingPacketKind: "safe_fallback",
      stage2CoachingSourceFile: "stage2://safe-fallback",
      stage2ApprovedPacketMatched: false,
      stage2ApprovedPacketKind: "safe_fallback",
      stage2ApprovedPacketId: null,
      stage2ApprovedPacketSourceBundle: null,
      stage2ApprovedPacketSourceFile: null,
      stage2ApprovedPacketStatus: null,
      stage2ApprovedPacketApprovalReadiness: null,
      stage2ApprovedPacketMissReason: "approved_packet_exact_match_not_found",
      stage2ApprovedPacketFallbackReason: "claim_validation_failed",
      stage2ApprovedPacketVisualSource: null,
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
  assert.equal((fallbackBundle.featureTrace as any).approvedPacket.packetKind, "safe_fallback", "fallback bundle should report safe fallback packet kind");
  assert.equal((fallbackBundle.featureTrace as any).approvedPacket.matched, false, "fallback bundle should not report approved packet match");
  assert.equal((fallbackBundle.featureTrace as any).approvedPacket.missReason, "approved_packet_exact_match_not_found", "fallback bundle should report approved miss reason");

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
