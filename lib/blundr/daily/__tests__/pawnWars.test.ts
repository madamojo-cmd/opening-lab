import assert from "node:assert/strict";

import { generatePawnWarsMiniGameCard, advancePawnWarsMiniGame } from "../miniGames/pawnWars";
import type { DailyMiniGameGenerationContext, DailyMiniGameState } from "../miniGames/dailyMiniGameTypes";

function makeContext(): DailyMiniGameGenerationContext {
  return {
    dateKey: "2026-07-02",
    now: "2026-07-02T09:00:00.000Z",
    mastery: null,
    difficulty: "beginner",
    currentMastery: 0.2,
    confidence: 0.25,
    dueReviewCount: 0,
    selectedReviewCount: 0,
    recentMiniGameIds: [],
    recentFenKeys: [],
    sessionMiniGameIds: [],
  };
}

function makePromotionState(): DailyMiniGameState {
  const startFen = "7k/4P3/8/8/8/8/8/K7 w - - 0 1";
  return {
    miniGameId: "pawn_wars",
    skillIds: ["pawn_race", "promotion", "passed_pawn"],
    difficulty: "beginner",
    startFen,
    currentFen: startFen,
    sideToMove: "w",
    learnerSide: "white",
    goalSquares: ["e8"],
    targetSquares: [],
    flagSquares: ["e8"],
    moveLimit: 1,
    plyCount: 0,
    bestKnownScore: 1,
    completed: false,
    won: false,
    formationHash: "pawn-wars-promotion",
    noveltyKey: "pawn_wars:pawn-wars-promotion",
  };
}

function makePassedPawnState(): DailyMiniGameState {
  const startFen = "7k/8/8/8/2P5/8/8/K7 w - - 0 1";
  return {
    miniGameId: "pawn_wars",
    skillIds: ["pawn_race", "promotion", "passed_pawn"],
    difficulty: "beginner",
    startFen,
    currentFen: startFen,
    sideToMove: "w",
    learnerSide: "white",
    goalSquares: ["c5"],
    targetSquares: [],
    flagSquares: ["c5"],
    moveLimit: 2,
    plyCount: 0,
    bestKnownScore: 1,
    completed: false,
    won: false,
    formationHash: "pawn-wars-passed",
    noveltyKey: "pawn_wars:pawn-wars-passed",
  };
}

export function testPawnWars(): void {
  const generated = generatePawnWarsMiniGameCard(makeContext());
  assert.ok(generated);
  assert.equal(generated?.kind, "mini_game");
  assert.equal(generated?.miniGame.miniGameId, "pawn_wars");
  assert.deepEqual(generated?.miniGame.skillIds, ["pawn_race", "promotion", "passed_pawn"]);
  assert.equal(generated?.masteryTargets.length, 3);

  const promotionResult = advancePawnWarsMiniGame(makePromotionState(), {
    from: "e7",
    to: "e8",
    uci: "e7e8q",
    san: "e8=Q",
    legal: true,
  });
  assert.equal(promotionResult.completed, true);
  assert.equal(promotionResult.won, true);
  assert.equal(promotionResult.reason, "promotion_reached");
  assert.equal(promotionResult.state.completed, true);
  assert.equal(promotionResult.state.won, true);
  assert.equal(promotionResult.scoreInput.won, true);

  const passedPawnResult = advancePawnWarsMiniGame(makePassedPawnState(), {
    from: "c4",
    to: "c5",
    uci: "c4c5",
    san: "c5",
    legal: true,
  });
  assert.equal(passedPawnResult.completed, true);
  assert.equal(passedPawnResult.won, true);
  assert.equal(passedPawnResult.reason, "passed_pawn_created");
  assert.equal(passedPawnResult.state.completed, true);
  assert.equal(passedPawnResult.state.won, true);
  assert.equal(passedPawnResult.scoreInput.won, true);

  const illegalResult = advancePawnWarsMiniGame(makePassedPawnState(), {
    from: "c4",
    to: "c6",
    uci: "c4c6",
    san: "c6",
    legal: false,
  });
  assert.equal(illegalResult.completed, true);
  assert.equal(illegalResult.won, false);
  assert.equal(illegalResult.reason, "illegal_move_attempt");
  assert.equal(illegalResult.scoreInput.illegalMoveCount, 1);
}

testPawnWars();
console.log("pawnWars ok");
