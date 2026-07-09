import { buildKingMoveCandidate } from "../miniGamePatternBuilders";
import { buildGeneratedMiniGameScenarioContract } from "../miniGameLegacyAdapter";
import { createGeneratorRandom } from "../miniGameCandidateFactory";
import { classifyMiniGameDifficulty } from "../miniGameDifficultyClassifier";
import { validateMiniGameObjective } from "../miniGameObjectiveValidation";
import { verifyMiniGameSolution } from "../miniGameSolutionVerifier";
import type { GeneratedMiniGameScenario, MiniGameGenerationInput, ProceduralMiniGameGenerator } from "../miniGameGenerationTypes";

function buildKingRaceFamilyCandidate(input: MiniGameGenerationInput, family: string) {
  const variants: Record<string, Parameters<typeof buildKingMoveCandidate>[1]> = {
    king_catches_pawn: {
      family,
      motif: "king catches pawn",
      goalDelta: [1, 1],
      prompt: "Guide the king to the key square before the pawn escapes.",
      instruction: "Move the king toward the key square.",
      goal: "Win the race to the key square.",
      explanation: "The king route and opposition decide the race.",
      conceptTags: ["king race", "opposition"],
      analysis: { complexity: 24, forcing: false, candidateCount: 4 },
    },
    king_cannot_catch_pawn: {
      family,
      motif: "king cannot catch pawn",
      goalDelta: [1, 0],
      prompt: "Find the move that keeps the king in the race.",
      instruction: "Improve the king's path.",
      goal: "Keep the king close enough to matter.",
      explanation: "The king still has to improve even when the pawn is far.",
      conceptTags: ["king race", "distance"],
      analysis: { complexity: 22, forcing: false, candidateCount: 4 },
    },
    key_square_race: {
      family,
      motif: "key square race",
      goalDelta: [0, 1],
      prompt: "Reach the key square first.",
      instruction: "Step to the key square.",
      goal: "Occupy the key square.",
      explanation: "Key-square geometry decides who arrives first.",
      conceptTags: ["key square", "king race"],
      analysis: { complexity: 28, forcing: true, candidateCount: 4 },
    },
    opposition_entry: {
      family,
      motif: "opposition entry",
      goalDelta: [1, 1],
      enemyKingSquare: "e7",
      prompt: "Take opposition and enter the square.",
      instruction: "Move the king into opposition.",
      goal: "Hold the opposition and enter.",
      explanation: "Opposition controls the entry point.",
      conceptTags: ["opposition", "king race"],
      analysis: { complexity: 30, forcing: true, candidateCount: 5 },
    },
    shouldering_path: {
      family,
      motif: "shouldering path",
      goalDelta: [1, 0],
      prompt: "Shoulder the enemy king aside and win the route.",
      instruction: "Move the king to shoulder the enemy path.",
      goal: "Close the enemy path.",
      explanation: "Shouldering keeps the opposing king from the key squares.",
      conceptTags: ["shouldering", "king race"],
      analysis: { complexity: 32, forcing: true, candidateCount: 5 },
    },
    outside_passer_race: {
      family,
      motif: "outside passer race",
      goalDelta: [1, 1],
      prompt: "Use the king to catch the outside passer.",
      instruction: "Improve the king's race against the passer.",
      goal: "Catch the outside passer.",
      explanation: "Outside passers pull the king into a long race.",
      conceptTags: ["outside passer", "king race"],
      analysis: { complexity: 36, forcing: false, candidateCount: 4 },
    },
    spare_tempo_race: {
      family,
      motif: "spare tempo race",
      goalDelta: [0, 1],
      prompt: "Find the spare tempo that wins the race.",
      instruction: "Use the spare tempo.",
      goal: "Keep the extra tempo.",
      explanation: "A spare tempo decides the king race.",
      conceptTags: ["tempo", "king race"],
      analysis: { complexity: 34, forcing: true, candidateCount: 5 },
    },
    stop_passer: {
      family,
      motif: "stop passer",
      goalDelta: [1, 1],
      prompt: "Stop the passer before it runs.",
      instruction: "Move the king to stop the passer.",
      goal: "Block the passer.",
      explanation: "The king must stop the pawn before promotion.",
      conceptTags: ["passed pawn", "king race"],
      analysis: { complexity: 38, forcing: true, candidateCount: 5 },
    },
  };
  return buildKingMoveCandidate(input, variants[family] ?? variants.king_catches_pawn);
}

