import assert from "node:assert/strict";

import { resolveRestrictedOpponentReplyAuthority } from "../../lib/blundr/runtime/restrictedOpponentReplyAuthority";

export function testStage2RuntimeGraphFollowsDriftedOpponentReply(): void {
  const authority = resolveRestrictedOpponentReplyAuthority({
    trainingMode: "restricted",
    currentOpponentBookOptionCount: 0,
    legalMoveCount: 2,
    legalMoveUcis: ["e7e5", "d7d5"],
    runtimeBookMatchesFrame: false,
    runtimeBookStatus: "ready",
    runtimeBookBookExhausted: false,
    runtimeBookCandidateCount: 2,
    runtimeBookOpeningId: "italian-white",
    runtimeBookPlayKeyBefore: "e2e4,e7e5,g1f3,b8c6,f1c4,g8f6",
    currentOpeningId: "italian-white",
    currentPlayKeyBefore: "e2e4,e7e5,g1f3,b8c6,f1c4,g8f6,f3g5",
    runtimeBookCandidates: [
      { uci: "e7e5", san: "e5", totalGames: 100, playPct: 0.7, rank: 1 },
      { uci: "d7d5", san: "d5", totalGames: 80, playPct: 0.3, rank: 2 },
    ],
    runtimeBookTopCandidate: { uci: "e7e5", san: "e5", totalGames: 100, playPct: 0.7, rank: 1 },
  });

  assert.equal(authority.kind, "runtime_reply");
  assert.equal(authority.opponentReplyAuthoritySource, "runtime_book_transposition");
  assert.equal(authority.opponentReplyAuthorityCandidateUci, "e7e5");
  assert.equal(authority.opponentReplyAuthorityRejectedReason, null);
}

testStage2RuntimeGraphFollowsDriftedOpponentReply();
console.log("stage2RuntimeGraphFollowsDriftedOpponentReply ok");
