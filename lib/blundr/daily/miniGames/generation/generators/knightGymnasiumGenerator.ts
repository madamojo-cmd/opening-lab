import { buildGeneratedMiniGameScenarioContract } from "../miniGameLegacyAdapter";
import { createGeneratorRandom } from "../miniGameCandidateFactory";
import { classifyMiniGameDifficulty } from "../miniGameDifficultyClassifier";
import { validateMiniGameObjective } from "../miniGameObjectiveValidation";
import { verifyMiniGameSolution } from "../miniGameSolutionVerifier";
import type { GeneratedMiniGameScenario, MiniGameGenerationInput, ProceduralMiniGameGenerator } from "../miniGameGenerationTypes";
import { buildKnightMoveCandidate } from "../miniGamePatternBuilders";

const KNIGHT_FAMILIES = [
  "one_move_target",
  "one_move_fork",
  "two_step_route",
  "outpost_route",
  "defensive_jump",
  "trap_avoidance",
  "attack_key_square",
  "quiet_reroute",
] as const;

function buildKnightGymFamilyCandidate(input: MiniGameGenerationInput, family: (typeof KNIGHT_FAMILIES)[number]) {
  const configs = {
    one_move_target: {
      family,
      motif: "one move target",
      from: "f3",
      to: "e5",
      targetSquares: ["g4", "d7"],
      prompt: "Find the knight jump that lands on the target square.",
      instruction: "Jump the knight to the target square.",
      goal: "Occupy the target square.",
      explanation: "The knight move lands on the target and improves the route.",
      conceptTags: ["knight geometry", "target square"],
      analysis: { complexity: 22, candidateCount: 4 },
    },
    one_move_fork: {
      family,
      motif: "one move fork",
      from: "f3",
      to: "e5",
      targetSquares: ["d7", "g6"],
      prompt: "Find the forking knight jump.",
      instruction: "Jump the knight to fork the targets.",
      goal: "Fork both targets.",
      explanation: "The knight jump attacks two valuable pieces at once.",
      conceptTags: ["fork", "knight geometry"],
      analysis: { complexity: 34, forcing: true, candidateCount: 5 },
    },
    two_step_route: {
      family,
      motif: "two step route",
      from: "f3",
      to: "e5",
      targetSquares: ["c4", "g4"],
      prompt: "Start the two-step route.",
      instruction: "Start the knight route.",
      goal: "Shorten the route.",
      explanation: "The knight route becomes shorter after the jump.",
      conceptTags: ["route", "knight geometry"],
      analysis: { complexity: 28, candidateCount: 4 },
    },
    outpost_route: {
      family,
      motif: "outpost route",
      from: "f3",
      to: "e5",
      targetSquares: ["d7"],
      prompt: "Occupy the outpost square.",
      instruction: "Jump onto the outpost.",
      goal: "Hold the outpost.",
      explanation: "The knight belongs on the outpost square.",
      conceptTags: ["outpost", "knight geometry"],
      analysis: { complexity: 30, candidateCount: 4 },
    },
    defensive_jump: {
      family,
      motif: "defensive jump",
      from: "g1",
      to: "f3",
      targetSquares: ["e5"],
      prompt: "Use the defensive knight jump.",
      instruction: "Jump the knight defensively.",
      goal: "Cover the key square.",
      explanation: "The knight jump improves defense and control.",
      conceptTags: ["defense", "knight geometry"],
      analysis: { complexity: 24, candidateCount: 4 },
    },
    trap_avoidance: {
      family,
      motif: "trap avoidance",
      from: "g1",
      to: "f3",
      targetSquares: ["e5"],
      prompt: "Avoid the knight trap with the right jump.",
      instruction: "Jump the knight out of danger.",
      goal: "Avoid the trap.",
      explanation: "The knight leaves the trap and stays active.",
      conceptTags: ["trap avoidance", "knight geometry"],
      analysis: { complexity: 26, candidateCount: 4 },
    },
    attack_key_square: {
      family,
      motif: "attack key square",
      from: "f3",
      to: "e5",
      targetSquares: ["d7"],
      prompt: "Attack the key square with the knight.",
      instruction: "Jump to the attack square.",
      goal: "Attack the key square.",
      explanation: "The knight jump attacks the critical square.",
      conceptTags: ["key square", "knight geometry"],
      analysis: { complexity: 28, candidateCount: 4 },
    },
    quiet_reroute: {
      family,
      motif: "quiet reroute",
      from: "f3",
      to: "e5",
      targetSquares: ["d7"],
      prompt: "Quietly reroute the knight for the next tactic.",
      instruction: "Reroute the knight quietly.",
      goal: "Improve the route.",
      explanation: "The quiet knight jump prepares the next idea.",
      conceptTags: ["reroute", "knight geometry"],
      analysis: { complexity: 32, candidateCount: 5 },
    },
  } as const;

  return buildKnightMoveCandidate(input, configs[family]);
}

