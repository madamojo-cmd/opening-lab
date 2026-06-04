import assert from "node:assert/strict";

import { resolveEffectiveContinuationCandidate } from "../../lib/blundr/runtime/resolveEffectiveContinuationCandidate";
import { buildCurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";
import { buildLiveVisibleTeachingSurface } from "../../lib/blundr/presentation/buildLiveVisibleTeachingSurface";
import { adaptVisibleSurfaceToCoachUi } from "../../lib/blundr/presentation/uiSurfaceAdapter";
import { resolveContinuationFlowContract } from "../../lib/blundr/runtime/continuationFlowContract";
import { buildTrainerDebugSnapshot } from "../../lib/blundr/debug/trainerDebugSnapshot";

export function testStockfishReadyNoSafetyBlocked(): void {
  const fen = "r2q1rk1/bpp2ppp/p1np1n2/4p3/4P1b1/1BPP1N2/PP1N1PPP/R1BQR1K1 w - - 0 10";
  const resolved = resolveEffectiveContinuationCandidate({
    trainingMode: "continuation",
    trainerPhase: "ready_for_user",
    isUserTurn: true,
    boardFen: fen,
    boardFen4: "r2q1rk1/bpp2ppp/p1np1n2/4p3/4P1b1/1BPP1N2/PP1N1PPP/R1BQR1K1 w - -",
    legalMoveUcis: ["h2h3", "a2a3", "d1e2"],
    lockedCandidate: null,
    continuationResolvedTargetUci: "h2h3",
    continuationResolvedTargetSan: "h3",
    continuationResolvedTargetSource: "stockfish_top_move",
    continuationResolvedTargetLabel: "Best",
    continuationResolvedTargetFen4: "r2q1rk1/bpp2ppp/p1np1n2/4p3/4P1b1/1BPP1N2/PP1N1PPP/R1BQR1K1 w - -",
  });

  assert.equal(resolved.candidate?.uci, "h2h3");

  const frame = buildCurrentInstructionFrame({
    frameId: 101,
    fen,
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

  const instructionTargetUci = frame.target?.uci ?? null;
  const selectedCandidateUci = frame.target?.uci ?? null;
  const visualMoveUci = frame.target?.uci ?? null;

  assert.equal(instructionTargetUci, "h2h3");
  assert.equal(selectedCandidateUci, "h2h3");
  assert.equal(visualMoveUci, "h2h3");

  const surface = buildLiveVisibleTeachingSurface({
    frame,
    requestedMode: "assisted",
    showMoreRevealed: false,
  });
  const ui = adaptVisibleSurfaceToCoachUi(surface);
  assert.notEqual(ui.title, "Safety Blocked");

  const flow = resolveContinuationFlowContract({
    trainingMode: "continuation",
    branchComplete: false,
    isUserTurn: true,
    hasTarget: true,
    selectedCandidateUci: "h2h3",
    selectedCandidateSan: "h3",
    selectedCandidateSource: "stockfish_top_move",
    pendingOpponentRequestExists: false,
    candidateAnalysisStatus: "ready",
    continuationRuntimeStatus: "ready",
    terminalReason: null,
  });
  assert.equal(flow.state, "continuation_candidate_ready");

  const snapshot = buildTrainerDebugSnapshot({
    trainingMode: "continuation",
    trainerPhase: "ready_for_user",
    isUserTurn: true,
    fen,
    selectedCandidateUci: "h2h3",
    selectedCandidateSan: "h3",
    continuationTargetResolverStatus: "stockfish_ready",
    continuationResolvedTargetUci: "h2h3",
    effectiveContinuationCandidateUci: "h2h3",
    visibleTeachingSurface: { mode: "continuation_candidate", owner: "v28_visible_surface", coach: { title: "Continue", body: "Play h3" }, actions: [] },
    presentationFrame: { coach: { shouldRender: false }, visual: { shouldRender: true } },
  });
  const criticalIssues = snapshot.health.criticalIssues;
  assert.equal(criticalIssues.includes("stockfish_ready_without_promoted_candidate"), false);
}

testStockfishReadyNoSafetyBlocked();
