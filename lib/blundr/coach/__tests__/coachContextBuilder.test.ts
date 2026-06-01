import assert from "node:assert/strict";
import { buildCoachContext } from "../coachContextBuilder";

export function testCoachContextBuilder(): void {
  const built = buildCoachContext({
    frameId: 70,
    boardFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    viewMode: "assisted",
    revealState: "hidden",
    phase: "ready_for_user",
    userToMove: true,
    bookStatus: "in_book",
    trainingContext: { moveTrust: "engine_verified", contextTrust: "safe_context" },
    visualRecipe: {
      frameId: "70",
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -",
      conceptId: "develop_with_pressure",
      patternId: "italian:bc4_f7",
      visualRecipeId: "vr:bc4",
      moveUci: "f1c4",
      moveSan: "Bc4",
      keySquares: ["f1", "c4", "f7"],
      keyPieces: ["bishop"],
      primitiveTypes: ["move_arrow", "pressure_line", "target_ring"],
      canShowAnswerMove: true,
      canShowContext: true,
    },
    attempts: 0,
    wrongAttempts: 0,
    hintUsed: false,
    answerShown: false,
    elapsedMs: 2000,
    priorPatternMisses: 0,
    priorPatternSuccesses: 1,
    recentUtteranceIds: [],
    recentUtteranceFamilies: [],
  });
  assert.equal(Boolean(built.context), true);
  assert.equal(built.context?.recipeFenMatchesBoard, true);
  assert.equal(built.context?.recipeFrameMatchesBoard, true);

  const stale = buildCoachContext({
    frameId: 1,
    boardFen: "8/8/8/8/8/8/8/8 w - -",
    viewMode: "assisted",
    revealState: "hidden",
    phase: "ready_for_user",
    userToMove: true,
    bookStatus: "in_book",
    visualRecipe: { frameId: 2, fen: "8/8/8/8/8/8/8/8 w - -", moveUci: "a2a3" },
    attempts: 0,
    wrongAttempts: 0,
    hintUsed: false,
    answerShown: false,
    elapsedMs: 0,
    priorPatternMisses: 0,
    priorPatternSuccesses: 0,
    recentUtteranceIds: [],
    recentUtteranceFamilies: [],
  });
  assert.equal(stale.context, null);
  assert.equal(stale.suppressedReason, "stale_frame");
}
