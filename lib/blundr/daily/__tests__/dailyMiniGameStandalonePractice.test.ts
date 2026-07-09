import assert from "node:assert/strict";

import { buildPracticeBundle } from "@/components/review/MiniGamePracticeRunner";
import { resetLocalAccountState, setLocalAccountCurrentUserId } from "../../accounts/localAccountStorage";
import { clearLocalLearningEvents, createLearningSessionId, recordLearningEvent } from "../../learning/learningEvents";
import { loadDailyBlundrOverview } from "../dailyBlundrReadModel";
import { loadBlundrProgressSummary } from "../../progress/progressSummaryService";
import { buildMiniGameRunnerScenarioFromCard } from "@/components/review/MiniGamePracticeRunner";
import { createInitialMiniGameRunnerState } from "../miniGames/runner/miniGameRunnerState";
import { waitForPracticeBundle } from "./dailyValidationFixtures";

void (async () => {
const userId = "mini-game-practice-user";
const now = new Date().toISOString();

resetLocalAccountState(userId);
setLocalAccountCurrentUserId(userId);
clearLocalLearningEvents();

const practiceBundle = await waitForPracticeBundle("king_race", 0, [], userId);
assert.ok(practiceBundle);
assert.equal(practiceBundle?.card.miniGame.scenario?.source, "standalone_review");
assert.equal(practiceBundle?.card.miniGame.completed, false);
assert.equal(practiceBundle?.card.miniGame.currentFen, practiceBundle?.card.miniGame.startFen);

const practiceScenario = buildMiniGameRunnerScenarioFromCard(practiceBundle!.card);
assert.ok(practiceScenario);
assert.equal(practiceScenario?.board.fen, practiceBundle?.card.miniGame.startFen);

const practiceState = createInitialMiniGameRunnerState(practiceScenario);
assert.equal(practiceState.status, "idle");
assert.equal(practiceState.boardFen, practiceScenario?.board.fen);

const nextPracticeBundle = await waitForPracticeBundle(
  "king_race",
  1,
  [practiceBundle?.card.miniGame.scenario?.novelty.scenarioKey ?? ""],
  userId,
);
assert.ok(nextPracticeBundle);
assert.notEqual(
  nextPracticeBundle?.card.miniGame.scenario?.novelty.scenarioKey,
  practiceBundle?.card.miniGame.scenario?.novelty.scenarioKey,
);

assert.equal(buildPracticeBundle("unknown_mini_game", 0, [], userId), null);

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
})();
