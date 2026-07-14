import assert from "node:assert/strict";

import { buildTrainerFrameResolution } from "../../lib/blundr/debug/buildTrainerFrameResolution";
import { packetPlayKeyAtTarget, packetPlayKeyBefore } from "./stage2ApprovedContentTestHelpers";
import { buildApprovedFeatureTrace, loadApprovedTracePacket } from "./stage2FeatureTraceTestHelpers";

export function testStage2FeatureConceptOpportunityTraceComplete(): void {
  const packet = loadApprovedTracePacket((entry) => entry.openingId === "queens-gambit-white" && entry.moveUci === "e2e4" && entry.status === "approved");
  const traceBundle = buildApprovedFeatureTrace(packet, {
    trainerFrameId: 610,
    selectedOpeningId: packet.openingId,
    selectedLineId: packet.lineId,
    moveUci: "e2e4",
    moveSan: "e4",
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    playKeyBefore: packetPlayKeyBefore(packet),
    playKey: packetPlayKeyAtTarget(packet),
    visibleSurfaceMode: "assisted",
    coachDecision: {
      shouldShowCoachCard: true,
      title: packet.coachCard.title,
      body: packet.coachCard.body,
      buttons: [],
      debug: { coachDecisionSource: "live_coach", coachMoveUci: packet.moveUci, coachPieceType: "p", coachSafetyWarnings: [], selectedTheme: "center_control", selectedOpportunityId: "center_control" },
    },
    currentInstructionFrameKind: "guided_move",
    instructionTargetSource: "opening_tree",
    visualRecipe: packet.visualRecipe,
    visualRecipeMoveUci: packet.moveUci,
    visualRecipeMoveSan: packet.moveSan,
  });
  const trace = traceBundle.featureTrace as any;

  assert.equal(trace.frameKind, "instructional_user_turn");
  assert.equal(trace.featureDetectorContributed, true);
  assert.equal(Array.isArray(trace.selectedFeatureIds), true);
  assert.equal(trace.selectedFeatureIds.includes("move_fact:central_pawn_advance") || trace.selectedFeatureIds.includes("move_fact:center_control"), true);
  assert.equal(trace.selectedConceptId === "center_control" || trace.selectedConceptId === "central_pawn_advance", true);
  assert.equal(trace.selectedTheme === "center_control" || trace.selectedTheme === "central_pawn_advance", true);
  assert.equal(trace.reviewCandidateEventEligible, true);
  assert.equal(trace.reviewCandidateEventPreview?.selectedOpportunityId, trace.selectedOpportunity?.id);
  assert.equal(trace.finalRenderedTitle, trace.coachCardResult.finalRendered.title);
  assert.equal(trace.finalRenderedBody, trace.coachCardResult.finalRendered.body);
  assert.equal(trace.traceStatus, "partial");
  assert.equal(trace.missingReasons.includes("approved_content_disabled"), false);
  // The exact approved packet now wins for this valid fixture; the old miss assertion predated PR-00 precedence.
  assert.equal(trace.missingReasons.includes("approved_content_not_matched"), false);
  assert.equal(trace.missingReasons.includes("coachcard_fallback_used"), false);

  const partialBundle = buildApprovedFeatureTrace(packet, {
    trainerFrameId: 611,
    selectedOpeningId: "not-a-matching-opening",
    selectedLineId: "not-a-matching-line",
    trainerPhase: "ready_for_user",
    isUserTurn: true,
    moveUci: "e2e4",
    moveSan: "e4",
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    playKeyBefore: packetPlayKeyBefore(packet),
    playKey: packetPlayKeyAtTarget(packet),
    trainerFrameResolution: buildTrainerFrameResolution({
      trainerFrameId: 611,
      trainerPhase: "ready_for_user",
      trainerView: "assisted",
      trainingMode: "restricted",
      isUserTurn: true,
      instructionTargetUci: packet.moveUci,
      instructionTargetSan: packet.moveSan,
      instructionTargetPieceType: "p",
      coachMoveUci: packet.moveUci,
      coachPieceType: "p",
      acceptedTargetUci: packet.moveUci,
      visibleTeachingSurface: {
        owner: "v28_visible_surface",
        mode: "assisted",
        coach: {
          shouldRender: true,
          title: packet.coachCard.title,
          body: packet.coachCard.body,
          buttons: [],
        },
        safety: { blocked: false },
      },
      displayedCoachDecision: {
        title: packet.coachCard.title,
        body: packet.coachCard.body,
        buttons: [],
        debug: { coachDecisionSource: "displayedCoachDecision", coachMoveUci: packet.moveUci, coachPieceType: "p" },
      },
      actualCoachCardTitle: packet.coachCard.title,
      actualCoachCardBody: packet.coachCard.body,
      actualCoachCardButtons: [],
      actualCoachCardSource: "surfaceCoachCardDecision",
      actualVisualSource: "fallback_current_surface",
      renderedVisualPrimitiveCount: 0,
      surfaceVisualPrimitiveCount: 0,
      stage2ApprovedPacketMatched: false,
      stage2ApprovedPacketKind: "none",
      stage2ApprovedPacketId: null,
      stage2ApprovedPacketSourceBundle: null,
      stage2ApprovedPacketSourceFile: null,
      stage2ApprovedPacketStatus: null,
      stage2ApprovedPacketApprovalReadiness: null,
      stage2ApprovedPacketMissReason: "approved_content_not_matched",
      stage2ApprovedPacketFallbackReason: "no_matching_candidate",
      stage2ApprovedPacketVisualSource: "fallback_current_surface",
      stage2CoachingSafetyStatus: "safe",
      stage2CoachingSurface: "assisted",
      stage2CoachingSourceFile: packet.sourceFile,
      stage2CoachingRuntimeMatched: false,
      coachQuality: { qualityScore: 90, qualityScoreSource: "final_rendered", lowQualityTriggered: false, lowQualityThreshold: 80, lowQualityBasedOn: "final_rendered" },
      visualRecipe: null,
      visualRecipeMoveUci: packet.moveUci,
      visualRecipeMoveSan: packet.moveSan,
      visualRecipeTargetMatchesInstructionTarget: true,
      presentationFrame: {
        visual: { shouldRender: false, source: "fallback_current_surface" },
        coach: { owner: "intent_first_coach" },
        legacy: {},
      },
      playKeyBefore: packetPlayKeyBefore(packet),
      playKey: packetPlayKeyAtTarget(packet),
      currentInstructionFrame: {
        kind: "guided_move",
        targetSource: "opening_tree",
      },
      currentInstructionFrameKind: "guided_move",
      instructionTargetSource: "opening_tree",
      showMoreShown: false,
      runtimeBookStatus: "ready",
      runtimeBookCandidateCount: 0,
      runtimeBookBookExhausted: true,
      stage2CoachingResolverEnabled: true,
      stage2ApprovedContentEnabled: true,
      stage2SafeFallbackEnabled: true,
      approvedContent: {
        matched: false,
        packetKind: "none",
        packetId: null,
        sourceBundle: null,
        sourceFile: null,
        packetStatus: null,
        approvalReadiness: null,
        missReason: "approved_content_not_matched",
        fallbackReason: "no_matching_candidate",
        visualSource: "fallback_current_surface",
      },
    }),
  });
  const partialTrace = partialBundle.featureTrace as any;
  assert.equal(partialTrace.traceStatus, "partial");
  assert.equal(partialTrace.missingReasons.includes("approved_content_not_matched"), true);
  assert.equal(partialTrace.missingReasons.includes("approved_content_disabled"), false);
}

testStage2FeatureConceptOpportunityTraceComplete();
console.log("stage2FeatureConceptOpportunityTraceComplete ok");
