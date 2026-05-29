import assert from "node:assert/strict";

import { buildTrainingContext } from "../trainingContextEngine";

export function testTrainingContextEngine(): void {
  const italianCastleFen = "r1bqk2r/ppp2ppp/2np1n2/2b1p3/2B1P3/2PP1N2/PP3PPP/RNBQK2R w KQkq - 0 6";
  const castle = buildTrainingContext({
    fenBefore: italianCastleFen,
    expectedMoveUci: "e1g1",
    expectedMoveSan: "O-O",
    moveQuality: {
      status: "verified_top2",
      topMoves: [
        { rank: 1, uci: "a2a4", san: "a4", scoreCp: 21 },
        { rank: 2, uci: "e1g1", san: "O-O", scoreCp: 20 },
      ],
    },
    bookSupport: { hasBookSupport: true, confidence: 0.83, reason: "in_book" },
    repertoireSupport: true,
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: true,
    showAnswer: false,
  });

  assert.equal(castle.mode, "move_teaching");
  assert.equal(["engine_verified", "book_supported"].includes(castle.moveTrust), true);
  assert.equal(castle.cue.conceptId, "castle_for_safety");
  assert.equal(castle.cue.userFacing.title, "Castle for safety");
  assert.equal(castle.cue.userFacing.snippet, "The king moves to safety before the center opens.");
  assert.equal(castle.nextPlay.allowed, true);
  assert.equal(castle.nextPlay.san, "O-O");
  assert.equal(castle.permission.canRecommendMove, true);
  assert.equal(castle.permission.canShowAnswerOverlays, true);
  assert.equal(castle.visualDecision.visualLines.length >= 1, true);
  assert.equal(castle.visualDecision.visualLines.some((line) => line.from === "e1" && line.to === "g1"), true);
  assert.equal(castle.cue.answerVisualsShown, true);
  assert.equal(castle.selectedStory?.conceptId === "strong_alternative", false);

  const italianBc4Fen = "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3";
  const bc4 = buildTrainingContext({
    fenBefore: italianBc4Fen,
    expectedMoveUci: "f1c4",
    expectedMoveSan: "Bc4",
    moveQuality: {
      status: "book_supported",
      topMoves: [{ rank: 1, uci: "f1c4", san: "Bc4", scoreCp: 35 }],
    },
    bookSupport: { hasBookSupport: true, confidence: 0.88, reason: "in_book" },
    repertoireSupport: true,
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: true,
    showAnswer: false,
  });

  assert.equal(bc4.mode, "move_teaching");
  assert.equal(bc4.visualDecision.visualLines.length >= 1, true);
  assert.equal(bc4.selectedStory?.conceptId === "strong_alternative", false);

  const italianC3Fen = "r1bqk2r/ppp2ppp/2np1n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 6";
  const c3 = buildTrainingContext({
    fenBefore: italianC3Fen,
    expectedMoveUci: "c2c3",
    expectedMoveSan: "c3",
    moveQuality: {
      status: "rejected",
      reason: "Expected training move did not match Stockfish's top two moves.",
      topMoves: [
        { rank: 1, uci: "b1c3", san: "Nc3", scoreCp: 22 },
        { rank: 2, uci: "e1g1", san: "O-O", scoreCp: 18 },
      ],
    },
    bookSupport: { hasBookSupport: false, confidence: 0.2, reason: "not_in_book" },
    repertoireSupport: true,
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: true,
    showAnswer: false,
  });
  assert.equal(["repertoire_supported", "engine_close"].includes(c3.moveTrust), true);
  assert.equal(c3.mode, "move_teaching");
  assert.equal(c3.nextPlay.allowed, true);
  assert.equal(c3.visualDecision.visualLines.length >= 1, true);
  assert.equal(c3.cue.conceptId === "center_tension" || c3.cue.conceptId === "pawn_break", true);
  assert.notEqual(c3.mode, "assisted_context");

  const badMove = buildTrainingContext({
    fenBefore: italianC3Fen,
    expectedMoveUci: "d3d4",
    expectedMoveSan: "d4",
    moveQuality: {
      status: "rejected",
      reason: "Expected training move did not match Stockfish's top two moves.",
      bestMoveCp: 60,
      expectedMoveCp: -180,
      deltaCp: 240,
      topMoves: [
        { rank: 1, uci: "e1g1", san: "O-O", scoreCp: 60 },
        { rank: 2, uci: "b1c3", san: "Nc3", scoreCp: 42 },
      ],
    },
    bookSupport: { hasBookSupport: false, confidence: 0.1 },
    repertoireSupport: false,
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: true,
    showAnswer: false,
  });
  assert.equal(badMove.moveTrust, "untrusted");
  assert.equal(badMove.mode === "assisted_context" || badMove.mode === "line_needs_review", true);
  assert.equal(badMove.visualDecision.visualLines.length, 0);

  const revealOnly = buildTrainingContext({
    fenBefore: italianC3Fen,
    expectedMoveUci: "c2c3",
    expectedMoveSan: "c3",
    moveQuality: {
      status: "rejected",
      reason: "Expected training move did not match Stockfish's top two moves.",
      topMoves: [
        { rank: 1, uci: "b1c3", san: "Nc3", scoreCp: 22 },
        { rank: 2, uci: "e1g1", san: "O-O", scoreCp: 18 },
      ],
    },
    bookSupport: { hasBookSupport: false, confidence: 0.3, reason: "not_in_book" },
    repertoireSupport: false,
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: true,
    showAnswer: true,
  });
  assert.equal(revealOnly.visualDecision.visualLines.length >= 1, true);
  assert.equal(revealOnly.visualDecision.visualLines.some((line) => line.from === "c2" && line.to === "c3"), true);
  assert.equal(revealOnly.moveTrust, "reveal_only_unverified");
  assert.equal(revealOnly.userLabel, "Study-line move");
  assert.equal(revealOnly.cue.userFacing.badge === "Blundr Brain Validated", false);

  const re1Fen = "r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2PP1N2/PP3PPP/RNBQ1RK1 w - - 2 8";
  const re1 = buildTrainingContext({
    fenBefore: re1Fen,
    expectedMoveUci: "f1e1",
    expectedMoveSan: "Re1",
    moveQuality: {
      status: "rejected",
      reason: "Expected training move did not match Stockfish's top two moves.",
      topMoves: [
        { rank: 1, uci: "c1g5", san: "Bg5", scoreCp: 35 },
        { rank: 2, uci: "b1d2", san: "Nbd2", scoreCp: 31 },
      ],
    },
    bookSupport: { hasBookSupport: false, confidence: 0.2, reason: "not_in_top_two_but_in_line" },
    repertoireSupport: true,
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: true,
    showAnswer: false,
  });
  assert.equal(re1.moveTrust === "repertoire_supported" || re1.moveTrust === "book_supported" || re1.moveTrust === "engine_close", true);
  assert.equal(re1.mode, "move_teaching");
  assert.equal(re1.nextPlay.allowed, true);
  assert.equal(re1.nextPlay.suppressionReason, undefined);
  assert.equal(re1.visualDecision.visualLines.some((line) => line.from === "f1" && line.to === "e1"), true);
}
