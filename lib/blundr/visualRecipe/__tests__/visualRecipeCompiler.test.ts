import assert from "node:assert/strict";

import { buildTrainingContext } from "../../teaching/trainingContextEngine";
import { compileVisualRecipe } from "../visualRecipeCompiler";

function hasPrimitive(recipe: ReturnType<typeof compileVisualRecipe>, type: string, matcher: (p: any) => boolean): boolean {
  return recipe.beats.flatMap((beat) => beat.primitives).some((primitive) => primitive.type === type && matcher(primitive as any));
}

function walkNoFunctionsOrDates(value: unknown): boolean {
  if (typeof value === "function") return false;
  if (value instanceof Date) return false;
  if (!value || typeof value !== "object") return true;
  if (Array.isArray(value)) return value.every(walkNoFunctionsOrDates);
  return Object.values(value as Record<string, unknown>).every(walkNoFunctionsOrDates);
}

function mockContext(partial: Record<string, unknown>): any {
  return {
    mode: "assisted_context",
    moveTrust: "untrusted",
    contextTrust: "safe_context",
    cue: {
      conceptId: "center_tension",
      metadata: { moveUci: "", moveSan: "", fenBefore: "", compilerVersion: "2.7.35d", createdAt: "now" },
    },
    selectedStory: {
      visualIntent: {
        squares: [{ square: "d4", kind: "target" }, { square: "e4", kind: "target" }, { square: "d5", kind: "target" }, { square: "e5", kind: "target" }],
      },
    },
    nextPlay: { allowed: false },
    ...partial,
  };
}

