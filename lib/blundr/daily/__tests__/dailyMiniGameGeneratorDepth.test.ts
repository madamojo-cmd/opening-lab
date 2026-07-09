import assert from "node:assert/strict";

import { DAILY_MINI_GAME_REGISTRY } from "../miniGames/dailyMiniGameRegistry";
import { makeMiniGameContext } from "./dailyValidationFixtures";

function resolveScenarioKey(card: ReturnType<(typeof DAILY_MINI_GAME_REGISTRY)[number]["generate"]>): string {
  return card?.miniGame.scenario?.novelty.scenarioKey ?? card?.miniGame.noveltyKey ?? card?.cardKey ?? "";
}

for (const definition of DAILY_MINI_GAME_REGISTRY) {
  const difficulty = definition.recommendedFor[0] ?? "beginner";
  const unique100 = new Set<string>();
  const unique150 = new Set<string>();
  const unique250 = new Set<string>();

  for (let index = 0; index < 250; index += 1) {
    const card = definition.generate(
      makeMiniGameContext({
        seed: `depth-${definition.id}-${index}`,
        source: "daily_deck",
        userIdOrLocalId: "depth-user",
        difficulty,
      }),
    );
    assert.ok(card, `Expected a generated card for ${definition.id}`);
    const key = resolveScenarioKey(card);
    unique250.add(key);
    if (index < 150) unique150.add(key);
    if (index < 100) unique100.add(key);
  }

  assert.ok(
    unique100.size >= 32,
    `Expected at least 32 unique scenario keys across 100 seeds for ${definition.id}, got ${unique100.size}`,
  );
  assert.ok(unique150.size >= 64, `Expected at least 64 unique scenario keys across 150 seeds for ${definition.id}, got ${unique150.size}`);
  assert.ok(unique250.size >= 100, `Expected at least 100 unique scenario keys across 250 seeds for ${definition.id}, got ${unique250.size}`);

  const sameSeedContext = makeMiniGameContext({
    seed: `depth-same-${definition.id}`,
    source: "daily_deck",
    userIdOrLocalId: "depth-user",
    difficulty,
  });
  const sameA = definition.generate(sameSeedContext);
  const sameB = definition.generate(sameSeedContext);
  assert.ok(sameA, `Expected a same-seed card for ${definition.id}`);
  assert.ok(sameB, `Expected a repeated same-seed card for ${definition.id}`);
  assert.equal(resolveScenarioKey(sameA), resolveScenarioKey(sameB), `Expected same seed to reproduce the same scenario key for ${definition.id}`);

  const differentA = definition.generate({
    ...sameSeedContext,
    seed: `depth-different-a-${definition.id}`,
  });
  const differentB = definition.generate({
    ...sameSeedContext,
    seed: `depth-different-b-${definition.id}`,
  });
  assert.ok(differentA, `Expected a different-seed card for ${definition.id}`);
  assert.ok(differentB, `Expected a different-seed card for ${definition.id}`);
  assert.notEqual(resolveScenarioKey(differentA), resolveScenarioKey(differentB), `Expected different seeds to produce different scenario keys for ${definition.id}`);
  assert.ok(
    differentA?.miniGame.scenario?.fen !== differentB?.miniGame.scenario?.fen ||
      differentA?.miniGame.scenario?.solution?.uci !== differentB?.miniGame.scenario?.solution?.uci ||
      differentA?.miniGame.scenario?.targetSquares?.join(",") !== differentB?.miniGame.scenario?.targetSquares?.join(","),
    `Expected different seeds to change board content or placement for ${definition.id}`,
  );
}

console.log("dailyMiniGameGeneratorDepth.test.ts passed");
