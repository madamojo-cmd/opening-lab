import assert from "node:assert/strict";

import { scoreDailyTrainingTargetAttempt } from "../trainingTargets/dailyTrainingTargetScoring";

export function testDailyTrainingTargetScoring(): void {
  const bestRoute = scoreDailyTrainingTargetAttempt({
    completed: true,
    won: true,
    moveCount: 1,
    moveLimit: 2,
    bestKnownMoves: 1,
    illegalMoveCount: 0,
    blocked: false,
    perfectPath: true,
    objectiveCount: 1,
    objectivesCompleted: 1,
    reason: "best_known_route",
  });
  assert.equal(bestRoute.score, 100);
  assert.equal(bestRoute.correct, true);
  assert.equal(bestRoute.summary, "best_known_route");

  const revealReview = scoreDailyTrainingTargetAttempt({
    completed: false,
    won: false,
    moveCount: 0,
    moveLimit: 2,
    illegalMoveCount: 0,
    usedReveal: true,
    reason: "reviewed_after_reveal",
  });
  assert.equal(revealReview.score, 30);
  assert.equal(revealReview.outcome, "reveal");
  assert.equal(revealReview.correct, false);

  const illegalMove = scoreDailyTrainingTargetAttempt({
    completed: true,
    won: false,
    moveCount: 1,
    moveLimit: 2,
    illegalMoveCount: 1,
    reason: "illegal_move_attempt",
  });
  assert.equal(illegalMove.score, 5);
  assert.equal(illegalMove.outcome, "incorrect");
  assert.equal(illegalMove.correct, false);
}

testDailyTrainingTargetScoring();
console.log("dailyTrainingTargetScoring ok");
