import assert from "node:assert/strict";

import { generateMiniGameScenarioAsync } from "../miniGames/generation/generatedMiniGameRegistry";
import { DAILY_MINI_GAME_REGISTRY } from "../miniGames/dailyMiniGameRegistry";
import { makeMiniGameContext } from "./dailyValidationFixtures";

void (async () => {
function resolveScenarioKey(scenario: { scenarioKey?: string; novelty?: { scenarioKey?: string } } | null | undefined): string {
  return scenario?.scenarioKey ?? scenario?.novelty?.scenarioKey ?? "";
}

for (const definition of DAILY_MINI_GAME_REGISTRY) {
  const sameSeedContext = {
    ...makeMiniGameContext({
      seed: `seed-${definition.id}`,
      source: "daily_deck",
      userIdOrLocalId: "variability-user",
    }),
    difficulty: definition.recommendedFor[0] ?? "beginner",
  };

  const sameA = await generateMiniGameScenarioAsync({
    miniGameId: definition.id,
    seed: sameSeedContext.seed ?? sameSeedContext.dateKey,
    difficulty: sameSeedContext.difficulty,
    source: sameSeedContext.source,
    userBoardPreference: sameSeedContext.boardPreferences ?? null,
    recentScenarioKeys: sameSeedContext.recentScenarioKeys ?? [],
    dateKey: sameSeedContext.dateKey,
    userId: sameSeedContext.userIdOrLocalId ?? null,
  });
  const sameB = await generateMiniGameScenarioAsync({
    miniGameId: definition.id,
    seed: sameSeedContext.seed ?? sameSeedContext.dateKey,
    difficulty: sameSeedContext.difficulty,
    source: sameSeedContext.source,
    userBoardPreference: sameSeedContext.boardPreferences ?? null,
    recentScenarioKeys: sameSeedContext.recentScenarioKeys ?? [],
    dateKey: sameSeedContext.dateKey,
    userId: sameSeedContext.userIdOrLocalId ?? null,
  });
  assert.ok(sameA);
  assert.ok(sameB);
  assert.equal(resolveScenarioKey(sameA), resolveScenarioKey(sameB), `Expected same seed to reproduce the same scenario for ${definition.id}`);

  const variedScenarios = await Promise.all(
    ["alpha", "beta", "gamma", "delta"].map((seed) =>
      generateMiniGameScenarioAsync({
        miniGameId: definition.id,
        seed: `${seed}-${definition.id}`,
        difficulty: sameSeedContext.difficulty,
        source: sameSeedContext.source,
        userBoardPreference: sameSeedContext.boardPreferences ?? null,
        recentScenarioKeys: sameSeedContext.recentScenarioKeys ?? [],
        dateKey: sameSeedContext.dateKey,
        userId: sameSeedContext.userIdOrLocalId ?? null,
      }),
    ),
  );
  const variedKeys = new Set(variedScenarios.map((scenario) => resolveScenarioKey(scenario)));
  assert.ok(variedKeys.size > 1, `Expected different seeds to vary the scenario for ${definition.id}`);
}

console.log("dailyGeneratedMiniGameVariability ok");
})();
