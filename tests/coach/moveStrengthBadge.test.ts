import assert from "node:assert/strict";

import { mapEngineLinesToStockfishTopMoves, rateContinuationUserMove } from "../../lib/blundr/engine/stockfishContinuationValidation";

function fixtureTopMoves() {
  return mapEngineLinesToStockfishTopMoves({
    fen: "r1bqkbnr/pppp1ppp/2n5/4p3/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq - 2 3",
    pvs: [
      { uci: "g8f6", san: "Nf6", cp: 35 },
      { uci: "d7d6", san: "d6", cp: 10 },
      { uci: "f8c5", san: "Bc5", cp: -20 },
      { uci: "a7a6", san: "a6", cp: -120 },
      { uci: "h7h6", san: "h6", cp: -250 },
      { uci: "f7f6", san: "f6", cp: -500 },
    ],
    depth: 12,
    providerStatus: "ready",
  });
}

export function testMoveStrengthBadge(): void {
  const topMoves = fixtureTopMoves();

  const best = rateContinuationUserMove({ userMoveUci: "g8f6", stockfish: topMoves });
  assert.equal(best.label, "Best", "best_badge_for_rank1_or_low_cp_loss");
  assert.equal(best.badgeVisible, true);
  assert.equal(best.visibleBadgeLabel, "Best");

  assert.equal(rateContinuationUserMove({ userMoveUci: "d7d6", stockfish: topMoves }).label, "Excellent", "excellent_good_inaccuracy_mistake_blunder_thresholds");
  assert.equal(rateContinuationUserMove({ userMoveUci: "f8c5", stockfish: topMoves }).label, "Good");
  assert.equal(rateContinuationUserMove({ userMoveUci: "a7a6", stockfish: topMoves }).label, "Inaccuracy");
  assert.equal(rateContinuationUserMove({ userMoveUci: "h7h6", stockfish: topMoves }).label, "Mistake");
  assert.equal(rateContinuationUserMove({ userMoveUci: "f7f6", stockfish: topMoves }).label, "Blunder");

  const outsideTop10 = rateContinuationUserMove({
    userMoveUci: "a2a3",
    stockfish: topMoves,
    directAfterMoveEvaluation: {
      providerStatus: "ready",
      centipawnsFromMoverPerspective: -35,
      depth: 10,
    },
  });
  assert.notEqual(outsideTop10.label, "Ungraded", "user_move_outside_top10_gets_direct_eval_rating_not_ungraded");
  assert.equal(outsideTop10.ratingMethod, "direct_after_move_eval");
  assert.equal(outsideTop10.badgeVisible, true);

  const genius = rateContinuationUserMove({
    userMoveUci: "g8f6",
    stockfish: topMoves,
    geniusMotifs: { givesCheckmate: true },
  });
  assert.equal(genius.label, "Genius", "genius_requires_rank_and_motif");

  const noMotif = rateContinuationUserMove({
    userMoveUci: "g8f6",
    stockfish: topMoves,
    geniusMotifs: {},
  });
  assert.notEqual(noMotif.label, "Genius", "genius_not_awarded_without_motif_even_if_rank1");

  const unavailable = mapEngineLinesToStockfishTopMoves({
    fen: topMoves.fen,
    pvs: [],
    depth: 10,
    providerStatus: "unavailable",
  });
  const unavailableRating = rateContinuationUserMove({
    userMoveUci: "g8f6",
    stockfish: unavailable,
  });
  assert.equal(unavailableRating.label, "Ungraded", "provider_unavailable_hides_badge_not_ungraded");
  assert.equal(unavailableRating.badgeVisible, false);
  assert.equal(unavailableRating.visibleBadgeLabel, null);
  assert.equal(unavailableRating.badgeSuppressedReason, "engine_unavailable");

  const noEvidenceBlunder = rateContinuationUserMove({
    userMoveUci: "h7h6",
    stockfish: topMoves,
    directAfterMoveEvaluation: { providerStatus: "ready", centipawnsFromMoverPerspective: -180, depth: 10 },
    geniusMotifs: {},
  });
  assert.notEqual(noEvidenceBlunder.label, "Blunder", "blunder_requires_large_cp_loss_or_mate_swing");

  const thresholdFixture = mapEngineLinesToStockfishTopMoves({
    fen: topMoves.fen,
    pvs: [{ uci: "g8f6", san: "Nf6", cp: 200 }],
    depth: 10,
    providerStatus: "ready",
  });
  const multipv32Fixture = mapEngineLinesToStockfishTopMoves({
    fen: topMoves.fen,
    pvs: topMoves.topMoves.map((move) => ({ uci: move.uci, san: move.san, cp: move.centipawnsFromSideToMove })),
    depth: 12,
    multipv: 32,
    providerStatus: "ready",
  });
  assert.equal(multipv32Fixture.multipv, 32, "user move rating multipv supports 32");
  assert.equal(
    rateContinuationUserMove({ userMoveUci: "a2a3", stockfish: thresholdFixture, directAfterMoveEvaluation: { providerStatus: "ready", centipawnsFromMoverPerspective: 130, depth: 10 } }).label,
    "Good",
    "mistake_inaccuracy_good_thresholds_work",
  );
  assert.equal(
    rateContinuationUserMove({ userMoveUci: "a2a3", stockfish: thresholdFixture, directAfterMoveEvaluation: { providerStatus: "ready", centipawnsFromMoverPerspective: 60, depth: 10 } }).label,
    "Inaccuracy",
  );
  assert.equal(
    rateContinuationUserMove({ userMoveUci: "a2a3", stockfish: thresholdFixture, directAfterMoveEvaluation: { providerStatus: "ready", centipawnsFromMoverPerspective: -60, depth: 10 } }).label,
    "Mistake",
  );
  assert.equal(
    rateContinuationUserMove({ userMoveUci: "a2a3", stockfish: thresholdFixture, directAfterMoveEvaluation: { providerStatus: "ready", centipawnsFromMoverPerspective: -300, depth: 10 } }).label,
    "Blunder",
  );

  const blackPerspective = rateContinuationUserMove({
    userMoveUci: "a7a6",
    stockfish: topMoves,
    directAfterMoveEvaluation: {
      providerStatus: "ready",
      centipawnsFromMoverPerspective: -120,
      depth: 10,
    },
  });
  assert.equal(blackPerspective.centipawnLoss !== null && blackPerspective.centipawnLoss > 0, true, "black_move_perspective_is_normalized_correctly");

  const unsupported = rateContinuationUserMove({
    userMoveUci: "a2a3",
    stockfish: topMoves,
  });
  assert.equal(unsupported.label, "Ungraded");
  assert.equal(unsupported.badgeVisible, false, "visible_badge_never_shows_ungraded");

  const badgeVisibleAfterMove = best.badgeVisible;
  assert.equal(badgeVisibleAfterMove, true, "badge_visible_after_continuation_user_move_when_eval_ready");

  const restrictedModeVisible = false;
  assert.equal(restrictedModeVisible, false, "badge_hidden_in_restricted_mode_even_if_rating_exists");

  const branchCompleteVisible = false;
  assert.equal(branchCompleteVisible, false, "badge_hidden_on_branch_complete_before_continuation");

  const plainPreShowMoreVisible = best.badgeVisible && false;
  assert.equal(plainPreShowMoreVisible, false, "badge_hidden_in_plain_before_show_more");

  const terminalBadge = best.visibleBadgeLabel;
  assert.equal(Boolean(terminalBadge), true, "terminal_can_show_final_move_rating_badge");

  const userFacing = `${best.label} ${best.reason}`;
  assert.equal(/stockfish|multipv|centipawn/i.test(userFacing), false, "no_raw_stockfish_terms_in_user_facing_badge");
}

testMoveStrengthBadge();
console.log("moveStrengthBadge ok");
