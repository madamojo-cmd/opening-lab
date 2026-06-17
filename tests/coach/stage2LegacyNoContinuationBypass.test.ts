import assert from "node:assert/strict";

import { Chess } from "chess.js";

import { resolveEffectiveContinuationCandidate } from "../../lib/blundr/runtime/resolveEffectiveContinuationCandidate";

export function testStage2LegacyNoContinuationBypass(): void {
  const startFen = new Chess().fen();
  const blocked = resolveEffectiveContinuationCandidate({
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
  assert.equal(blocked.candidate, null);
  assert.equal(blocked.guard.blockedReason, "not_continuation_mode");

  const allowed = resolveEffectiveContinuationCandidate({
    trainingMode: "continuation",
    isUserTurn: true,
    trainerPhase: "ready_for_user",
    boardFen: startFen,
    boardFen4: startFen.split(" ").slice(0, 4).join(" "),
    legalMoveUcis: ["e2e4", "d2d4"],
    continuationResolvedTargetUci: "e2e4",
    continuationResolvedTargetSan: "e4",
    continuationResolvedTargetSource: "stage2-runtime-book",
    continuationResolvedTargetLabel: "book move",
  });
  assert.equal(allowed.candidate?.uci, "e2e4");
  assert.equal(allowed.guard.stockfishPromotionGuardSourceAllowed, true);
  assert.equal(allowed.guard.blockedReason, null);
}

testStage2LegacyNoContinuationBypass();
console.log("stage2LegacyNoContinuationBypass ok");

