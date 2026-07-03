import assert from "node:assert/strict";
import { Chess } from "chess.js";

import { applyDailyBlundrAttemptToSession, getNextIncompleteCardIndex, isDailyBlundrCardComplete, isDailyBlundrSessionComplete } from "../dailyBlundrSessionController";
import { createEmptyDailyBlundrSession } from "../dailyBlundrStorage";
import type { DailyBlundrAttempt, DailyBlundrCard, DailyBlundrSession } from "../dailyBlundrTypes";

function makeCard(overrides: Partial<DailyBlundrCard> = {}): DailyBlundrCard {
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
    ...overrides,
  };
}

function makeProgress(): DailyBlundrSession["cardProgressById"][string] {
  return {
    attempts: 0,
    correct: 0,
    incorrect: 0,
    completed: false,
    lastAttemptAt: null,
    lastAttemptOutcome: null,
    lastAttemptMoveUci: null,
    lastAttemptMoveSan: null,
    completedAt: null,
  };
}

function makeSession(cards: DailyBlundrCard[]): DailyBlundrSession {
  const base = createEmptyDailyBlundrSession("2026-07-02", "daily-fingerprint");
  const cardProgressById = Object.fromEntries(cards.map((card) => [card.cardKey, makeProgress()]));
  return {
    ...base,
    status: "in_progress",
    cardIds: cards.map((card) => card.id),
    cards,
    cardOrder: cards.map((card) => card.id),
    completedCardIds: [],
    currentCardId: cards[0]?.cardKey ?? null,
    startedAt: "2026-07-02T09:00:00.000Z",
    completedAt: null,
    rewardClaimedAt: null,
    rewardAwardedAt: null,
    attempts: [],
    cardProgressById,
    updatedAt: "2026-07-02T09:00:00.000Z",
  };
}

function makeAttempt(card: DailyBlundrCard, overrides: Partial<DailyBlundrAttempt> = {}): DailyBlundrAttempt {
  const now = "2026-07-02T09:01:00.000Z";
  return {
    id: `attempt-${card.cardKey}`,
    cardId: card.cardKey,
    source: card.source,
    createdAt: now,
    completedAt: now,
    outcome: "correct",
    correct: true,
    attemptedMoveUci: card.expectedMoveUci,
    attemptedMoveSan: card.expectedMoveSan,
    responseMoveUci: card.expectedMoveUci,
    responseMoveSan: card.expectedMoveSan,
    expectedMoveUci: card.expectedMoveUci,
    expectedMoveSan: card.expectedMoveSan,
    usedReveal: false,
    responseTimeMs: 1200,
    note: null,
    ...overrides,
  };
}

export function testDailyBlundrSessionController(): void {
  const firstCard = makeCard({ cardKey: "daily-card-1", id: "daily-card-1", deckRank: 1 });
  const secondCard = makeCard({ cardKey: "daily-card-2", id: "daily-card-2", deckRank: 2, reviewCardId: "review:italian-white-2" });
  const session = makeSession([firstCard, secondCard]);

  assert.equal(getNextIncompleteCardIndex(session), 0);
  assert.equal(isDailyBlundrCardComplete(session, firstCard.cardKey), false);
  assert.equal(isDailyBlundrSessionComplete(session), false);

  const firstCompleted = applyDailyBlundrAttemptToSession(session, makeAttempt(firstCard));
  assert.notEqual(firstCompleted, session);
  assert.equal(session.attempts.length, 0);
  assert.equal(firstCompleted.attempts.length, 1);
  assert.equal(firstCompleted.cardProgressById[firstCard.cardKey].completed, true);
  assert.equal(firstCompleted.cardProgressById[firstCard.cardKey].lastAttemptOutcome, "correct");
  assert.equal(firstCompleted.completedCardIds.includes(firstCard.cardKey), true);
  assert.equal(firstCompleted.currentCardId, secondCard.cardKey);
  assert.equal(firstCompleted.status, "in_progress");
  assert.equal(getNextIncompleteCardIndex(firstCompleted), 1);
  assert.equal(isDailyBlundrCardComplete(firstCompleted, firstCard.cardKey), true);

  const duplicateAttempt = applyDailyBlundrAttemptToSession(firstCompleted, makeAttempt(firstCard, { id: "attempt-duplicate" }));
  assert.equal(duplicateAttempt, firstCompleted);
  assert.equal(duplicateAttempt.attempts.length, 1);

  const completed = applyDailyBlundrAttemptToSession(firstCompleted, makeAttempt(secondCard, { id: "attempt-2", cardId: secondCard.cardKey }));
  assert.equal(completed.attempts.length, 2);
  assert.equal(isDailyBlundrSessionComplete(completed), true);
  assert.equal(completed.status, "completed");
  assert.equal(completed.currentCardId, null);
  assert.equal(completed.completedAt !== null, true);
  assert.equal(completed.completedCardIds.length, 2);
  assert.equal(isDailyBlundrCardComplete(completed, secondCard.cardKey), true);
  assert.equal(getNextIncompleteCardIndex(completed), -1);
  assert.equal(completed.deckFingerprint, session.deckFingerprint);
  assert.equal(completed.dateKey, session.dateKey);
  assert.equal(completed.startedAt, session.startedAt);
  assert.equal(completed.rewardClaimedAt, null);
}

testDailyBlundrSessionController();
console.log("dailyBlundrSessionController ok");
