import assert from "node:assert/strict";
import test from "node:test";

import type { ProductionDailyPublicSession } from "../productionDailyTypes";
import { resolveProductionDailyCardGoalProgress } from "../productionDailyCardGoalProgress.ts";

const card = {
  actionId: "daily-action-test",
  cardFingerprint: "card-1",
  positionKey: "position-1",
  activityId: "candidate_choice",
  title: "Candidate choice",
  prompt: "Choose.",
  positionFen: "8/8/8/8/8/8/8/K6k w - - 0 1",
  openingId: "italian-white",
  playKey: "e2e4 e7e5",
  side: "white" as const,
  why: "Verified evidence.",
  interaction: "choice" as const,
};

function session(
  overrides: Partial<ProductionDailyPublicSession> = {},
): ProductionDailyPublicSession {
  return {
    sessionId: "session-1",
    deckId: "deck-1",
    dateKey: "2026-07-20",
    publicCards: [card],
    version: 2,
    completedAt: null,
    reservationIdentity: {
      composerVersion: "test",
      runtimePackageId: "test",
      profileVersion: "test",
    },
    state: {
      currentIndex: 0,
      completedCardIds: [],
      revealedCardIds: [],
    },
    ...overrides,
  };
}

test("returns null without a reserved session", () => {
  assert.equal(resolveProductionDailyCardGoalProgress(null, 10), null);
});

test("uses the reserved deck target after a Daily session exists", () => {
  const progress = resolveProductionDailyCardGoalProgress(
    session({
      publicCards: [card, { ...card, cardFingerprint: "card-2" }],
      dailyCardTarget: 10,
      state: {
        currentIndex: 2,
        completedCardIds: ["card-1"],
        revealedCardIds: [],
      },
    }),
    10,
  );
  assert.ok(progress);
  if (!progress) return;
  assert.equal(progress.totalCards, 2);
  assert.equal(progress.completedCards, 1);
  assert.equal(progress.goalCards, 10);
  assert.equal(progress.progressCards, 1);
  assert.equal(progress.completed, false);
  assert.equal(progress.percent, 10);
});

test("treats the card-goal as complete once the configured goal is reached", () => {
  const progress = resolveProductionDailyCardGoalProgress(
    session({
      publicCards: [card, { ...card, cardFingerprint: "card-2" }],
      dailyCardTarget: 10,
      cardsCompletedToday: 11,
      state: {
        currentIndex: 2,
        completedCardIds: ["card-1", "card-2"],
        revealedCardIds: [],
      },
    }),
    10,
  );
  assert.ok(progress);
  if (!progress) return;
  assert.equal(progress.goalCards, 10);
  assert.equal(progress.completed, true);
  assert.equal(progress.percent, 100);
});

test("mid-session preference decreases do not shrink the frozen Daily target", () => {
  const progress = resolveProductionDailyCardGoalProgress(
    session({
      publicCards: Array.from({ length: 10 }, (_, index) => ({
        ...card,
        cardFingerprint: `card-${index + 1}`,
      })),
      dailyCardTarget: 10,
      cardsCompletedToday: 5,
      state: {
        currentIndex: 5,
        completedCardIds: ["card-1", "card-2", "card-3", "card-4", "card-5"],
        revealedCardIds: [],
      },
    }),
    5,
  );
  assert.ok(progress);
  if (!progress) return;
  assert.equal(progress.completedCards, 5);
  assert.equal(progress.goalCards, 10);
  assert.equal(progress.progressCards, 5);
  assert.equal(progress.completed, false);
});

test("pre-reservation preference still supplies the target when no snapshot exists", () => {
  const progress = resolveProductionDailyCardGoalProgress(
    session({
      dailyCardTarget: undefined,
      publicCards: [card, { ...card, cardFingerprint: "card-2" }],
    }),
    5,
  );
  assert.ok(progress);
  if (!progress) return;
  assert.equal(progress.goalCards, 5);
});