export function buildKingCatchesPawnCandidate(input: MiniGameGenerationInput) {
  return buildKingRaceFamilyCandidate(input, "king_catches_pawn");
}

export function buildKingCannotCatchPawnCandidate(input: MiniGameGenerationInput) {
  return buildKingRaceFamilyCandidate(input, "king_cannot_catch_pawn");
}

export function buildKeySquareRaceCandidate(input: MiniGameGenerationInput) {
  return buildKingRaceFamilyCandidate(input, "key_square_race");
}

export function buildOppositionEntryCandidate(input: MiniGameGenerationInput) {
  return buildKingRaceFamilyCandidate(input, "opposition_entry");
}

export function buildShoulderingPathCandidate(input: MiniGameGenerationInput) {
  return buildKingRaceFamilyCandidate(input, "shouldering_path");
}

export function buildOutsidePasserRaceCandidate(input: MiniGameGenerationInput) {
  return buildKingRaceFamilyCandidate(input, "outside_passer_race");
}

export function buildSpareTempoRaceCandidate(input: MiniGameGenerationInput) {
  return buildKingRaceFamilyCandidate(input, "spare_tempo_race");
}

export function buildStopPasserCandidate(input: MiniGameGenerationInput) {
  return buildKingRaceFamilyCandidate(input, "stop_passer");
}

const KING_RACE_FAMILIES = [
  "king_catches_pawn",
  "king_cannot_catch_pawn",
  "key_square_race",
  "opposition_entry",
  "shouldering_path",
  "outside_passer_race",
  "spare_tempo_race",
  "stop_passer",
] as const;

export const kingRaceGenerator: ProceduralMiniGameGenerator = {
  id: "king_race",
  title: "King Race",
  summary: "Train king pathing, opposition, and pawn-race geometry.",
  displayName: "King Race",
  shortDescription: "Win the king race.",
  skillIds: ["king_pathing", "opposition", "goal_zone"],
  recommendedFor: ["easy", "medium", "hard"],
  instructions: "Move the king toward the key square and win the race.",
  estimatedSeconds: 36,
  tags: ["king", "race", "endgame"],
  canAppearInDailyBlundr: true,
  canAppearInStandalonePractice: true,
  selectionPriority: 10,
  generateCandidate(input: MiniGameGenerationInput) {
    const rng = createGeneratorRandom(input, "king_race:family");
    return buildKingRaceFamilyCandidate(input, rng.pick(KING_RACE_FAMILIES) ?? "king_catches_pawn");
  },
  validateObjective: validateMiniGameObjective,
  verifySolution: verifyMiniGameSolution,
  classifyDifficulty: classifyMiniGameDifficulty,
  buildFallbackScenario(input: MiniGameGenerationInput): GeneratedMiniGameScenario | null {
    const candidate = buildKingRaceFamilyCandidate(input, "king_catches_pawn") ?? buildKingRaceFamilyCandidate({ ...input, seed: `${input.seed}:fallback` }, "key_square_race");
    return candidate ? buildGeneratedMiniGameScenarioContract(candidate, {
      dateKey: input.dateKey,
      now: new Date().toISOString(),
      mastery: null,
      difficulty: "beginner",
      currentMastery: 0,
      confidence: 0,
      dueReviewCount: 0,
      selectedReviewCount: 0,
      recentMiniGameIds: [],
      recentFenKeys: [],
      sessionMiniGameIds: [],
      source: input.source,
      seed: input.seed,
      userIdOrLocalId: input.userId ?? null,
      recentScenarioKeys: input.recentScenarioKeys ?? [],
      boardPreferences: input.userBoardPreference ?? null,
      deckId: null,
      miniGameId: "king_race",
    }, kingRaceGenerator, true) : null;
  },
};
