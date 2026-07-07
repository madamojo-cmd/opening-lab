import assert from "node:assert/strict";

import { DAILY_MINI_GAME_REGISTRY } from "../miniGames/dailyMiniGameRegistry";
import { makeMiniGameContext } from "./dailyValidationFixtures";

function resolveScenarioKey(card: ReturnType<(typeof DAILY_MINI_GAME_REGISTRY)[number]["generate"]>): string {
  return card?.miniGame.scenario?.novelty.scenarioKey ?? card?.miniGame.noveltyKey ?? card?.cardKey ?? "";
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

  const sameA = definition.generate(sameSeedContext);
  const sameB = definition.generate(sameSeedContext);
  assert.ok(sameA);
  assert.ok(sameB);
  assert.equal(resolveScenarioKey(sameA), resolveScenarioKey(sameB), `Expected same seed to reproduce the same scenario for ${definition.id}`);

  const variedKeys = new Set(
    ["alpha", "beta", "gamma", "delta"].map((seed) =>
      resolveScenarioKey(
        definition.generate({
          ...sameSeedContext,
          seed: `${seed}-${definition.id}`,
        }),
      ),
    ),
  );
  assert.ok(variedKeys.size > 1, `Expected different seeds to vary the scenario for ${definition.id}`);
}

console.log("dailyGeneratedMiniGameVariability ok");
