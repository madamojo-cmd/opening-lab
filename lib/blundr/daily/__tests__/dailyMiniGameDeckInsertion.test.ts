import assert from "node:assert/strict";

import { reconcileDailyBlundrSession } from "../dailyBlundrStorage";
import { DAILY_MINI_GAME_REGISTRY } from "../miniGames/dailyMiniGameRegistry";

const dateKey = "2026-07-06:deck-insertion";
const now = "2026-07-06T12:10:00.000Z";

for (const definition of DAILY_MINI_GAME_REGISTRY) {
  const card = definition.generate({
    dateKey,
    now,
    mastery: null,
    difficulty: definition.recommendedFor[0] ?? "beginner",
    currentMastery: 0.25,
    confidence: 0.25,
    dueReviewCount: 0,
    selectedReviewCount: 0,
    recentMiniGameIds: [],
    recentFenKeys: [],
    sessionMiniGameIds: [],
  });

  assert.ok(card);
  if (!card) continue;
  assert.equal(card.kind, "mini_game");
  assert.equal(card.miniGame.miniGameId, definition.id);

  const session = reconcileDailyBlundrSession({
    dateKey,
    deck: [card],
    existing: null,
  });

  assert.equal(session.cards.length, 1);
  assert.equal(session.cardOrder.length, 1);
  assert.equal(session.cards[0].id, card.id);
}

console.log("dailyMiniGameDeckInsertion.test.ts passed");
