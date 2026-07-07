import assert from "node:assert/strict";

import { DAILY_MINI_GAME_REGISTRY } from "../miniGames/dailyMiniGameRegistry";
import { validateMiniGameScenario } from "../validation/dailyMiniGameValidation";
import { makeMiniGameContext } from "./dailyValidationFixtures";

const baseContext = makeMiniGameContext({
  seed: "scenario-validation",
  source: "daily_deck",
  userIdOrLocalId: "scenario-validation-user",
});

for (const definition of DAILY_MINI_GAME_REGISTRY) {
  const card = definition.generate({
    ...baseContext,
    difficulty: definition.recommendedFor[0] ?? "beginner",
  });
  assert.ok(card, `Expected a generated card for ${definition.id}`);
  assert.ok(card?.miniGame.scenario, `Expected a generated scenario for ${definition.id}`);
  assert.ok(validateMiniGameScenario(card?.miniGame.scenario).valid, `Expected a valid generated scenario for ${definition.id}`);
}

const standaloneCard = DAILY_MINI_GAME_REGISTRY[0]!.generate({
  ...baseContext,
  source: "standalone_review",
  difficulty: DAILY_MINI_GAME_REGISTRY[0]!.recommendedFor[0] ?? "beginner",
});
assert.ok(standaloneCard?.miniGame.scenario);
assert.equal(standaloneCard?.miniGame.scenario?.source, "standalone_review");
assert.ok(validateMiniGameScenario(standaloneCard?.miniGame.scenario).valid);

const referenceScenario = DAILY_MINI_GAME_REGISTRY[0]!.generate({
  ...baseContext,
  difficulty: DAILY_MINI_GAME_REGISTRY[0]!.recommendedFor[0] ?? "beginner",
})!.miniGame.scenario!;

const invalidSource = validateMiniGameScenario({ ...referenceScenario, source: "bad_source" as never });
assert.ok(!invalidSource.valid);
assert.ok(invalidSource.issues.some((issue) => issue.code === "invalid_source"));

const invalidFen = validateMiniGameScenario({ ...referenceScenario, fen: "bad fen" });
assert.ok(!invalidFen.valid);
assert.ok(invalidFen.issues.some((issue) => issue.category === "fen"));

const emptyAcceptedMoves = validateMiniGameScenario({ ...referenceScenario, acceptedMoves: [] });
assert.ok(!emptyAcceptedMoves.valid);
assert.ok(emptyAcceptedMoves.issues.some((issue) => issue.code === "empty_accepted_moves"));

const missingExplanation = validateMiniGameScenario({ ...referenceScenario, explanation: "" });
assert.ok(!missingExplanation.valid);
assert.ok(missingExplanation.issues.some((issue) => issue.code === "missing_explanation"));

const missingConceptTags = validateMiniGameScenario({ ...referenceScenario, conceptTags: [] });
assert.ok(!missingConceptTags.valid);
assert.ok(missingConceptTags.issues.some((issue) => issue.code === "missing_concept_tags"));

console.log("dailyGeneratedMiniGameScenarioValidation ok");
