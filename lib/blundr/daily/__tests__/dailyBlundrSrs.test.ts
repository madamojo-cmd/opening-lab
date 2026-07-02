import assert from "node:assert/strict";
import { Chess } from "chess.js";

import { gradeDailyBlundrAttempt, scheduleDailyBlundrReview } from "../dailyBlundrSrs";
import type { DailyBlundrReviewCard } from "../dailyBlundrReviewTypes";

function makeReviewCard(overrides: Partial<DailyBlundrReviewCard> = {}): DailyBlundrReviewCard {
  const completedAt = "2026-07-02T09:00:00.000Z";
  return {
    schemaVersion: 1,
    id: "review:italian:e4",
    dedupeKey: "position|e2e4|target_move_recall|wrong_book_move|daily:italian",
    status: "new",
    promptKind: "target_move_recall",
    source: "progress_mistake",
    fen: new Chess().fen(),
    positionHash: "position",
    expectedMoveUci: "e2e4",
    expectedMoveSan: "e4",
    playedMoveUci: "e7e5",
    playedMoveSan: "e5",
    openingId: "italian-white",
    repertoireId: "italian-white",
    openingName: "Italian Game",
    domain: "daily_recall",
    masteryTargets: [
      {
        conceptKey: "daily:position:e2e4",
        domain: "daily_recall",
        label: "Italian Game",
        difficultyHint: "beginner",
      },
    ],
    failureType: "wrong_book_move",
    severity: 3,
    signals: ["progress_mistake"],
    dueAt: completedAt,
    intervalDays: 0,
    ease: 2.35,
    correctStreak: 0,
    lapses: 0,
    totalAttempts: 0,
    revealUses: 0,
    avgResponseTimeMs: null,
    lastReviewedAt: null,
    createdAt: completedAt,
    updatedAt: completedAt,
    ...overrides,
  };
}

