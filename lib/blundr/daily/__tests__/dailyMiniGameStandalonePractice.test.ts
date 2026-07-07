import assert from "node:assert/strict";

import { resetLocalAccountState, setLocalAccountCurrentUserId } from "../../accounts/localAccountStorage";
import { clearLocalLearningEvents, createLearningSessionId, recordLearningEvent } from "../../learning/learningEvents";
import { loadDailyBlundrOverview } from "../dailyBlundrReadModel";
import { loadBlundrProgressSummary } from "../../progress/progressSummaryService";

const userId = "mini-game-practice-user";
const now = "2026-07-06T12:20:00.000Z";

resetLocalAccountState(userId);
setLocalAccountCurrentUserId(userId);
clearLocalLearningEvents();

const before = loadDailyBlundrOverview(5);
recordLearningEvent({
  type: "move_correct",
  source: "review",
  sessionId: createLearningSessionId(),
  userId,
  createdAt: now,
  fen: "start",
  correct: true,
  metadata: {
    practiceMode: "mini_game",
    miniGameId: "king_race",
  },
});

const after = loadDailyBlundrOverview(5);
assert.equal(after.deck.cards.length, before.deck.cards.length);
assert.equal(after.currentSession?.deckFingerprint, before.currentSession?.deckFingerprint);

const summary = loadBlundrProgressSummary({ userId, now });
assert.equal(summary.trainingVolume.minigamesToday >= 1, true);
assert.equal(summary.trainingVolume.dailyBlundrToday, before.reviewAttempts.length);

console.log("dailyMiniGameStandalonePractice.test.ts passed");
