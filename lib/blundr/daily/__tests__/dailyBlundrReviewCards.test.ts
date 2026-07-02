import assert from "node:assert/strict";
import { Chess } from "chess.js";

import { buildDailyBlundrDeck } from "../dailyBlundrDeckBuilder";
import {
  dailyBlundrReviewCardToDailyCard,
  dailyBlundrReviewDedupeKey,
  makeDailyBlundrReviewCardFromAttempt,
  makeDailyBlundrReviewCardFromDailyCard,
  mergeDailyBlundrReviewCard,
  upsertDailyBlundrReviewCards,
} from "../dailyBlundrReviewCards";
import type { DailyBlundrAttempt, DailyBlundrCard } from "../dailyBlundrTypes";
import type { DailyBlundrReviewCard } from "../dailyBlundrReviewTypes";

function makeSourceCard(): DailyBlundrCard {
  const deck = buildDailyBlundrDeck({
    progress: {
      attempts: 0,
      correct: 0,
      incorrect: 0,
      streak: 0,
      trainedPositions: {},
      mistakes: {
        a: { fen: new Chess().fen(), expectedMove: "e4", playedMove: "e5", count: 2, opening: "Italian Game", repertoireId: "italian-white" },
      },
    },
    learningEvents: [],
    mastery: null,
    dateKey: "2026-07-02",
    limit: 5,
  });
  assert.ok(deck.cards.length > 0);
  return deck.cards[0];
}

function makeAttempt(card: DailyBlundrCard, overrides: Partial<DailyBlundrAttempt> = {}): DailyBlundrAttempt {
  const now = "2026-07-02T09:00:00.000Z";
  return {
    id: `attempt-${Math.random().toString(36).slice(2, 8)}`,
    cardId: card.cardKey,
    source: card.source,
    createdAt: now,
    completedAt: now,
    outcome: "incorrect",
    correct: false,
    attemptedMoveUci: "e7e5",
    attemptedMoveSan: "e5",
    responseMoveUci: "e7e5",
    responseMoveSan: "e5",
    expectedMoveUci: card.expectedMoveUci,
    expectedMoveSan: card.expectedMoveSan,
    usedReveal: false,
    responseTimeMs: 2100,
    note: null,
    ...overrides,
  };
}

export function testDailyBlundrReviewCards(): void {
  const sourceCard = makeSourceCard();
  const base = makeDailyBlundrReviewCardFromDailyCard({
    sourceCard,
    now: "2026-07-02T08:00:00.000Z",
  });

  assert.ok(base.id.startsWith("review:"));
  assert.ok(base.dedupeKey.includes("target_move_recall"));
  assert.ok(base.dedupeKey.includes("wrong_book_move"));

  const dedupeKey = dailyBlundrReviewDedupeKey({
    positionHash: sourceCard.positionKey,
    expectedMoveUci: sourceCard.expectedMoveUci,
    expectedMoveSan: sourceCard.expectedMoveSan,
    promptKind: "target_move_recall",
    failureType: "wrong_book_move",
    primaryMasteryKey: sourceCard.masteryTargets.find((target) => target.domain !== "daily_recall")?.conceptKey ?? sourceCard.masteryKey,
  });
  assert.equal(dedupeKey, base.dedupeKey);

  const attempt = makeAttempt(sourceCard, {
    usedReveal: true,
    correct: true,
    outcome: "correct",
    responseTimeMs: 7000,
    note: "manual_review",
  });
  const incoming = makeDailyBlundrReviewCardFromAttempt({
    sourceCard,
    attempt,
    existingCard: base,
    now: "2026-07-02T09:00:00.000Z",
  });
  assert.ok(incoming.totalAttempts >= 1);
  assert.ok(incoming.revealUses >= 1);

  const merged = mergeDailyBlundrReviewCard(base, incoming);
  assert.equal(merged.dedupeKey, base.dedupeKey);
  assert.equal(merged.expectedMoveUci, sourceCard.expectedMoveUci);
  assert.ok(merged.totalAttempts >= incoming.totalAttempts);
  assert.ok(merged.severity >= base.severity);
  assert.ok(merged.signals.length >= base.signals.length);

  const uciPreferred = mergeDailyBlundrReviewCard(
    {
      ...base,
      id: "review:san",
      dedupeKey: "merge|san",
      expectedMoveUci: null,
      expectedMoveSan: "e4",
      createdAt: "2026-07-02T10:00:00.000Z",
      updatedAt: "2026-07-02T10:00:00.000Z",
    },
    {
      ...base,
      id: "review:uci",
      dedupeKey: "merge|san",
      expectedMoveUci: "e2e4",
      expectedMoveSan: "e4",
      createdAt: "2026-07-02T08:00:00.000Z",
      updatedAt: "2026-07-02T08:00:00.000Z",
    },
  );
  assert.equal(uciPreferred.expectedMoveUci, "e2e4");
  assert.equal(uciPreferred.createdAt, "2026-07-02T08:00:00.000Z");

  const upserted = upsertDailyBlundrReviewCards([base], [incoming, incoming]);
  assert.equal(upserted.length, 1);
  assert.equal(upserted[0].dedupeKey, base.dedupeKey);

  const uiCard = dailyBlundrReviewCardToDailyCard(incoming);
  assert.equal(uiCard.cardKey, sourceCard.cardKey);
  assert.equal(uiCard.reviewCardId, incoming.id);
  assert.equal(uiCard.reviewDedupeKey, incoming.dedupeKey);
  assert.equal(uiCard.reviewPromptKind, incoming.promptKind);
  assert.equal(uiCard.reviewStatus, incoming.status);
}

testDailyBlundrReviewCards();
console.log("dailyBlundrReviewCards ok");
