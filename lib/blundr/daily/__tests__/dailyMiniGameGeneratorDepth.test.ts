import assert from "node:assert/strict";

import { generateMiniGameScenarioAsync } from "../miniGames/generation/generatedMiniGameRegistry";
import { DAILY_MINI_GAME_REGISTRY } from "../miniGames/dailyMiniGameRegistry";
import { makeMiniGameContext } from "./dailyValidationFixtures";

void (async () => {
  function resolveScenarioKey(
    scenario:
      | { scenarioKey?: string; novelty?: { scenarioKey?: string } }
      | null
      | undefined,
  ): string {
    return scenario?.scenarioKey ?? scenario?.novelty?.scenarioKey ?? "";
  }

  const shardIndex = Math.max(
    0,
    Number(process.env.BLUNDR_MINIGAME_DEPTH_SHARD_INDEX ?? "0"),
  );
  const shardCount = Math.max(
    1,
    Number(process.env.BLUNDR_MINIGAME_DEPTH_SHARD_COUNT ?? "1"),
  );
  const definitionsForShard = DAILY_MINI_GAME_REGISTRY.filter(
    (_, index) => index % shardCount === shardIndex,
  );

  for (const definition of definitionsForShard) {
    const difficulty = definition.recommendedFor[0] ?? "beginner";
    const unique100 = new Set<string>();
    const unique150 = new Set<string>();
    const unique250 = new Set<string>();

    for (let index = 0; index < 250; index += 1) {
      const scenario = await generateMiniGameScenarioAsync({
        miniGameId: definition.id,
        seed: `depth-${definition.id}-${index}`,
        difficulty,
        source: "daily_deck",
        userBoardPreference: { boardOrientation: "white" as const },
        recentScenarioKeys: [],
        dateKey: "2026-07-09",
        userId: "depth-user",
      });
      assert.ok(scenario, `Expected a generated scenario for ${definition.id}`);
      const key = resolveScenarioKey(scenario);
      unique250.add(key);
      if (index < 150) unique150.add(key);
      if (index < 100) unique100.add(key);
    }

    assert.ok(
      unique100.size >= 32,
      `Expected at least 32 unique scenario keys across 100 seeds for ${definition.id}, got ${unique100.size}`,
    );
    assert.ok(
      unique150.size >= 64,
      `Expected at least 64 unique scenario keys across 150 seeds for ${definition.id}, got ${unique150.size}`,
    );
    assert.ok(
      unique250.size >= 100,
      `Expected at least 100 unique scenario keys across 250 seeds for ${definition.id}, got ${unique250.size}`,
    );

    const sameSeedContext = makeMiniGameContext({
      seed: `depth-same-${definition.id}`,
      source: "daily_deck",
      userIdOrLocalId: "depth-user",
      difficulty,
    });
    const sameA = await generateMiniGameScenarioAsync({
      miniGameId: definition.id,
      seed: sameSeedContext.seed ?? sameSeedContext.dateKey,
      difficulty,
      source: sameSeedContext.source,
      userBoardPreference: sameSeedContext.boardPreferences ?? null,
      recentScenarioKeys: sameSeedContext.recentScenarioKeys ?? [],
      dateKey: sameSeedContext.dateKey,
      userId: sameSeedContext.userIdOrLocalId ?? null,
    });
    const sameB = await generateMiniGameScenarioAsync({
      miniGameId: definition.id,
      seed: sameSeedContext.seed ?? sameSeedContext.dateKey,
      difficulty,
      source: sameSeedContext.source,
      userBoardPreference: sameSeedContext.boardPreferences ?? null,
      recentScenarioKeys: sameSeedContext.recentScenarioKeys ?? [],
      dateKey: sameSeedContext.dateKey,
      userId: sameSeedContext.userIdOrLocalId ?? null,
    });
    assert.ok(sameA, `Expected a same-seed scenario for ${definition.id}`);
    assert.ok(
      sameB,
      `Expected a repeated same-seed scenario for ${definition.id}`,
    );
    assert.equal(
      resolveScenarioKey(sameA),
      resolveScenarioKey(sameB),
      `Expected same seed to reproduce the same scenario key for ${definition.id}`,
    );

    const differentA = await generateMiniGameScenarioAsync({
      miniGameId: definition.id,
      seed: `depth-different-a-${definition.id}`,
      difficulty,
      source: sameSeedContext.source,
      userBoardPreference: sameSeedContext.boardPreferences ?? null,
      recentScenarioKeys: sameSeedContext.recentScenarioKeys ?? [],
      dateKey: sameSeedContext.dateKey,
      userId: sameSeedContext.userIdOrLocalId ?? null,
    });
    const differentB = await generateMiniGameScenarioAsync({
      miniGameId: definition.id,
      seed: `depth-different-b-${definition.id}`,
      difficulty,
      source: sameSeedContext.source,
      userBoardPreference: sameSeedContext.boardPreferences ?? null,
      recentScenarioKeys: sameSeedContext.recentScenarioKeys ?? [],
      dateKey: sameSeedContext.dateKey,
      userId: sameSeedContext.userIdOrLocalId ?? null,
    });
    assert.ok(
      differentA,
      `Expected a different-seed scenario for ${definition.id}`,
    );
    assert.ok(
      differentB,
      `Expected a different-seed scenario for ${definition.id}`,
    );
    assert.notEqual(
      resolveScenarioKey(differentA),
      resolveScenarioKey(differentB),
      `Expected different seeds to produce different scenario keys for ${definition.id}`,
    );
    assert.ok(
      differentA?.board.fen !== differentB?.board.fen ||
        differentA?.solution.primaryMoveUci !==
          differentB?.solution.primaryMoveUci ||
        differentA?.overlays.targetSquares?.join(",") !==
          differentB?.overlays.targetSquares?.join(","),
      `Expected different seeds to change board content or placement for ${definition.id}`,
    );
  }

  console.log(
    `dailyMiniGameGeneratorDepth.test.ts passed shard ${shardIndex + 1}/${shardCount}`,
  );
})();