export function testDailyBlundrSrs(): void {
  const newAgain = scheduleDailyBlundrReview({
    card: makeReviewCard(),
    completedAt: "2026-07-02T09:00:00.000Z",
    correct: false,
    partialCredit: 0,
    responseTimeMs: 1000,
    usedReveal: false,
    promptKind: "target_move_recall",
    now: "2026-07-02T09:00:00.000Z",
  });
  assert.equal(newAgain.grade, "AGAIN");
  assert.equal(newAgain.card.intervalDays, 0);
  assert.equal(newAgain.card.dueAt, "2026-07-02T09:05:00.000Z");
  assert.equal(newAgain.card.correctStreak, 0);

  const existingAgain = scheduleDailyBlundrReview({
    card: makeReviewCard({
      totalAttempts: 2,
      lapses: 1,
      correctStreak: 1,
      intervalDays: 3,
      dueAt: "2026-07-05T09:00:00.000Z",
    }),
    completedAt: "2026-07-02T09:00:00.000Z",
    correct: false,
    partialCredit: 0,
    responseTimeMs: 1000,
    usedReveal: false,
    promptKind: "target_move_recall",
    now: "2026-07-02T09:00:00.000Z",
  });
  assert.equal(existingAgain.card.dueAt, "2026-07-02T09:10:00.000Z");

  const revealUsed = scheduleDailyBlundrReview({
    card: makeReviewCard({
      totalAttempts: 2,
      correctStreak: 2,
      intervalDays: 2,
      dueAt: "2026-07-04T09:00:00.000Z",
    }),
    completedAt: "2026-07-02T09:00:00.000Z",
    correct: true,
    partialCredit: 1,
    responseTimeMs: 1500,
    usedReveal: true,
    promptKind: "target_move_recall",
    now: "2026-07-02T09:00:00.000Z",
  });
  assert.equal(revealUsed.grade, "HARD");
  assert.equal(revealUsed.card.revealUses, 1);

  const slowCorrect = scheduleDailyBlundrReview({
    card: makeReviewCard({
      totalAttempts: 2,
      correctStreak: 1,
      intervalDays: 1,
      dueAt: "2026-07-03T09:00:00.000Z",
    }),
    completedAt: "2026-07-02T09:00:00.000Z",
    correct: true,
    partialCredit: 1,
    responseTimeMs: 12000,
    usedReveal: false,
    promptKind: "target_move_recall",
    now: "2026-07-02T09:00:00.000Z",
  });
  assert.equal(slowCorrect.grade, "HARD");

  const goodNew = scheduleDailyBlundrReview({
    card: makeReviewCard(),
    completedAt: "2026-07-02T09:00:00.000Z",
    correct: true,
    partialCredit: 1,
    responseTimeMs: 900,
    usedReveal: false,
    promptKind: "target_move_recall",
    now: "2026-07-02T09:00:00.000Z",
  });
  assert.equal(goodNew.grade, "GOOD");
  assert.equal(goodNew.card.dueAt, "2026-07-03T09:00:00.000Z");

  const easyNew = scheduleDailyBlundrReview({
    card: makeReviewCard({
      totalAttempts: 2,
      correctStreak: 2,
      intervalDays: 1,
    }),
    completedAt: "2026-07-02T09:00:00.000Z",
    correct: true,
    partialCredit: 1,
    responseTimeMs: 700,
    usedReveal: false,
    promptKind: "target_move_recall",
    grade: "EASY",
    now: "2026-07-02T09:00:00.000Z",
  });
  assert.equal(easyNew.card.dueAt, "2026-07-05T09:00:00.000Z");
  assert.ok(easyNew.card.ease <= 3.0);

  const easyRecognition = gradeDailyBlundrAttempt({
    promptKind: "review_prompt",
    correct: true,
    partialCredit: 1,
    usedReveal: false,
    responseTimeMs: 800,
    previousCorrectStreak: 3,
  });
  assert.equal(easyRecognition, "GOOD");

  const easeClampLow = scheduleDailyBlundrReview({
    card: makeReviewCard({
      ease: 1.3,
      totalAttempts: 3,
      correctStreak: 0,
      intervalDays: 0,
    }),
    completedAt: "2026-07-02T09:00:00.000Z",
    correct: false,
    partialCredit: 0,
    responseTimeMs: 500,
    usedReveal: false,
    promptKind: "target_move_recall",
    grade: "AGAIN",
    now: "2026-07-02T09:00:00.000Z",
  });
  assert.ok(easeClampLow.card.ease >= 1.3);
  assert.ok(easeClampLow.card.ease <= 3.0);

  const easeClampHigh = scheduleDailyBlundrReview({
    card: makeReviewCard({
      ease: 3.0,
      totalAttempts: 6,
      correctStreak: 4,
      intervalDays: 14,
    }),
    completedAt: "2026-07-02T09:00:00.000Z",
    correct: true,
    partialCredit: 1,
    responseTimeMs: 600,
    usedReveal: false,
    promptKind: "target_move_recall",
    grade: "EASY",
    now: "2026-07-02T09:00:00.000Z",
  });
  assert.ok(easeClampHigh.card.ease <= 3.0);
  assert.ok(easeClampHigh.card.ease >= 1.3);

  const leech = scheduleDailyBlundrReview({
    card: makeReviewCard({
      lapses: 7,
      totalAttempts: 12,
      correctStreak: 1,
      intervalDays: 4,
    }),
    completedAt: "2026-07-02T09:00:00.000Z",
    correct: false,
    partialCredit: 0,
    responseTimeMs: 900,
    usedReveal: false,
    promptKind: "target_move_recall",
    now: "2026-07-02T09:00:00.000Z",
  });
  assert.equal(leech.card.status, "leech");

  const mastered = scheduleDailyBlundrReview({
    card: makeReviewCard({
      status: "review",
      ease: 2.7,
      totalAttempts: 5,
      correctStreak: 3,
      intervalDays: 7,
      lapses: 0,
      dueAt: "2026-07-09T09:00:00.000Z",
    }),
    completedAt: "2026-07-02T09:00:00.000Z",
    correct: true,
    partialCredit: 1,
    responseTimeMs: 600,
    usedReveal: false,
    promptKind: "target_move_recall",
    grade: "GOOD",
    now: "2026-07-02T09:00:00.000Z",
  });
  assert.equal(mastered.card.status, "mastered");
}

testDailyBlundrSrs();
console.log("dailyBlundrSrs ok");
