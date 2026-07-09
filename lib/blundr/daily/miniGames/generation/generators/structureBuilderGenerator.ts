import { buildGeneratedMiniGameScenarioContract } from "../miniGameLegacyAdapter";
import { createGeneratorRandom } from "../miniGameCandidateFactory";
import { classifyMiniGameDifficulty } from "../miniGameDifficultyClassifier";
import { validateMiniGameObjective } from "../miniGameObjectiveValidation";
import { verifyMiniGameSolution } from "../miniGameSolutionVerifier";
import type { GeneratedMiniGameScenario, MiniGameGenerationInput, ProceduralMiniGameGenerator } from "../miniGameGenerationTypes";
import { buildPawnMoveCandidate, buildKingMoveCandidate } from "../miniGamePatternBuilders";

const STRUCTURE_FAMILIES = [
  "french_break",
  "caro_kann_break",
  "minority_attack",
  "iqp_advance",
  "hanging_pawn_advance",
  "backward_pawn_repair",
  "passed_pawn_breakthrough",
  "locked_center_flank_break",
  "pawn_chain_base_attack",
  "structure_repair",
] as const;

function buildStructureFamilyCandidate(input: MiniGameGenerationInput, family: (typeof STRUCTURE_FAMILIES)[number]) {
  const configs = {
    french_break: () =>
      buildPawnMoveCandidate(input, {
        family,
        motif: "french pawn-chain break",
        from: "e6",
        to: "e5",
        color: "b",
        targetSquares: ["d4"],
        prompt: "Break the French pawn chain.",
        instruction: "Push the pawn to break the chain.",
        goal: "Open the center.",
        explanation: "The pawn break opens the French structure.",
        conceptTags: ["pawn structure", "break"],
        analysis: { complexity: 34, candidateCount: 4 },
      }),
    caro_kann_break: () =>
      buildPawnMoveCandidate(input, {
        family,
        motif: "caro kann central break",
        from: "c6",
        to: "c5",
        color: "b",
        targetSquares: ["d4"],
        prompt: "Break the Caro-Kann center.",
        instruction: "Push the central pawn break.",
        goal: "Open the center.",
        explanation: "The pawn break changes the central pawn skeleton.",
        conceptTags: ["pawn structure", "central break"],
        analysis: { complexity: 32, candidateCount: 4 },
      }),
    minority_attack: () =>
      buildPawnMoveCandidate(input, {
        family,
        motif: "minority attack",
        from: "b4",
        to: "b5",
        color: "w",
        targetSquares: ["c6"],
        prompt: "Start the minority attack.",
        instruction: "Push the pawn to start the minority attack.",
        goal: "Open files on the queenside.",
        explanation: "The pawn push starts the minority attack on the queenside.",
        conceptTags: ["minority attack", "pawn structure"],
        analysis: { complexity: 34, candidateCount: 4 },
      }),
    iqp_advance: () =>
      buildPawnMoveCandidate(input, {
        family,
        motif: "isolated queen pawn advance",
        from: "d4",
        to: "d5",
        color: "w",
        targetSquares: ["d5"],
        prompt: "Advance the isolated queen pawn.",
        instruction: "Push the isolated queen pawn.",
        goal: "Advance the IQP.",
        explanation: "The isolated queen pawn advances and changes the structure.",
        conceptTags: ["iqp", "pawn structure"],
        analysis: { complexity: 28, candidateCount: 4 },
      }),
    hanging_pawn_advance: () =>
      buildPawnMoveCandidate(input, {
        family,
        motif: "hanging pawn advance",
        from: "c4",
        to: "c5",
        color: "w",
        targetSquares: ["d5"],
        prompt: "Advance the hanging pawn pair.",
        instruction: "Push the pawn to improve the pair.",
        goal: "Advance the hanging pawn.",
        explanation: "The pawn push strengthens the hanging pawn structure.",
        conceptTags: ["hanging pawn", "pawn structure"],
        analysis: { complexity: 30, candidateCount: 4 },
      }),
    backward_pawn_repair: () =>
      buildKingMoveCandidate(input, {
        family,
        motif: "backward pawn repair",
        goalDelta: [1, 1],
        keySquare: "e4",
        prompt: "Repair the backward pawn structure.",
        instruction: "Move to repair the backward pawn.",
        goal: "Fix the weak pawn.",
        explanation: "The king move helps repair the pawn structure.",
        conceptTags: ["backward pawn", "repair"],
        analysis: { complexity: 22, candidateCount: 4 },
      }),
    passed_pawn_breakthrough: () =>
      buildPawnMoveCandidate(input, {
        family,
        motif: "passed pawn breakthrough",
        from: "e5",
        to: "e6",
        color: "w",
        targetSquares: ["e6"],
        prompt: "Break through to create the passed pawn.",
        instruction: "Push the pawn through the center.",
        goal: "Create the passed pawn.",
        explanation: "The pawn breakthrough opens the way to a passed pawn.",
        conceptTags: ["passed pawn", "breakthrough"],
        analysis: { complexity: 34, candidateCount: 5 },
      }),
    locked_center_flank_break: () =>
      buildPawnMoveCandidate(input, {
        family,
        motif: "locked center flank break",
        from: "g4",
        to: "g5",
        color: "w",
        targetSquares: ["d5"],
        prompt: "Break the locked center on the flank.",
        instruction: "Push the flank pawn to break the center.",
        goal: "Open the flank.",
        explanation: "The flank break opens the locked center structure.",
        conceptTags: ["flank break", "locked center"],
        analysis: { complexity: 32, candidateCount: 4 },
      }),
    pawn_chain_base_attack: () =>
      buildPawnMoveCandidate(input, {
        family,
        motif: "pawn-chain base attack",
        from: "f4",
        to: "f5",
        color: "w",
        targetSquares: ["e6"],
        prompt: "Attack the base of the pawn chain.",
        instruction: "Push the pawn to attack the base.",
        goal: "Attack the base pawn.",
        explanation: "The pawn push attacks the base of the chain.",
        conceptTags: ["pawn chain", "base attack"],
        analysis: { complexity: 30, candidateCount: 4 },
      }),
    structure_repair: () =>
      buildKingMoveCandidate(input, {
        family,
        motif: "structure repair",
        goalDelta: [1, 0],
        keySquare: "d5",
        prompt: "Repair the pawn structure.",
        instruction: "Move to improve the structure.",
        goal: "Repair the weakness.",
        explanation: "The king move helps repair the structure and support the pawns.",
        conceptTags: ["repair", "pawn structure"],
        analysis: { complexity: 24, candidateCount: 4 },
      }),
  } as const;

  return configs[family]();
}

