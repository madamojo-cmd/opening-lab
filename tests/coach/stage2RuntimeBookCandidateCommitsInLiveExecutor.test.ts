import assert from "node:assert/strict";

import { Chess } from "chess.js";

import { resolveRestrictedOpponentReplyAuthority } from "../../lib/blundr/runtime/restrictedOpponentReplyAuthority";

export function testStage2RuntimeBookCandidateCommitsInLiveExecutor(): void {
  const game = new Chess();
  for (const san of ["e4", "e5", "Nf3", "Nc6", "Bc4"]) {
    const move = game.move(san);
    assert.ok(move, `legal_move_missing:${san}`);
  }

  const legalMoveUcis = (game.moves({ verbose: true }) as Array<{ from: string; to: string; promotion?: string }>)
    .map((move) => `${move.from}${move.to}${move.promotion ?? ""}`);

  const authority = resolveRestrictedOpponentReplyAuthority({
    trainingMode: "restricted",
    currentOpponentBookOptionCount: 0,
    legalMoveCount: legalMoveUcis.length,
    legalMoveUcis,
    runtimeBookMatchesFrame: true,
    runtimeBookStatus: "ready",
    runtimeBookBookExhausted: false,
    runtimeBookCandidateCount: 2,
    runtimeBookOpeningId: "italian-white",
    runtimeBookPlayKeyBefore: "e2e4,e7e5,g1f3,b8c6,f1c4",
    currentOpeningId: "italian-white",
    currentPlayKeyBefore: "e2e4,e7e5,g1f3,b8c6,f1c4",
    runtimeBookCandidates: [
      { uci: "f8c5", san: "Bc5", totalGames: 61569824, playPct: 0.33771 },
      { uci: "d7d6", san: "d6", totalGames: 1000, playPct: 0.01 },
    ],
    runtimeBookTopCandidate: { uci: "f8c5", san: "Bc5", totalGames: 61569824, playPct: 0.33771 },
  });

  assert.equal(authority.kind, "runtime_reply");
  assert.equal(authority.reason, "runtime_backed_opponent_reply_available");
  assert.equal(authority.opponentReplyAuthoritySource, "runtime_book_exact");
  assert.equal(authority.opponentReplyAuthorityCandidateUci, "f8c5");
  assert.equal(authority.opponentReplyAuthorityCandidateSan, "Bc5");
  assert.equal(authority.opponentReplyAuthorityCandidateGames, 61569824);
  assert.equal(authority.opponentReplyAuthorityCandidatePlayPct, 0.33771);
  assert.equal(authority.opponentReplyAuthorityRejectedReason, null);
}

testStage2RuntimeBookCandidateCommitsInLiveExecutor();
console.log("stage2RuntimeBookCandidateCommitsInLiveExecutor ok");
