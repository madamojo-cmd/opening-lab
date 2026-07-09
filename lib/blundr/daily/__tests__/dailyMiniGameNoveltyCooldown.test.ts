import assert from "node:assert/strict";

import { generateMiniGameScenarioAsync } from "../miniGames/generation/generatedMiniGameRegistry";
import { buildGeneratedScenarioKey, rankScenarioKeysByNovelty } from "../miniGames/generation/miniGameScenarioNovelty";

void (async () => {
const baseInput = {
  miniGameId: "king_race" as const,
  seed: "novelty-base",
  difficulty: "medium" as const,
  source: "daily_deck" as const,
  userBoardPreference: { boardOrientation: "white" as const },
  recentScenarioKeys: [] as string[],
  dateKey: "2026-07-09",
  userId: "novelty-user",
};

const firstDaily = await generateMiniGameScenarioAsync(baseInput);
assert.ok(firstDaily, "Expected an initial daily scenario");

const cooledDaily = await generateMiniGameScenarioAsync({
  ...baseInput,
  recentScenarioKeys: [firstDaily!.scenarioKey],
});
assert.ok(cooledDaily, "Expected a cooled scenario");
assert.notEqual(cooledDaily?.scenarioKey, firstDaily?.scenarioKey, "Expected the next scenario to avoid an immediate repeat");

const standalone = await generateMiniGameScenarioAsync({
  ...baseInput,
  source: "standalone_review",
  recentScenarioKeys: [firstDaily!.scenarioKey],
});
assert.ok(standalone, "Expected a standalone scenario");
assert.equal(standalone?.source, "standalone_review");
assert.notEqual(standalone?.scenarioKey, firstDaily?.scenarioKey, "Source separation should keep standalone keys distinct");

const dailyKey = buildGeneratedScenarioKey({
  miniGameId: firstDaily!.miniGameId,
  source: "daily_deck",
  family: firstDaily!.family,
  motif: firstDaily!.motif,
  fen: firstDaily!.board.fen,
  primaryMoveUci: firstDaily!.solution.primaryMoveUci,
  targetSquares: firstDaily!.overlays.targetSquares ?? [],
  difficulty: firstDaily!.difficulty,
  orientation: firstDaily!.board.orientation,
});
const standaloneKey = buildGeneratedScenarioKey({
  miniGameId: firstDaily!.miniGameId,
  source: "standalone_review",
  family: firstDaily!.family,
  motif: firstDaily!.motif,
  fen: firstDaily!.board.fen,
  primaryMoveUci: firstDaily!.solution.primaryMoveUci,
  targetSquares: firstDaily!.overlays.targetSquares ?? [],
  difficulty: firstDaily!.difficulty,
  orientation: firstDaily!.board.orientation,
});
assert.notEqual(dailyKey, standaloneKey, "Scenario keys must remain source-qualified");

const ranked = rankScenarioKeysByNovelty({
  candidateKeys: [
    { key: "candidate-a", index: 0 },
    { key: "candidate-b", index: 1 },
    { key: "candidate-c", index: 2 },
  ],
  recentScenarioKeys: ["candidate-b", "candidate-a", "candidate-c"],
});
assert.deepEqual(ranked, ["candidate-c", "candidate-a", "candidate-b"], "Expected least-recently-used ranking when the pool is exhausted");

console.log("dailyMiniGameNoveltyCooldown.test.ts passed");
})();
