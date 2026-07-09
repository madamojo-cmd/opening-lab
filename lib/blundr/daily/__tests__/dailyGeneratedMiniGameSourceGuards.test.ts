import assert from "node:assert/strict";

import { buildMiniGameRunnerScenarioFromCard } from "@/components/review/MiniGamePracticeRunner";
import { generateMiniGameScenarioAsync } from "../miniGames/generation/generatedMiniGameRegistry";
import { DAILY_MINI_GAME_REGISTRY } from "../miniGames/dailyMiniGameRegistry";
import { createInitialMiniGameRunnerState } from "../miniGames/runner/miniGameRunnerState";
import { validateMiniGameScenario } from "../validation/dailyMiniGameValidation";
import { makeMiniGameContext } from "./dailyValidationFixtures";

void (async () => {
for (const definition of DAILY_MINI_GAME_REGISTRY) {
  const dailyContext = makeMiniGameContext({
    seed: `source-guards-daily-${definition.id}`,
    source: "daily_deck",
    userIdOrLocalId: "source-guards-user",
  });
  await generateMiniGameScenarioAsync({
    miniGameId: definition.id,
    seed: dailyContext.seed ?? dailyContext.dateKey,
    difficulty: definition.recommendedFor[0] ?? "beginner",
    source: dailyContext.source,
    userBoardPreference: dailyContext.boardPreferences ?? null,
    recentScenarioKeys: dailyContext.recentScenarioKeys ?? [],
    dateKey: dailyContext.dateKey,
    userId: dailyContext.userIdOrLocalId ?? null,
  });
  const dailyCard = definition.generate({
    ...dailyContext,
    difficulty: definition.recommendedFor[0] ?? "beginner",
  });
  assert.ok(dailyCard?.miniGame.scenario);
  assert.equal(dailyCard?.miniGame.scenario?.source, "daily_deck");
  assert.ok(validateMiniGameScenario(dailyCard?.miniGame.scenario).valid);

  const dailyRunnerScenario = buildMiniGameRunnerScenarioFromCard(dailyCard!);
  assert.ok(dailyRunnerScenario);
  const dailyInitialState = createInitialMiniGameRunnerState(dailyRunnerScenario);
  assert.equal(dailyInitialState.status, "idle");
  assert.equal(dailyInitialState.boardFen, dailyRunnerScenario?.board.fen);

  const standaloneContext = makeMiniGameContext({
    seed: `source-guards-standalone-${definition.id}`,
    source: "standalone_review",
    userIdOrLocalId: "source-guards-user",
  });
  await generateMiniGameScenarioAsync({
    miniGameId: definition.id,
    seed: standaloneContext.seed ?? standaloneContext.dateKey,
    difficulty: definition.recommendedFor[0] ?? "beginner",
    source: standaloneContext.source,
    userBoardPreference: standaloneContext.boardPreferences ?? null,
    recentScenarioKeys: standaloneContext.recentScenarioKeys ?? [],
    dateKey: standaloneContext.dateKey,
    userId: standaloneContext.userIdOrLocalId ?? null,
  });
  const standaloneCard = definition.generate({
    ...standaloneContext,
    difficulty: definition.recommendedFor[0] ?? "beginner",
  });
  assert.ok(standaloneCard?.miniGame.scenario);
  assert.equal(standaloneCard?.miniGame.scenario?.source, "standalone_review");
  assert.ok(validateMiniGameScenario(standaloneCard?.miniGame.scenario).valid);

  const standaloneRunnerScenario = buildMiniGameRunnerScenarioFromCard(standaloneCard!);
  assert.ok(standaloneRunnerScenario);
  const standaloneInitialState = createInitialMiniGameRunnerState(standaloneRunnerScenario);
  assert.equal(standaloneInitialState.status, "idle");
  assert.equal(standaloneInitialState.boardFen, standaloneRunnerScenario?.board.fen);
}

console.log("dailyGeneratedMiniGameSourceGuards ok");
})();
