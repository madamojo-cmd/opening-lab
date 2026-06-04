import assert from "node:assert/strict";

import { applyMaiaMoveOnRequestFen } from "../../lib/blundr/maia/maiaLegalityRequestFenContract";
import { resolveEffectiveContinuationCandidate } from "../../lib/blundr/runtime/resolveEffectiveContinuationCandidate";
import { buildCurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";
import { resolveContinuationFlowContract } from "../../lib/blundr/runtime/continuationFlowContract";
import { buildLiveVisibleTeachingSurface } from "../../lib/blundr/presentation/buildLiveVisibleTeachingSurface";
import { adaptVisibleSurfaceToCoachUi } from "../../lib/blundr/presentation/uiSurfaceAdapter";
import { buildTrainerDebugSnapshot } from "../../lib/blundr/debug/trainerDebugSnapshot";

export function testMaiaThenStockfishContinuationPromotion(): void {
  const maiaRequestFen = "r1bqr1k1/bpp2ppp/p1np1n2/4p3/4P3/1BPP1N1P/PP1N1PP1/R1BQR1K1 b - - 0 11";
  const maiaApplied = applyMaiaMoveOnRequestFen({
    requestFen: maiaRequestFen,
    selectedUci: "c8e6",
    legalMovesUci: ["c8e6", "a7a6", "d6d5"],
  });

  assert.equal(maiaApplied.applied, true);

  const boardFen = String(maiaApplied.appliedFen);
  const boardFen4 = "r2qr1k1/bpp2ppp/p1npbn2/4p3/4P3/1BPP1N1P/PP1N1PP1/R1BQR1K1 w - -";

  const resolved = resolveEffectiveContinuationCandidate({
    trainingMode: "continuation",
    isUserTurn: true,
    trainerPhase: "ready_for_user",
    boardFen,
    boardFen4,
    legalMoveUcis: ["a2a4", "g2g4", "d2c4"],
    lockedCandidate: null,
    continuationResolvedTargetUci: "a2a4",
    continuationResolvedTargetSan: "a4",
    continuationResolvedTargetSource: "stockfish_top_move",
    continuationResolvedTargetLabel: "Best",
    continuationResolvedTargetFen4: boardFen4,
  });

  assert.equal(resolved.guard.effectiveContinuationCandidateBlockedReason, null);
  assert.equal(resolved.candidate?.uci, "a2a4");

  const flow = resolveContinuationFlowContract({
    trainingMode: "continuation",
    branchComplete: false,
    isUserTurn: true,
    hasTarget: true,
    selectedCandidateUci: resolved.candidate?.uci ?? null,
    selectedCandidateSan: resolved.candidate?.san ?? null,
    selectedCandidateSource: resolved.candidate?.source ?? null,
    pendingOpponentRequestExists: false,
    candidateAnalysisStatus: "ready",
    continuationRuntimeStatus: "ready",
    terminalReason: null,
  });

  assert.equal(flow.state, "continuation_candidate_ready");

  const frame = buildCurrentInstructionFrame({
    frameId: 33,
    fen: boardFen,
    trainingMode: "continuation",
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    isUserTurn: true,
    guidedMove: null,
    continuationCandidate: {
      uci: resolved.candidate?.uci,
      san: resolved.candidate?.san,
      source: resolved.candidate?.source,
      kind: "continuation_candidate",
      trust: "continuation_verified",
    },
    preferredTargetKind: "continuation_candidate",
  });

  assert.equal(frame.target?.uci, "a2a4");

  const surface = buildLiveVisibleTeachingSurface({
    frame,
    requestedMode: "assisted",
    showMoreRevealed: false,
  });
  const ui = adaptVisibleSurfaceToCoachUi(surface);

  const instructionTargetUci = frame.target?.uci ?? null;
  const visualMoveUci = frame.target?.uci ?? null;

  assert.equal(instructionTargetUci, "a2a4");
  assert.equal(visualMoveUci, "a2a4");
  assert.notEqual(ui.title, "Status");
  assert.notEqual(ui.title, "Finding a continuation");

  const snapshot = buildTrainerDebugSnapshot({
    trainingMode: "continuation",
    trainerPhase: "ready_for_user",
    isUserTurn: true,
    fen: boardFen,
    continuationTargetResolverStatus: "stockfish_ready",
    enginePreview: { pvs: [{ uci: "a2a4", san: "a4", cp: 15 }] },
    effectiveContinuationCandidateUci: "a2a4",
    effectiveContinuationCandidateBlockedReason: null,
    stockfishPromotionGuardLegal: true,
    stockfishPromotionGuardFenMatches: true,
    stockfishPromotionGuardSourceAllowed: true,
    instructionTargetUci,
    visualMoveUci,
    currentSelectedCandidateUci: "a2a4",
    selectedCandidateUci: "a2a4",
    continuationAnalysisStatus: "ready",
    continuationRuntimeStatus: "ready",
    visibleTeachingSurface: {
      mode: "assisted",
      owner: "v28_visible_surface",
      targetUci: "a2a4",
      coach: { title: ui.title, body: ui.body },
      actions: ui.actions.map((action) => action.kind),
    },
    presentationFrame: { coach: { shouldRender: true, title: ui.title, body: ui.body }, visual: { shouldRender: true } },
  });

  assert.equal(snapshot.health.warnings.includes("continuation_ready_without_candidate_transitioning"), false);
}

testMaiaThenStockfishContinuationPromotion();
