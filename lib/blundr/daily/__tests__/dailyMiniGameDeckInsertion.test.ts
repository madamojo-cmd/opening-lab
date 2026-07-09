import assert from "node:assert/strict";

import { reconcileDailyBlundrSession } from "../dailyBlundrStorage";
import { generateMiniGameScenarioAsync } from "../miniGames/generation/generatedMiniGameRegistry";
import { DAILY_MINI_GAME_REGISTRY } from "../miniGames/dailyMiniGameRegistry";

void (async () => {
const dateKey = "2026-07-06:deck-insertion";
const now = "2026-07-06T12:10:00.000Z";

for (const definition of DAILY_MINI_GAME_REGISTRY) {
  const context = {
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
    source: "daily_deck" as const,
    seed: dateKey,
    userIdOrLocalId: "deck-insertion-user",
    boardPreferences: null,
    deckId: null,
    miniGameId: definition.id,
  };
  await generateMiniGameScenarioAsync({
    miniGameId: definition.id,
    seed: context.seed,
    difficulty: context.difficulty,
    source: context.source,
    userBoardPreference: context.boardPreferences,
    recentScenarioKeys: [],
    dateKey: context.dateKey,
    userId: context.userIdOrLocalId,
  });
  const card = definition.generate(context);

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
})();
