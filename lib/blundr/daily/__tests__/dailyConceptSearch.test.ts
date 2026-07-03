import assert from "node:assert/strict";

import { filterDailyConcepts, getConceptSuggestionsForMiniGame, getConceptSuggestionsForTrainingTarget, searchDailyConcepts } from "../concepts/dailyConceptSearch";

export function testDailyConceptSearch(): void {
  const searchResults = searchDailyConcepts("passed pawn");
  assert.ok(searchResults.some((concept) => concept.id === "concept:pawn_structures:passed_pawn"));
  assert.ok(searchResults.some((concept) => concept.id === "concept:special_techniques:outside_passed_pawn"));

  const pawnStructures = filterDailyConcepts({ domains: ["pawn_structures"] });
  assert.ok(pawnStructures.length >= 12);
  assert.ok(pawnStructures.every((concept) => concept.domain === "pawn_structures"));

  const miniGameSurface = filterDailyConcepts({ surfaces: ["mini_game"], limit: 5 });
  assert.equal(miniGameSurface.length, 5);
  assert.ok(miniGameSurface.every((concept) => concept.trainedBy.includes("mini_game")));

  const miniGameSuggestions = getConceptSuggestionsForMiniGame({
    miniGameId: "pawn_wars",
    skillIds: ["pawn_race", "promotion", "passed_pawn"],
  });
  assert.ok(miniGameSuggestions.includes("concept:pawn_structures:passed_pawn"));
  assert.ok(miniGameSuggestions.includes("concept:key_squares:promotion_square"));
  assert.ok(miniGameSuggestions.includes("concept:special_techniques:outside_passed_pawn"));

  const trainingTargetSuggestions = getConceptSuggestionsForTrainingTarget({
    trainingTargetId: "break_timing_drill",
    skillIds: ["break_timing", "pawn_break"],
  });
  assert.ok(trainingTargetSuggestions.includes("concept:tactical_ideas:pawn_break"));
  assert.ok(trainingTargetSuggestions.includes("concept:pawn_structures:open_center"));
  assert.ok(trainingTargetSuggestions.includes("concept:special_techniques:breakthrough"));
}

testDailyConceptSearch();
console.log("dailyConceptSearch ok");