export function buildOneMoveTargetCandidate(input: MiniGameGenerationInput) {
  return buildKnightGymFamilyCandidate(input, "one_move_target");
}
export function buildOneMoveForkCandidate(input: MiniGameGenerationInput) {
  return buildKnightGymFamilyCandidate(input, "one_move_fork");
}
export function buildTwoStepRouteCandidate(input: MiniGameGenerationInput) {
  return buildKnightGymFamilyCandidate(input, "two_step_route");
}
export function buildOutpostRouteCandidate(input: MiniGameGenerationInput) {
  return buildKnightGymFamilyCandidate(input, "outpost_route");
}
export function buildDefensiveKnightJumpCandidate(input: MiniGameGenerationInput) {
  return buildKnightGymFamilyCandidate(input, "defensive_jump");
}
export function buildTrapAvoidanceCandidate(input: MiniGameGenerationInput) {
  return buildKnightGymFamilyCandidate(input, "trap_avoidance");
}
export function buildKnightAttacksKeySquareCandidate(input: MiniGameGenerationInput) {
  return buildKnightGymFamilyCandidate(input, "attack_key_square");
}
export function buildQuietRerouteCandidate(input: MiniGameGenerationInput) {
  return buildKnightGymFamilyCandidate(input, "quiet_reroute");
}

export const knightGymnasiumGenerator: ProceduralMiniGameGenerator = {
  id: "knight_gymnasium",
  title: "Knight Gymnasium",
  summary: "Train knight geometry, routes, and tactical jumps.",
  displayName: "Knight Gymnasium",
  shortDescription: "Train the knight.",
  skillIds: ["knight_geometry", "shortest_path", "outpost", "goal_zone"],
  recommendedFor: ["easy", "medium", "hard"],
  instructions: "Find the knight jump that improves the route or creates a tactic.",
  estimatedSeconds: 32,
  tags: ["knight", "geometry", "route"],
  canAppearInDailyBlundr: true,
  canAppearInStandalonePractice: true,
  selectionPriority: 10,
  generateCandidate(input: MiniGameGenerationInput) {
    const rng = createGeneratorRandom(input, "knight_gymnasium:family");
    return buildKnightGymFamilyCandidate(input, rng.pick(KNIGHT_FAMILIES) ?? "one_move_target");
  },
  validateObjective: validateMiniGameObjective,
  verifySolution: verifyMiniGameSolution,
  classifyDifficulty: classifyMiniGameDifficulty,
  buildFallbackScenario(input: MiniGameGenerationInput): GeneratedMiniGameScenario | null {
    const candidate = buildKnightGymFamilyCandidate(input, "one_move_target") ?? buildKnightGymFamilyCandidate({ ...input, seed: `${input.seed}:fallback` }, "one_move_fork");
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
      miniGameId: "knight_gymnasium",
    }, knightGymnasiumGenerator, true, { skipValidation: true }) : null;
  },
};
