import assert from "node:assert/strict";
import { Chess } from "chess.js";

import { scoreDailyBlundrAttempt } from "../dailyBlundrAttemptScoring";
import type { DailyBlundrCard } from "../dailyBlundrTypes";

function makeCard(): DailyBlundrCard {
  return {
    source: "progress_mistake",
    cardKey: "daily-card-1",
    positionKey: "start-position",
    fen: new Chess().fen(),
    expectedMoveUci: "e2e4",
    expectedMoveSan: "e4",
    playedMoveUci: "e7e5",
    playedMoveSan: "e5",
    openingId: "italian-white",
    openingName: "Italian Game",
    patternId: "italian",
    concept: "center-control",
    count: 1,
    weight: 1,
    lastSeenAt: "2026-07-02T08:00:00.000Z",
    note: null,
    signals: ["move_incorrect"],
    masteryTargets: [
      {
        conceptKey: "italian-white",
        domain: "opening_review",
        label: "Italian Game",
        difficultyHint: "beginner",
      },
    ],
    confidence: "medium",
    difficulty: "beginner",
    id: "daily-card-1",
    kind: "recall",
    title: "Italian Game",
    prompt: "Recall the move.",
    repertoireId: "italian-white",
    reviewCardId: "review:italian-white",
    reviewDedupeKey: "review|italian-white",
    reviewPromptKind: "target_move_recall",
    reviewStatus: "review",
    reviewDueAt: "2026-07-02T09:00:00.000Z",
    deckRank: 1,
    priority: 100,
    masteryKey: "italian-white",
    sourceCount: 1,
    summary: "Italian Game • 1 signal",
  };
}

export function testDailyBlundrAttemptScoring(): void {
  const card = makeCard();

  const correctNoReveal = scoreDailyBlundrAttempt({ card, attemptedMove: "e2e4" });
  assert.equal(correctNoReveal.score, 100);
  assert.equal(correctNoReveal.correct, true);
  assert.equal(correctNoReveal.partialCredit, 1);
  assert.equal(correctNoReveal.usedReveal, false);
  assert.equal(correctNoReveal.outcome, "correct");
  assert.equal(correctNoReveal.reason, "matched_expected_move");
  assert.equal(correctNoReveal.failureType, undefined);

  const correctWithReveal = scoreDailyBlundrAttempt({ card, attemptedMove: "e4", usedReveal: true });
  assert.equal(correctWithReveal.score, 60);
  assert.equal(correctWithReveal.correct, true);
  assert.equal(correctWithReveal.partialCredit, 0.6);
  assert.equal(correctWithReveal.usedReveal, true);
  assert.equal(correctWithReveal.outcome, "correct");
  assert.equal(correctWithReveal.failureType, "reveal_dependency");

  const revealOnlyReviewed = scoreDailyBlundrAttempt({ card, revealOnlyReviewed: true, usedReveal: true });
  assert.equal(revealOnlyReviewed.score, 45);
  assert.equal(revealOnlyReviewed.correct, false);
  assert.equal(revealOnlyReviewed.partialCredit, 0.45);
  assert.equal(revealOnlyReviewed.usedReveal, true);
  assert.equal(revealOnlyReviewed.outcome, "reveal");
  assert.equal(revealOnlyReviewed.failureType, "reveal_dependency");

  const incorrectNoReveal = scoreDailyBlundrAttempt({ card, attemptedMove: "d2d4" });
  assert.equal(incorrectNoReveal.score, 20);
  assert.equal(incorrectNoReveal.correct, false);
  assert.equal(incorrectNoReveal.partialCredit, 0.2);
  assert.equal(incorrectNoReveal.usedReveal, false);
  assert.equal(incorrectNoReveal.outcome, "incorrect");

  const incorrectWithReveal = scoreDailyBlundrAttempt({ card, attemptedMove: "d2d4", usedReveal: true });
  assert.equal(incorrectWithReveal.score, 35);
  assert.equal(incorrectWithReveal.correct, false);
  assert.equal(incorrectWithReveal.partialCredit, 0.35);
  assert.equal(incorrectWithReveal.usedReveal, true);
  assert.equal(incorrectWithReveal.outcome, "incorrect");

  const illegalMove = scoreDailyBlundrAttempt({ card, attemptedMove: "e2e5" });
  assert.equal(illegalMove.score, 0);
  assert.equal(illegalMove.correct, false);
  assert.equal(illegalMove.partialCredit, 0);
  assert.equal(illegalMove.usedReveal, false);
  assert.equal(illegalMove.outcome, "incorrect");
  assert.equal(illegalMove.failureType, "illegal_move_attempt");
  assert.equal(illegalMove.reason, "illegal_move_attempt");

  const skipped = scoreDailyBlundrAttempt({ card, attemptedMove: "   " });
  assert.equal(skipped.score, 0);
  assert.equal(skipped.outcome, "skip");
  assert.equal(skipped.failureType, "illegal_move_attempt");

  for (const result of [correctNoReveal, correctWithReveal, revealOnlyReviewed, incorrectNoReveal, incorrectWithReveal, illegalMove, skipped]) {
    assert.ok(result.score >= 0 && result.score <= 100);
  }
}

testDailyBlundrAttemptScoring();
console.log("dailyBlundrAttemptScoring ok");