export function buildFrenchPawnChainBreakCandidate(input: MiniGameGenerationInput) {
  return buildStructureFamilyCandidate(input, "french_break");
}
export function buildCaroKannCentralBreakCandidate(input: MiniGameGenerationInput) {
  return buildStructureFamilyCandidate(input, "caro_kann_break");
}
export function buildMinorityAttackCandidate(input: MiniGameGenerationInput) {
  return buildStructureFamilyCandidate(input, "minority_attack");
}
export function buildIqpAdvanceCandidate(input: MiniGameGenerationInput) {
  return buildStructureFamilyCandidate(input, "iqp_advance");
}
export function buildHangingPawnAdvanceCandidate(input: MiniGameGenerationInput) {
  return buildStructureFamilyCandidate(input, "hanging_pawn_advance");
}
export function buildBackwardPawnRepairCandidate(input: MiniGameGenerationInput) {
  return buildStructureFamilyCandidate(input, "backward_pawn_repair");
}
export function buildPassedPawnBreakthroughCandidate(input: MiniGameGenerationInput) {
  return buildStructureFamilyCandidate(input, "passed_pawn_breakthrough");
}
export function buildLockedCenterFlankBreakCandidate(input: MiniGameGenerationInput) {
  return buildStructureFamilyCandidate(input, "locked_center_flank_break");
}
export function buildPawnChainBaseAttackCandidate(input: MiniGameGenerationInput) {
  return buildStructureFamilyCandidate(input, "pawn_chain_base_attack");
}
export function buildStructureRepairCandidate(input: MiniGameGenerationInput) {
  return buildStructureFamilyCandidate(input, "structure_repair");
}

export const structureBuilderGenerator: ProceduralMiniGameGenerator = {
  id: "structure_builder",
  title: "Structure Builder",
  summary: "Train pawn-structure decisions and breaks.",
  displayName: "Structure Builder",
  shortDescription: "Build the right pawn structure.",
  skillIds: ["pawn_structure", "pawn_break", "isolated_pawn", "backward_pawn", "pawn_chain"],
  recommendedFor: ["easy", "medium", "hard"],
  instructions: "Choose the move that improves the pawn structure.",
  estimatedSeconds: 38,
  tags: ["pawn", "structure", "break"],
  canAppearInDailyBlundr: true,
  canAppearInStandalonePractice: true,
  selectionPriority: 10,
  generateCandidate(input: MiniGameGenerationInput) {
    const rng = createGeneratorRandom(input, "structure_builder:family");
    return buildStructureFamilyCandidate(input, rng.pick(STRUCTURE_FAMILIES) ?? "french_break");
  },
  validateObjective: validateMiniGameObjective,
  verifySolution: verifyMiniGameSolution,
  classifyDifficulty: classifyMiniGameDifficulty,
  buildFallbackScenario(input: MiniGameGenerationInput): GeneratedMiniGameScenario | null {
    const candidate = buildStructureFamilyCandidate(input, "french_break") ?? buildStructureFamilyCandidate({ ...input, seed: `${input.seed}:fallback` }, "structure_repair");
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
      miniGameId: "structure_builder",
    }, structureBuilderGenerator, true) : null;
  },
};
