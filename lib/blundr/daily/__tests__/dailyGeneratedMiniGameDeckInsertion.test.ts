import assert from "node:assert/strict";
import { Chess } from "chess.js";

import { buildDailyBlundrDeck } from "../dailyBlundrDeckBuilder";
import { getDailyMiniGameDefinition } from "../miniGames/dailyMiniGameRegistry";
import { validateMiniGameScenario } from "../validation/dailyMiniGameValidation";
import type { LearningEvent } from "@/lib/blundr/learning/learningEvents";

const dateKey = "2026-07-06";
const now = "2026-07-06T12:10:00.000Z";
const baseFen = new Chess().fen();

const learningEvents: LearningEvent[] = [
  {
    id: "learn-event-1",
    type: "move_incorrect",
    source: "review",
    createdAt: now,
    sessionId: "session-1",
    userId: "deck-user",
    fen: baseFen,
    openingId: "test:king-pawn",
    openingName: "King Pawn",
    patternId: "test:king-pawn",
    concept: "development",
    expectedMoveSan: "e4",
    expectedMoveUci: "e2e4",
    playedMoveSan: "d4",
    playedMoveUci: "d2d4",
    correct: false,
    trainerView: "plain",
    metadata: { practiceMode: "mini_game" },
  },
  {
    id: "learn-event-2",
    type: "move_incorrect",
    source: "review",
    createdAt: now,
    sessionId: "session-2",
    userId: "deck-user",
    fen: baseFen,
    openingId: "test:queen-pawn",
    openingName: "Queen Pawn",
    patternId: "test:queen-pawn",
    concept: "structure",
    expectedMoveSan: "d4",
    expectedMoveUci: "d2d4",
    playedMoveSan: "e4",
    playedMoveUci: "e2e4",
    correct: false,
    trainerView: "plain",
    metadata: { practiceMode: "mini_game" },
  },
];

const deck = buildDailyBlundrDeck({
  progress: null,
  learningEvents,
  mastery: null,
  reviewCards: [],
  reviewAttempts: [],
  dateKey,
  now,
  limit: 5,
  userIdOrLocalId: "deck-user",
  recentScenarioKeys: [],
});

const deckAgain = buildDailyBlundrDeck({
  progress: null,
  learningEvents,
  mastery: null,
  reviewCards: [],
  reviewAttempts: [],
  dateKey,
  now,
  limit: 5,
  userIdOrLocalId: "deck-user",
  recentScenarioKeys: [],
});

assert.equal(deck.fingerprint, deckAgain.fingerprint);

const miniGameCards = deck.cards.filter((card) => card.kind === "mini_game");
assert.ok(miniGameCards.length >= 1, "Expected generated minigames to be inserted into the daily deck");

for (const card of miniGameCards) {
  assert.equal(card.miniGame.scenario?.source, "daily_deck");
  assert.ok(validateMiniGameScenario(card.miniGame.scenario).valid);

  const definition = getDailyMiniGameDefinition(card.miniGame.miniGameId);
  assert.ok(definition);
  const solutionUci = card.miniGame.scenario?.solution.uci ?? "";
  const result = definition?.advance?.(card.miniGame, {
    from: solutionUci.slice(0, 2),
    to: solutionUci.slice(2, 4),
    uci: solutionUci,
    san: card.miniGame.scenario?.solution.san ?? null,
    legal: true,
  });
  assert.ok(result?.completed, `Expected ${card.miniGame.miniGameId} to complete from the accepted move`);
  assert.equal(result?.won, true, `Expected ${card.miniGame.miniGameId} to win from the accepted move`);
}

console.log("dailyGeneratedMiniGameDeckInsertion ok");
