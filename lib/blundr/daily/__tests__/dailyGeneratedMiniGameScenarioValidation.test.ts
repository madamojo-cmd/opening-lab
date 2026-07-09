import assert from "node:assert/strict";

import { generateMiniGameScenarioAsync } from "../miniGames/generation/generatedMiniGameRegistry";
import { validateGeneratedMiniGameScenario } from "../miniGames/generation/miniGameScenarioValidation";
import { DAILY_MINI_GAME_REGISTRY } from "../miniGames/dailyMiniGameRegistry";
import { makeMiniGameContext } from "./dailyValidationFixtures";

void (async () => {
const baseContext = makeMiniGameContext({
  seed: "scenario-validation",
  source: "daily_deck",
  userIdOrLocalId: "scenario-validation-user",
});

for (const definition of DAILY_MINI_GAME_REGISTRY) {
  const scenario = await generateMiniGameScenarioAsync({
    miniGameId: definition.id,
    seed: baseContext.seed ?? baseContext.dateKey,
    difficulty: definition.recommendedFor[0] ?? "beginner",
    source: baseContext.source,
    userBoardPreference: baseContext.boardPreferences ?? null,
    recentScenarioKeys: baseContext.recentScenarioKeys ?? [],
    dateKey: baseContext.dateKey,
    userId: baseContext.userIdOrLocalId ?? null,
  });
  assert.ok(scenario, `Expected a generated scenario for ${definition.id}`);
  assert.ok(validateGeneratedMiniGameScenario(scenario).valid, `Expected a valid generated scenario for ${definition.id}`);
}

const standaloneScenario = await generateMiniGameScenarioAsync({
  miniGameId: DAILY_MINI_GAME_REGISTRY[0]!.id,
  seed: baseContext.seed ?? baseContext.dateKey,
  difficulty: DAILY_MINI_GAME_REGISTRY[0]!.recommendedFor[0] ?? "beginner",
  source: "standalone_review",
  userBoardPreference: baseContext.boardPreferences ?? null,
  recentScenarioKeys: baseContext.recentScenarioKeys ?? [],
  dateKey: baseContext.dateKey,
  userId: baseContext.userIdOrLocalId ?? null,
});
assert.ok(standaloneScenario);
assert.equal(standaloneScenario?.source, "standalone_review");
assert.ok(validateGeneratedMiniGameScenario(standaloneScenario).valid);

const referenceScenario = await generateMiniGameScenarioAsync({
  miniGameId: DAILY_MINI_GAME_REGISTRY[0]!.id,
  seed: baseContext.seed ?? baseContext.dateKey,
  difficulty: DAILY_MINI_GAME_REGISTRY[0]!.recommendedFor[0] ?? "beginner",
  source: baseContext.source,
  userBoardPreference: baseContext.boardPreferences ?? null,
  recentScenarioKeys: baseContext.recentScenarioKeys ?? [],
  dateKey: baseContext.dateKey,
  userId: baseContext.userIdOrLocalId ?? null,
});
assert.ok(referenceScenario);

const invalidSource = validateGeneratedMiniGameScenario({ ...referenceScenario, source: "bad_source" as never });
assert.ok(!invalidSource.valid);
assert.ok(invalidSource.issues.some((issue) => issue.code === "invalid_source"));

const invalidFen = validateGeneratedMiniGameScenario({
  ...referenceScenario,
  board: { ...referenceScenario.board, fen: "bad fen" },
});
assert.ok(!invalidFen.valid);
assert.ok(invalidFen.issues.some((issue) => issue.code === "invalid_fen"));

const emptyAcceptedMoves = validateGeneratedMiniGameScenario({
  ...referenceScenario,
  solution: { ...referenceScenario.solution, acceptedMoves: [] },
});
assert.ok(!emptyAcceptedMoves.valid);
assert.ok(emptyAcceptedMoves.issues.some((issue) => issue.code === "empty_accepted_moves"));

const missingExplanation = validateGeneratedMiniGameScenario({ ...referenceScenario, explanation: "" });
assert.ok(!missingExplanation.valid);
assert.ok(missingExplanation.issues.some((issue) => issue.code === "missing_explanation"));

const missingConceptTags = validateGeneratedMiniGameScenario({ ...referenceScenario, conceptTags: [] });
assert.ok(!missingConceptTags.valid);
assert.ok(missingConceptTags.issues.some((issue) => issue.code === "missing_concept_tags"));

console.log("dailyGeneratedMiniGameScenarioValidation ok");
})();
