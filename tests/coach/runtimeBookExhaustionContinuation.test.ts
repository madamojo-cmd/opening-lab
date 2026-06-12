import assert from "node:assert/strict";

import { buildStage2RuntimeBookIndex, getStage2RuntimeCandidatesForFrame, loadStage2RuntimeBook } from "../../lib/blundr/runtimeBook";
import { resolveEffectiveContinuationCandidate } from "../../lib/blundr/runtime/resolveEffectiveContinuationCandidate";

async function testRuntimeBookExhaustionContinuation(): Promise<void> {
  const loaded = await loadStage2RuntimeBook();
  const index = buildStage2RuntimeBookIndex(loaded);

  const exhausted = getStage2RuntimeCandidatesForFrame({
    index,
    openingId: "italian-white",
    playKeyBefore: "a2a3,b7b6,h2h3",
  });
  assert.equal(exhausted.candidates.length, 0, "runtime_candidates_must_be_empty_when_book_exhausted");
  assert.equal(exhausted.hasRuntimeBookCandidates, false);
  assert.equal(exhausted.bookExhausted, true);

  const fallback = resolveEffectiveContinuationCandidate({
    trainingMode: "continuation",
    trainerPhase: "ready_for_user",
    isUserTurn: true,
    boardFen: "r2q1rk1/bpp2ppp/p1np1n2/4p3/4P1b1/1BPP1N2/PP1N1PPP/R1BQR1K1 w - - 0 10",
    boardFen4: "r2q1rk1/bpp2ppp/p1np1n2/4p3/4P1b1/1BPP1N2/PP1N1PPP/R1BQR1K1 w - -",
    legalMoveUcis: ["h2h3", "a2a3", "d1e2"],
    lockedCandidate: null,
    continuationResolvedTargetUci: "h2h3",
    continuationResolvedTargetSan: "h3",
    continuationResolvedTargetSource: "stockfish_top_move",
    continuationResolvedTargetLabel: "Best",
    continuationResolvedTargetFen4: "r2q1rk1/bpp2ppp/p1np1n2/4p3/4P1b1/1BPP1N2/PP1N1PPP/R1BQR1K1 w - -",
  });
  assert.equal(fallback.candidate?.uci, "h2h3");
  assert.equal(fallback.candidate?.source, "stockfish_top_move");
  assert.equal(fallback.guard.blockedReason, null);
}

testRuntimeBookExhaustionContinuation()
  .then(() => {
    console.log("runtimeBookExhaustionContinuation ok");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
