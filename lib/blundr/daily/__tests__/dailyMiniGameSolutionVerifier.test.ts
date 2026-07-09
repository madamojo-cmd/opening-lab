import assert from "node:assert/strict";

import { generateMiniGameScenario, getGeneratedMiniGameGenerator } from "../miniGames/generation/generatedMiniGameRegistry";
import { verifyMiniGameSolution } from "../miniGames/generation/miniGameSolutionVerifier";
import type { MiniGameGenerationCandidate } from "../miniGames/generation/miniGameGenerationTypes";

function makeInput(miniGameId: MiniGameGenerationCandidate["miniGameId"], seed: string) {
  return {
    miniGameId,
    source: "standalone_review" as const,
    seed,
    difficulty: "medium" as const,
    userBoardPreference: { boardOrientation: "white" as const },
    recentScenarioKeys: [] as string[],
    dateKey: "2026-07-09",
    userId: "verifier-user",
  };
}

for (const miniGameId of [
  "tactic_shots",
  "key_square_conquest",
  "structure_builder",
  "imbalance_arena",
  "technique_lab",
  "king_race",
  "knight_gymnasium",
  "pawn_wars",
] as const) {
  const scenario = generateMiniGameScenario(makeInput(miniGameId, `verifier-${miniGameId}`));
  assert.ok(scenario, `Expected a scenario for ${miniGameId}`);
  assert.equal(scenario?.solution.verification.verified, true, `Expected verified solution for ${miniGameId}`);
  assert.ok(scenario?.solution.acceptedMoves.includes(scenario.solution.primaryMoveUci), `Primary move should be accepted for ${miniGameId}`);
  assert.ok(String(scenario?.solution.verification.verifier ?? "").length > 0, `Expected verifier name for ${miniGameId}`);
}

const kingRaceGenerator = getGeneratedMiniGameGenerator("king_race");
assert.ok(kingRaceGenerator, "Expected king_race generator");

const legalCandidate = kingRaceGenerator.generateCandidate(makeInput("king_race", "verifier-legal"));
assert.ok(legalCandidate, "Expected a legal generated candidate");

const verified = verifyMiniGameSolution(legalCandidate);
assert.equal(verified.verified, true, "Expected the legal candidate to verify");
assert.ok(verified.notes.length > 0, "Expected verification notes for the legal candidate");

const illegalAcceptedMovesCandidate = {
  ...legalCandidate,
  solution: {
    ...legalCandidate.solution,
    acceptedMoves: ["c3c4", "a1a1"],
  },
};
const rejected = verifyMiniGameSolution(illegalAcceptedMovesCandidate);
assert.equal(rejected.verified, false, "Expected an illegal accepted move to be rejected");
assert.equal(rejected.verifier, "illegal_accepted_move");

console.log("dailyMiniGameSolutionVerifier.test.ts passed");
