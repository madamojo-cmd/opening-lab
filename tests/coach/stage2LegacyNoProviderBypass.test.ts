import assert from "node:assert/strict";

import { Chess } from "chess.js";

import { buildMaiaOpponentReplyDecision } from "../../lib/blundr/maia/maiaOpponentProvider";
import { resolveEffectiveContinuationCandidate } from "../../lib/blundr/runtime/resolveEffectiveContinuationCandidate";

export function testStage2LegacyNoProviderBypass(): void {
  const blocked = buildMaiaOpponentReplyDecision({
    trainingMode: "continuation",
    userExplicitlyEnteredContinuation: false,
    sideToMove: "w",
    opponentColor: "b",
    branchCompleteActive: false,
    terminalPosition: false,
    legalMovesCount: 1,
    providerStatus: "ready",
  });
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.selectedMoveSource, "none");

  const fallback = buildMaiaOpponentReplyDecision({
    trainingMode: "continuation",
    userExplicitlyEnteredContinuation: true,
    sideToMove: "b",
    opponentColor: "b",
    branchCompleteActive: false,
    terminalPosition: false,
    legalMovesCount: 1,
    providerStatus: "unavailable",
    fallbackRequested: true,
  });
  assert.equal(fallback.allowed, false);
  assert.equal(fallback.selectedMoveSource, "fallback");

  const startFen = new Chess().fen();
  const continuationBlocked = resolveEffectiveContinuationCandidate({
    trainingMode: "restricted",
    isUserTurn: true,
    trainerPhase: "ready_for_user",
    boardFen: startFen,
    boardFen4: startFen.split(" ").slice(0, 4).join(" "),
    legalMoveUcis: ["e2e4"],
    continuationResolvedTargetUci: "e2e4",
    continuationResolvedTargetSan: "e4",
    continuationResolvedTargetSource: "stage2-runtime-book",
    continuationResolvedTargetLabel: "book move",
  });
  assert.equal(continuationBlocked.candidate, null);
  assert.equal(continuationBlocked.guard.blockedReason, "not_continuation_mode");
}

testStage2LegacyNoProviderBypass();
console.log("stage2LegacyNoProviderBypass ok");
