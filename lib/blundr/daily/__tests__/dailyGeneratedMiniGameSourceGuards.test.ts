import assert from "node:assert/strict";

import { DAILY_MINI_GAME_REGISTRY } from "../miniGames/dailyMiniGameRegistry";
import { validateMiniGameScenario } from "../validation/dailyMiniGameValidation";
import { makeMiniGameContext } from "./dailyValidationFixtures";

for (const definition of DAILY_MINI_GAME_REGISTRY) {
  const dailyCard = definition.generate({
    ...makeMiniGameContext({
      seed: `source-guards-daily-${definition.id}`,
      source: "daily_deck",
      userIdOrLocalId: "source-guards-user",
    }),
    difficulty: definition.recommendedFor[0] ?? "beginner",
  });
  assert.ok(dailyCard?.miniGame.scenario);
  assert.equal(dailyCard?.miniGame.scenario?.source, "daily_deck");
  assert.ok(validateMiniGameScenario(dailyCard?.miniGame.scenario).valid);

  const standaloneCard = definition.generate({
    ...makeMiniGameContext({
      seed: `source-guards-standalone-${definition.id}`,
      source: "standalone_review",
      userIdOrLocalId: "source-guards-user",
    }),
    difficulty: definition.recommendedFor[0] ?? "beginner",
  });
  assert.ok(standaloneCard?.miniGame.scenario);
  assert.equal(standaloneCard?.miniGame.scenario?.source, "standalone_review");
  assert.ok(validateMiniGameScenario(standaloneCard?.miniGame.scenario).valid);
}

console.log("dailyGeneratedMiniGameSourceGuards ok");
