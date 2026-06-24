import assert from "node:assert/strict";

import { Chess } from "chess.js";

import { resolveRestrictedOpponentReplyAuthority } from "../../lib/blundr/runtime/restrictedOpponentReplyAuthority";

export function testStage2ItalianWhiteDoesNotUseArbitraryRb8Fallback(): void {
  const game = new Chess();
  for (const san of ["e4", "e5", "Nf3", "Nc6", "Bc4"]) {
    const move = game.move(san);
    assert.ok(move, `legal_move_missing:${san}`);
  }

  const legalMoves = game.moves({ verbose: true }) as Array<{ from: string; to: string; san: string }>;
  assert.equal(game.turn(), "b");
  assert.equal(legalMoves.length > 0, true);
  assert.equal(legalMoves.some((move) => move.from === "a8" && move.to === "b8"), true, "rb8_legal_move_missing");

  const blockedAuthority = resolveRestrictedOpponentReplyAuthority({
    trainingMode: "restricted",
    currentOpponentBookOptionCount: 0,
    legalMoveCount: legalMoves.length,
    legalMoveUcis: legalMoves.map((move) => `${move.from}${move.to}`),
    runtimeBookMatchesFrame: true,
    runtimeBookStatus: "ready",
    runtimeBookBookExhausted: false,
    runtimeBookCandidateCount: 0,
    runtimeBookOpeningId: "italian-white",
    runtimeBookPlayKeyBefore: "e2e4,e7e5,g1f3,b8c6,f1c4",
    currentOpeningId: "italian-white",
    currentPlayKeyBefore: "e2e4,e7e5,g1f3,b8c6,f1c4",
    runtimeBookCandidates: [],
    runtimeBookTopCandidate: null,
  });

  assert.equal(blockedAuthority.kind, "blocked");
  assert.equal(blockedAuthority.reason, "no_runtime_backed_opponent_reply_available");
  assert.equal(blockedAuthority.blockedReason, "missing_runtime_backed_opponent_reply");

  const runtimeBookAuthority = resolveRestrictedOpponentReplyAuthority({
    trainingMode: "restricted",
    currentOpponentBookOptionCount: 0,
    legalMoveCount: legalMoves.length,
    legalMoveUcis: legalMoves.map((move) => `${move.from}${move.to}`),
    runtimeBookMatchesFrame: true,
    runtimeBookStatus: "ready",
    runtimeBookBookExhausted: false,
    runtimeBookCandidateCount: 3,
    runtimeBookOpeningId: "italian-white",
    runtimeBookPlayKeyBefore: "e2e4,e7e5,g1f3,b8c6,f1c4",
    currentOpeningId: "italian-white",
    currentPlayKeyBefore: "e2e4,e7e5,g1f3,b8c6,f1c4",
    runtimeBookCandidates: [
      { uci: "f8c5", san: "Bc5", totalGames: 61569824, playPct: 0.33771 },
      { uci: "a8b8", san: "Rb8", totalGames: 1, playPct: 0.00001 },
    ],
    runtimeBookTopCandidate: { uci: "f8c5", san: "Bc5", totalGames: 61569824, playPct: 0.33771 },
  });

  assert.equal(runtimeBookAuthority.kind, "runtime_reply");
  assert.equal(runtimeBookAuthority.reason, "runtime_backed_opponent_reply_available");
  assert.equal(runtimeBookAuthority.opponentReplyAuthoritySource, "runtime_book_exact");
  assert.equal(runtimeBookAuthority.opponentReplyAuthorityCandidateUci, "f8c5");
  assert.notEqual(runtimeBookAuthority.opponentReplyAuthorityCandidateUci, "a8b8");
  assert.equal(runtimeBookAuthority.opponentReplyAuthorityRejectedReason, null);
}

testStage2ItalianWhiteDoesNotUseArbitraryRb8Fallback();
console.log("stage2ItalianWhiteDoesNotUseArbitraryRb8Fallback ok");
