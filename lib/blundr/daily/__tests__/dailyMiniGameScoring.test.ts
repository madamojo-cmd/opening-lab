import assert from "node:assert/strict";

import { scoreDailyMiniGameAttempt } from "../miniGames/dailyMiniGameScoring";

export function testDailyMiniGameScoring(): void {
  const illegal = scoreDailyMiniGameAttempt({
    completed: true,
    won: false,
    moveCount: 1,
    moveLimit: 3,
    illegalMoveCount: 1,
    reason: "illegal_move_attempt",
  });
  assert.equal(illegal.score, 5);
  assert.equal(illegal.correct, false);
  assert.equal(illegal.usedReveal, false);
  assert.equal(illegal.outcome, "incorrect");

  const bestRoute = scoreDailyMiniGameAttempt({
    completed: true,
    won: true,
    moveCount: 3,
    moveLimit: 4,
    bestKnownMoves: 3,
    perfectPath: true,
    objectiveCount: 1,
    objectivesCompleted: 1,
    reason: "best_known_route",
  });
  assert.equal(bestRoute.score, 100);
  assert.equal(bestRoute.correct, true);
  assert.equal(bestRoute.usedReveal, false);
  assert.equal(bestRoute.outcome, "correct");
  assert.equal(bestRoute.summary, "best_known_route");

  const efficientWin = scoreDailyMiniGameAttempt({
    completed: true,
    won: true,
    moveCount: 5,
    moveLimit: 7,
    bestKnownMoves: 4,
    objectiveCount: 2,
    objectivesCompleted: 2,
    reason: "solved_route",
  });
  assert.ok(efficientWin.score > 78 && efficientWin.score < 100);
  assert.equal(efficientWin.correct, true);
  assert.equal(efficientWin.usedReveal, false);
  assert.equal(efficientWin.outcome, "correct");

  const incomplete = scoreDailyMiniGameAttempt({
    completed: false,
    won: false,
    moveCount: 2,
    moveLimit: 4,
    reason: "mini_game_incomplete",
  });
  assert.equal(incomplete.score, 0);
  assert.equal(incomplete.correct, false);
  assert.equal(incomplete.usedReveal, false);
  assert.equal(incomplete.outcome, "skip");

  const blockedLoss = scoreDailyMiniGameAttempt({
    completed: true,
    won: false,
    moveCount: 4,
    moveLimit: 3,
    blocked: true,
    objectiveCount: 2,
    objectivesCompleted: 1,
    reason: "blocked_route",
  });
  assert.ok(blockedLoss.score >= 0 && blockedLoss.score <= 20);
  assert.equal(blockedLoss.correct, false);
  assert.equal(blockedLoss.usedReveal, false);
  assert.equal(blockedLoss.outcome, "incorrect");
  assert.equal(blockedLoss.summary, "blocked_route");
}

testDailyMiniGameScoring();
console.log("dailyMiniGameScoring ok");
