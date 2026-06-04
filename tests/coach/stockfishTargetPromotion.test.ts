import assert from "node:assert/strict";

import { resolveEffectiveContinuationCandidate } from "../../lib/blundr/runtime/resolveEffectiveContinuationCandidate";

export function testStockfishTargetPromotion(): void {
  const fen = "r2q1rk1/bpp2ppp/p1np1n2/4p3/4P1b1/1BPP1N2/PP1N1PPP/R1BQR1K1 w - - 0 10";
  const result = resolveEffectiveContinuationCandidate({
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

  assert.equal(result.candidate?.uci, "h2h3");
  assert.equal(result.guard.effectiveContinuationCandidateUci, "h2h3");
  assert.equal(result.guard.blockedReason, null);
  assert.equal(result.guard.stockfishPromotionGuardSourceAllowed, true);
  assert.equal(result.guard.stockfishPromotionGuardLegal, true);
  assert.equal(result.guard.stockfishPromotionGuardFenMatches, true);
}

testStockfishTargetPromotion();
