import assert from "node:assert/strict";

import { Chess } from "chess.js";

import { buildTrainerDebugSnapshot } from "../../lib/blundr/debug/trainerDebugSnapshot";
import { resolveRestrictedOpponentReplyAuthority } from "../../lib/blundr/runtime/restrictedOpponentReplyAuthority";

export function testStage2ItalianWhiteUsesRuntimeBookBc5AfterBc4(): void {
  const game = new Chess();
  for (const san of ["e4", "e5", "Nf3", "Nc6", "Bc4"]) {
    const move = game.move(san);
    assert.ok(move, `legal_move_missing:${san}`);
  }

  const legalMoveUcis = (game.moves({ verbose: true }) as Array<{ from: string; to: string; promotion?: string; san: string }>).map((move) => `${move.from}${move.to}${move.promotion ?? ""}`);

  const authority = resolveRestrictedOpponentReplyAuthority({
    trainingMode: "restricted",
    currentOpponentBookOptionCount: 0,
    legalMoveCount: legalMoveUcis.length,
    legalMoveUcis,
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
      { uci: "d7d6", san: "d6", totalGames: 1000, playPct: 0.01 },
    ],
    runtimeBookTopCandidate: { uci: "f8c5", san: "Bc5", totalGames: 61569824, playPct: 0.33771 },
  });

  assert.equal(authority.kind, "runtime_reply");
  assert.equal(authority.reason, "runtime_backed_opponent_reply_available");
  assert.equal(authority.opponentReplyAuthoritySource, "runtime_book_exact");
  assert.equal(authority.opponentReplyAuthorityCandidateUci, "f8c5");
  assert.equal(authority.opponentReplyAuthorityCandidateGames, 61569824);
  assert.equal(authority.opponentReplyAuthorityCandidatePlayPct, 0.33771);
  assert.equal(authority.opponentReplyAuthorityRejectedReason, null);

  const snapshot = buildTrainerDebugSnapshot({
    debugEnabled: true,
    trainerFrameId: 9,
    trainerPhase: "opponent_replying",
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: false,
    fen: game.fen(),
    selectedOpeningId: "italian-white",
    selectedLineId: "italian-white",
    runtimeBookQueried: true,
    runtimeBookOpeningId: "italian-white",
    runtimeBookPlayKeyBefore: "e2e4,e7e5,g1f3,b8c6,f1c4",
    runtimeBookStatus: "ready",
    runtimeBookCandidateCount: 3,
    runtimeBookTopCandidateUci: "f8c5",
    runtimeBookTopCandidateSan: "Bc5",
    runtimeBookTopCandidateRank: 1,
    runtimeBookTopCandidateGames: 61569824,
    runtimeBookTopCandidatePlayPct: 0.33771,
    opponentReplyAuthoritySource: authority.opponentReplyAuthoritySource,
    opponentReplyAuthorityCandidateUci: authority.opponentReplyAuthorityCandidateUci,
    opponentReplyAuthorityCandidateSan: authority.opponentReplyAuthorityCandidateSan,
    opponentReplyAuthorityCandidateGames: authority.opponentReplyAuthorityCandidateGames,
    opponentReplyAuthorityCandidatePlayPct: authority.opponentReplyAuthorityCandidatePlayPct,
    opponentReplyAuthorityRejectedReason: authority.opponentReplyAuthorityRejectedReason,
    runtimeBookBookExhausted: false,
    runtimeBookFallbackUsed: false,
    runtimeBookFallbackAuthority: null,
    selectedOpeningRuntimeAvailable: true,
    selectedOpeningContentStatus: "fallback_only",
    runtimeDataSource: "local_crawled_package",
    liveLichessCalled: false,
    candidateSource: "local_runtime_package",
    openingAvailabilityStatus: "runtime_available",
    visibleTeachingSurface: {
      owner: "v28_visible_surface",
      mode: "opponent_replying",
      coach: { shouldRender: true, title: "Bc5 — Answer the bishop", body: "Reply with the active bishop.", buttons: [] },
      visual: { lines: [] },
      actions: [],
      safety: { blocked: false, criticalIssues: [] },
    },
    presentationFrame: { visual: { shouldRender: true, source: "visible_surface_v28" }, coach: { shouldRender: true, owner: "intent_first_coach", title: "Bc5 — Answer the bishop", body: "Reply with the active bishop.", buttons: [] }, legacy: {} },
    coachDecision: { shouldShowCoachCard: true, title: "Bc5 — Answer the bishop", body: "Reply with the active bishop.", buttons: [], debug: { coachDecisionSource: "live_coach", coachMoveUci: "f8c5", coachPieceType: "b", coachQuality: { qualityScore: 90, targetAligned: true, pieceAligned: true, containsDebugLeak: false } } },
    actualCoachCardTitle: "Bc5 — Answer the bishop",
    actualCoachCardBody: "Reply with the active bishop.",
    actualCoachCardButtons: [],
    actualCoachCardSource: "surfaceCoachCardDecision",
    actualVisualSource: "visible_surface_v28",
    visualRecipeMoveUci: "f8c5",
    visualRecipeTargetMatchesInstructionTarget: true,
    instructionTargetUci: "f8c5",
    instructionTargetSan: "Bc5",
    instructionTargetPieceType: "b",
    acceptedTargetUci: "f8c5",
    coachMoveUci: "f8c5",
    coachPieceType: "b",
    visualMoveUci: "f8c5",
    renderedActionIds: [],
    surfaceActionIds: [],
    renderedVisualPrimitiveCount: 0,
    surfaceVisualPrimitiveCount: 0,
    coachQuality: { qualityScore: 90, qualityScoreSource: "final_rendered", source: "final_rendered", targetAligned: true, pieceAligned: true, usedFallback: false, containsDebugLeak: false },
    eventLog: [],
  } as any);

  assert.equal((snapshot.continuation as any).opponentReplyAuthoritySource, "runtime_book_exact");
  assert.equal((snapshot.continuation as any).opponentReplyAuthorityCandidateUci, "f8c5");
  assert.equal((snapshot.continuation as any).opponentReplyAuthorityCandidateGames, 61569824);
  assert.equal((snapshot.continuation as any).opponentReplyAuthorityRejectedReason, null);
  assert.equal((snapshot.continuation as any).runtimeBookFallbackUsed, false);
}

testStage2ItalianWhiteUsesRuntimeBookBc5AfterBc4();
console.log("stage2ItalianWhiteUsesRuntimeBookBc5AfterBc4 ok");
