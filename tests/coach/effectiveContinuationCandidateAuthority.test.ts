import assert from "node:assert/strict";

import { resolveEffectiveContinuationCandidate } from "../../lib/blundr/runtime/resolveEffectiveContinuationCandidate";

export function testEffectiveContinuationCandidateAuthority(): void {
  const withLock = resolveEffectiveContinuationCandidate({
    trainingMode: "continuation",
    trainerPhase: "ready_for_user",
    isUserTurn: true,
    boardFen: "r2q1rk1/bpp2ppp/p1np1n2/4p3/4P1b1/1BPP1N2/PP1N1PPP/R1BQR1K1 w - - 0 10",
    boardFen4: "r2q1rk1/bpp2ppp/p1np1n2/4p3/4P1b1/1BPP1N2/PP1N1PPP/R1BQR1K1 w - -",
    legalMoveUcis: ["h2h3", "a2a3", "d1e2"],
    lockedCandidate: {
      uci: "a2a3",
      san: "a3",
      source: "continuation_policy",
      label: "Locked",
    },
    continuationResolvedTargetUci: "h2h3",
    continuationResolvedTargetSan: "h3",
    continuationResolvedTargetSource: "stockfish_top_move",
    continuationResolvedTargetLabel: "Best",
    continuationResolvedTargetFen4: "r2q1rk1/bpp2ppp/p1np1n2/4p3/4P1b1/1BPP1N2/PP1N1PPP/R1BQR1K1 w - -",
  });

  assert.equal(withLock.candidate?.uci, "a2a3");
  assert.equal(withLock.candidate?.reason, "locked_candidate");
}

testEffectiveContinuationCandidateAuthority();
console.log("effectiveContinuationCandidateAuthority ok");
