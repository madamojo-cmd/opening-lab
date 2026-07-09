import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  GENERATED_MINI_GAME_GENERATORS,
  generateMiniGameScenario,
  getGeneratedMiniGameGenerator,
} from "../miniGames/generation/generatedMiniGameRegistry";
import { validateGeneratedMiniGameScenario } from "../miniGames/generation/miniGameScenarioValidation";

const ROOT = process.cwd();
const GENERATOR_FILES = [
  "lib/blundr/daily/miniGames/generation/generators/tacticShotsGenerator.ts",
  "lib/blundr/daily/miniGames/generation/generators/keySquareConquestGenerator.ts",
  "lib/blundr/daily/miniGames/generation/generators/structureBuilderGenerator.ts",
  "lib/blundr/daily/miniGames/generation/generators/imbalanceArenaGenerator.ts",
  "lib/blundr/daily/miniGames/generation/generators/techniqueLabGenerator.ts",
  "lib/blundr/daily/miniGames/generation/generators/kingRaceGenerator.ts",
  "lib/blundr/daily/miniGames/generation/generators/knightGymnasiumGenerator.ts",
  "lib/blundr/daily/miniGames/generation/generators/pawnWarsGenerator.ts",
] as const;

function makeInput(miniGameId: string, seed: string, source: "daily_deck" | "standalone_review" = "standalone_review") {
  return {
    miniGameId: miniGameId as never,
    seed,
    difficulty: "medium" as const,
    source,
    userBoardPreference: { boardOrientation: "white" as const },
    recentScenarioKeys: [] as string[],
    dateKey: "2026-07-09",
    userId: "architecture-user",
  };
}

assert.equal(GENERATED_MINI_GAME_GENERATORS.length, 8, "Expected eight procedural generators");

for (const file of GENERATOR_FILES) {
  assert.ok(fs.existsSync(path.join(ROOT, file)), `Missing generator file: ${file}`);
}

for (const generator of GENERATED_MINI_GAME_GENERATORS) {
  assert.equal(typeof generator.generateCandidate, "function", `${generator.id} is missing generateCandidate`);
  assert.equal(typeof generator.validateObjective, "function", `${generator.id} is missing validateObjective`);
  assert.equal(typeof generator.verifySolution, "function", `${generator.id} is missing verifySolution`);
  assert.equal(typeof generator.classifyDifficulty, "function", `${generator.id} is missing classifyDifficulty`);
  assert.equal(typeof generator.buildFallbackScenario, "function", `${generator.id} is missing buildFallbackScenario`);

  const scenario = generateMiniGameScenario(makeInput(generator.id, `architecture-${generator.id}`));
  assert.ok(scenario, `Expected a scenario for ${generator.id}`);
  assert.equal(scenario?.miniGameId, generator.id);
  assert.equal(scenario?.metadata.generatorKind, "procedural");
  assert.equal(scenario?.metadata.usedStaticFallback, false);
  assert.equal(scenario?.metadata.validationPassed, true);
  assert.equal(scenario?.metadata.objectiveValidationPassed, true);
  assert.equal(scenario?.metadata.solutionVerified, true);
  assert.ok(validateGeneratedMiniGameScenario(scenario).valid, `Expected a valid generated scenario for ${generator.id}`);
  assert.equal(scenario?.solution.verification.verified, true, `Expected verification metadata for ${generator.id}`);
}

const fallbackGenerator = getGeneratedMiniGameGenerator("king_race");
assert.ok(fallbackGenerator, "Expected king_race generator");

if (fallbackGenerator) {
  const mutable = fallbackGenerator as typeof fallbackGenerator & {
    generateCandidate: typeof fallbackGenerator.generateCandidate;
  };
  const originalGenerateCandidate = mutable.generateCandidate;
  try {
    mutable.generateCandidate = () => null;
    const fallbackScenario = generateMiniGameScenario(makeInput("king_race", "architecture-fallback", "daily_deck"));
    assert.ok(fallbackScenario, "Expected a fallback scenario when candidate generation fails");
    assert.equal(fallbackScenario?.metadata.usedStaticFallback, true, "Fallback scenario should be marked as static fallback");
    assert.equal(fallbackScenario?.metadata.generatorKind, "procedural");
    assert.ok(validateGeneratedMiniGameScenario(fallbackScenario).valid, "Fallback scenario should still validate");
  } finally {
    mutable.generateCandidate = originalGenerateCandidate;
  }
}

console.log("dailyMiniGameTrueGeneratorArchitecture.test.ts passed");