export function testVisualRecipeCompiler(): void {
  const bc4Fen = "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3";
  const bc4Tc = buildTrainingContext({
    fenBefore: bc4Fen,
    expectedMoveUci: "f1c4",
    expectedMoveSan: "Bc4",
    moveQuality: { status: "book_supported", topMoves: [{ rank: 1, uci: "f1c4", san: "Bc4", scoreCp: 28 }] },
    bookSupport: { hasBookSupport: true, confidence: 0.9, reason: "in_book" },
    repertoireSupport: true,
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: true,
    showAnswer: false,
  });
  const bc4Recipe = compileVisualRecipe({ trainingContext: bc4Tc, fen: bc4Fen, viewMode: "assisted", revealState: "hidden", openingId: "italian", lineId: "italian", expectedMoveUci: "f1c4", expectedMoveSan: "Bc4", frameId: 10 });
  assert.equal(bc4Recipe.mode, "move_teaching");
  assert.equal(hasPrimitive(bc4Recipe, "move_arrow", (p) => p.from === "f1" && p.to === "c4"), true);
  assert.equal(hasPrimitive(bc4Recipe, "pressure_line", (p) => p.from === "c4" && p.to === "f7"), true);
  assert.equal(hasPrimitive(bc4Recipe, "target_ring", (p) => p.square === "f7"), true);
  assert.equal(Boolean(bc4Recipe.patternId), true);
  assert.equal(bc4Recipe.learningAnchor.keySquares.includes("f1") && bc4Recipe.learningAnchor.keySquares.includes("c4") && bc4Recipe.learningAnchor.keySquares.includes("f7"), true);
  assert.equal(bc4Recipe.learningAnchor.reviewPromptKind, "find_move");

  const castleFen = "r1bqk2r/ppp2ppp/2np1n2/2b1p3/2B1P3/2PP1N2/PP3PPP/RNBQK2R w KQkq - 0 6";
  const castleTc = buildTrainingContext({
    fenBefore: castleFen,
    expectedMoveUci: "e1g1",
    expectedMoveSan: "O-O",
    moveQuality: { status: "verified_top2", topMoves: [{ rank: 1, uci: "a2a4", san: "a4", scoreCp: 21 }, { rank: 2, uci: "e1g1", san: "O-O", scoreCp: 20 }] },
    bookSupport: { hasBookSupport: true, confidence: 0.8, reason: "in_book" },
    repertoireSupport: true,
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: true,
    showAnswer: false,
  });
  const castleRecipe = compileVisualRecipe({ trainingContext: castleTc, fen: castleFen, viewMode: "assisted", revealState: "hidden", expectedMoveUci: "e1g1", expectedMoveSan: "O-O", openingId: "italian", lineId: "italian", frameId: 11 });
  assert.equal(hasPrimitive(castleRecipe, "move_arrow", (p) => p.from === "e1" && p.to === "g1"), true);
  assert.equal(hasPrimitive(castleRecipe, "king_safety_aura", (p) => p.square === "g1"), true);
  assert.equal(castleRecipe.learningAnchor.keySquares.includes("e1") && castleRecipe.learningAnchor.keySquares.includes("g1"), true);

  const c3Fen = "r1bqk2r/ppp2ppp/2np1n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 6";
  const c3Tc = buildTrainingContext({
    fenBefore: c3Fen,
    expectedMoveUci: "c2c3",
    expectedMoveSan: "c3",
    moveQuality: { status: "rejected", reason: "Expected training move did not match Stockfish's top two moves.", topMoves: [{ rank: 1, uci: "b1c3", san: "Nc3", scoreCp: 30 }, { rank: 2, uci: "e1g1", san: "O-O", scoreCp: 25 }] },
    bookSupport: { hasBookSupport: false, confidence: 0.3 },
    repertoireSupport: true,
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: true,
    showAnswer: false,
  });
  const c3Recipe = compileVisualRecipe({ trainingContext: c3Tc, fen: c3Fen, viewMode: "assisted", revealState: "hidden", expectedMoveUci: "c2c3", expectedMoveSan: "c3", openingId: "italian", lineId: "italian", frameId: 12 });
  assert.equal(hasPrimitive(c3Recipe, "move_arrow", (p) => p.from === "c2" && p.to === "c3"), true);
  assert.equal(hasPrimitive(c3Recipe, "square_highlight", (p) => p.square === "d4"), true);
  assert.equal(c3Recipe.learningAnchor.keySquares.includes("c2") && c3Recipe.learningAnchor.keySquares.includes("c3") && c3Recipe.learningAnchor.keySquares.includes("d4"), true);

  const re1Fen = "r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2PP1N2/PP3PPP/RNBQ1RK1 w - - 2 8";
  const re1Tc = buildTrainingContext({
    fenBefore: re1Fen,
    expectedMoveUci: "f1e1",
    expectedMoveSan: "Re1",
    moveQuality: { status: "rejected", reason: "Expected training move did not match Stockfish's top two moves.", topMoves: [{ rank: 1, uci: "c1g5", san: "Bg5", scoreCp: 36 }, { rank: 2, uci: "b1d2", san: "Nbd2", scoreCp: 31 }] },
    bookSupport: { hasBookSupport: false, confidence: 0.2, reason: "in_line" },
    repertoireSupport: true,
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: true,
    showAnswer: false,
  });
  const re1Recipe = compileVisualRecipe({ trainingContext: re1Tc, fen: re1Fen, viewMode: "assisted", revealState: "hidden", expectedMoveUci: "f1e1", expectedMoveSan: "Re1", openingId: "italian", lineId: "italian", frameId: 13 });
  assert.equal(hasPrimitive(re1Recipe, "move_arrow", (p) => p.from === "f1" && p.to === "e1"), true);
  assert.equal(hasPrimitive(re1Recipe, "pressure_line", () => true), false);

  const assistedRecipe = compileVisualRecipe({
    trainingContext: mockContext({ mode: "assisted_context", moveTrust: "untrusted", contextTrust: "safe_context", cue: { conceptId: "center_tension", metadata: { moveUci: "c2c3", moveSan: "c3", fenBefore: c3Fen, compilerVersion: "2.7.35d", createdAt: "now" } } }),
    fen: c3Fen,
    viewMode: "assisted",
    revealState: "hidden",
    expectedMoveUci: "c2c3",
    expectedMoveSan: "c3",
    frameId: 14,
  });
  assert.equal(assistedRecipe.mode, "assisted_context");
  assert.equal(hasPrimitive(assistedRecipe, "square_highlight", (p) => ["d4", "e4", "d5", "e5"].includes(p.square)), true);
  assert.equal(hasPrimitive(assistedRecipe, "move_arrow", () => true), false);
  assert.equal(assistedRecipe.permissions.canShowAnswerMove, false);
  assert.equal(assistedRecipe.learningAnchor.reviewPromptKind === "context_only" || assistedRecipe.learningAnchor.reviewPromptKind === "tap_key_square", true);

  const plainRecipe = compileVisualRecipe({ trainingContext: bc4Tc, fen: bc4Fen, viewMode: "plain", revealState: "hidden", expectedMoveUci: "f1c4", expectedMoveSan: "Bc4", frameId: 15 });
  assert.equal(plainRecipe.mode, "noop");
  assert.equal(plainRecipe.beats.length, 0);
  assert.equal(plainRecipe.debug?.recipeSuppressedReason, "plain_view");

  const revealHiddenRecipe = compileVisualRecipe({
    trainingContext: mockContext({ moveTrust: "reveal_only_unverified", mode: "assisted_context", contextTrust: "safe_context", cue: { conceptId: "center_tension", metadata: { moveUci: "c2c3", moveSan: "c3", fenBefore: c3Fen, compilerVersion: "2.7.35d", createdAt: "now" } } }),
    fen: c3Fen,
    viewMode: "assisted",
    revealState: "hidden",
    expectedMoveUci: "c2c3",
    expectedMoveSan: "c3",
    frameId: 16,
  });
  assert.equal(hasPrimitive(revealHiddenRecipe, "move_arrow", () => true), false);

  const revealShownRecipe = compileVisualRecipe({
    trainingContext: mockContext({ moveTrust: "reveal_only_unverified", mode: "move_teaching", contextTrust: "safe_context", nextPlay: { allowed: true }, cue: { conceptId: "center_tension", metadata: { moveUci: "c2c3", moveSan: "c3", fenBefore: c3Fen, compilerVersion: "2.7.35d", createdAt: "now" } } }),
    fen: c3Fen,
    viewMode: "assisted",
    revealState: "revealed",
    expectedMoveUci: "c2c3",
    expectedMoveSan: "c3",
    frameId: 17,
  });
  assert.equal(revealShownRecipe.mode, "reveal_answer");
  assert.equal(hasPrimitive(revealShownRecipe, "move_arrow", (p) => p.from === "c2" && p.to === "c3"), true);

  const untrustedRecipe = compileVisualRecipe({
    trainingContext: mockContext({ mode: "line_needs_review", moveTrust: "untrusted", contextTrust: "no_safe_context", selectedStory: null }),
    fen: c3Fen,
    viewMode: "assisted",
    revealState: "hidden",
    expectedMoveUci: "h2h4",
    expectedMoveSan: "h4",
    frameId: 18,
  });
  assert.equal(untrustedRecipe.mode, "noop");
  assert.equal(hasPrimitive(untrustedRecipe, "move_arrow", () => true), false);

  const budgetRecipe = compileVisualRecipe({
    trainingContext: mockContext({
      mode: "move_teaching",
      moveTrust: "book_supported",
      contextTrust: "safe_context",
      nextPlay: { allowed: true },
      cue: { conceptId: "develops_with_pressure", metadata: { moveUci: "f1c4", moveSan: "Bc4", fenBefore: bc4Fen, compilerVersion: "2.7.35d", createdAt: "now" } },
    }),
    fen: bc4Fen,
    viewMode: "assisted",
    revealState: "hidden",
    expectedMoveUci: "f1c4",
    expectedMoveSan: "Bc4",
    frameId: 19,
    visualBudgetOverride: { maxTotalPrimitives: 2, maxSupportingPrimitives: 1 },
  });
  const primitiveCount = budgetRecipe.beats.reduce((sum, beat) => sum + beat.primitives.length, 0);
  assert.equal(primitiveCount <= 2, true);
  assert.equal((budgetRecipe.debug?.suppressedPrimitives.length ?? 0) > 0, true);

  const bc4RecipeSameAgain = compileVisualRecipe({ trainingContext: bc4Tc, fen: bc4Fen, viewMode: "assisted", revealState: "hidden", openingId: "italian", lineId: "italian", expectedMoveUci: "f1c4", expectedMoveSan: "Bc4", frameId: 10 });
  assert.equal(bc4Recipe.visualRecipeId, bc4RecipeSameAgain.visualRecipeId);
  assert.equal(bc4Recipe.patternId, bc4RecipeSameAgain.patternId);
  assert.deepEqual(bc4Recipe.beats, bc4RecipeSameAgain.beats);

  const changedRecipe = compileVisualRecipe({ trainingContext: bc4Tc, fen: castleFen, viewMode: "assisted", revealState: "hidden", openingId: "italian", lineId: "italian", expectedMoveUci: "e1g1", expectedMoveSan: "O-O", frameId: 20 });
  assert.notEqual(changedRecipe.visualRecipeId, bc4Recipe.visualRecipeId);

  const roundTrip = JSON.parse(JSON.stringify(bc4Recipe));
  assert.equal(roundTrip.visualRecipeId, bc4Recipe.visualRecipeId);
  assert.equal(roundTrip.patternId, bc4Recipe.patternId);
  assert.equal(walkNoFunctionsOrDates(bc4Recipe), true);
  assert.equal(/\b1[6-9]\d{11}\b/.test(bc4Recipe.visualRecipeId), false);
  assert.equal(/\b1[6-9]\d{11}\b/.test(bc4Recipe.patternId), false);

  assert.equal(Boolean(bc4Recipe.learningAnchor.patternId), true);
  assert.equal(Boolean(bc4Recipe.learningAnchor.conceptId), true);
  assert.equal(Boolean(bc4Recipe.learningAnchor.fen), true);
  assert.equal(Boolean(bc4Recipe.learningAnchor.moveUci), true);
  assert.equal(bc4Recipe.learningAnchor.keySquares.length > 0, true);
  assert.equal(Boolean(bc4Recipe.learningAnchor.reviewPromptKind), true);

  assert.equal(plainRecipe.learningAnchor.keySquares.length, 0);
  assert.equal(plainRecipe.learningAnchor.reviewPromptKind, "context_only");
}
