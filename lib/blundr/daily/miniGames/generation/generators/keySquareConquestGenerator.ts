import { buildGeneratedMiniGameScenarioContract } from "../miniGameLegacyAdapter";
import { createGeneratorRandom } from "../miniGameCandidateFactory";
import { classifyMiniGameDifficulty } from "../miniGameDifficultyClassifier";
import { validateMiniGameObjective } from "../miniGameObjectiveValidation";
import { verifyMiniGameSolution } from "../miniGameSolutionVerifier";
import type { GeneratedMiniGameScenario, MiniGameGenerationInput, ProceduralMiniGameGenerator } from "../miniGameGenerationTypes";
import { buildKingMoveCandidate, buildKnightMoveCandidate, buildSliderMoveCandidate, buildPawnMoveCandidate } from "../miniGamePatternBuilders";

const KEY_FAMILIES = [
  "knight_outpost",
  "rook_invasion",
  "king_entry",
  "passed_pawn_key_square",
  "blockade_square",
  "central_control_square",
  "weak_color_complex",
  "anchor_square",
] as const;

function buildKeySquareFamilyCandidate(input: MiniGameGenerationInput, family: (typeof KEY_FAMILIES)[number]) {
  const configs = {
    knight_outpost: () =>
      buildKnightMoveCandidate(input, {
        family,
        motif: "knight outpost",
        from: "f3",
        to: "e5",
        targetSquares: ["e5"],
        extraPlacements: [{ square: "d4", piece: "P" }],
        prompt: "Occupy the knight outpost.",
        instruction: "Jump the knight to the outpost.",
        goal: "Hold the outpost.",
        explanation: "The knight jump occupies a strong outpost square.",
        conceptTags: ["outpost", "key square"],
        analysis: { complexity: 28, candidateCount: 4 },
      }),
    rook_invasion: () =>
      buildSliderMoveCandidate(input, {
        family,
        motif: "rook invasion square",
        piece: "R",
        from: "e1",
        to: "e7",
        targetSquares: ["e7"],
        prompt: "Invade the key square with the rook.",
        instruction: "Move the rook to the invasion square.",
        goal: "Enter the invasion square.",
        explanation: "The rook occupies an invasion square and pressures the position.",
        conceptTags: ["invasion", "rook"],
        analysis: { complexity: 30, candidateCount: 4 },
      }),
    king_entry: () =>
      buildKingMoveCandidate(input, {
        family,
        motif: "king entry square",
        goalDelta: [1, 0],
        keySquare: "d5",
        prompt: "Enter the key square with the king.",
        instruction: "Move the king into the entry square.",
        goal: "Reach the entry square.",
        explanation: "The king step enters the decisive square.",
        conceptTags: ["king entry", "key square"],
        analysis: { complexity: 22, candidateCount: 4 },
      }),
    passed_pawn_key_square: () =>
      buildPawnMoveCandidate(input, {
        family,
        motif: "passed pawn key square",
        from: "d4",
        to: "d5",
        targetSquares: ["d5"],
        prompt: "Advance the passed pawn to the key square.",
        instruction: "Push the pawn to the key square.",
        goal: "Occupy the key square.",
        explanation: "The pawn advance claims the key square for the passer.",
        conceptTags: ["passed pawn", "key square"],
        analysis: { complexity: 28, candidateCount: 4 },
      }),
    blockade_square: () =>
      buildKnightMoveCandidate(input, {
        family,
        motif: "blockade square",
        from: "f3",
        to: "e5",
        targetSquares: ["d6"],
        prompt: "Blockade the pawn on the key square.",
        instruction: "Jump to the blockade square.",
        goal: "Hold the blockade.",
        explanation: "The knight jump blocks the important square.",
        conceptTags: ["blockade", "key square"],
        analysis: { complexity: 24, candidateCount: 4 },
      }),
    central_control_square: () =>
      buildKnightMoveCandidate(input, {
        family,
        motif: "central control square",
        from: "f3",
        to: "e5",
        targetSquares: ["e5", "d7"],
        prompt: "Control the center key square.",
        instruction: "Jump the knight to control the key square.",
        goal: "Control the center.",
        explanation: "The knight controls the central square and nearby lines.",
        conceptTags: ["center", "key square"],
        analysis: { complexity: 24, candidateCount: 4 },
      }),
    weak_color_complex: () =>
      buildSliderMoveCandidate(input, {
        family,
        motif: "weak color complex",
        piece: "B",
        from: "b1",
        to: "d3",
        targetSquares: ["d3"],
        prompt: "Occupy the weak color complex square.",
        instruction: "Move the bishop to the weak color square.",
        goal: "Occupy the square.",
        explanation: "The bishop claims the weak color complex square.",
        conceptTags: ["weak square", "color complex"],
        analysis: { complexity: 26, candidateCount: 4 },
      }),
    anchor_square: () =>
      buildKingMoveCandidate(input, {
        family,
        motif: "anchor square",
        goalDelta: [1, 1],
        keySquare: "e5",
        prompt: "Anchor the plan on the key square.",
        instruction: "Move to the anchor square.",
        goal: "Anchor the position.",
        explanation: "The king or piece anchors the plan on the key square.",
        conceptTags: ["anchor", "key square"],
        analysis: { complexity: 22, candidateCount: 4 },
      }),
  } as const;

  return configs[family]();
}

export function buildKnightOutpostCandidate(input: MiniGameGenerationInput) {
  return buildKeySquareFamilyCandidate(input, "knight_outpost");
}
export function buildRookInvasionCandidate(input: MiniGameGenerationInput) {
  return buildKeySquareFamilyCandidate(input, "rook_invasion");
}
export function buildKingEntryCandidate(input: MiniGameGenerationInput) {
  return buildKeySquareFamilyCandidate(input, "king_entry");
}
export function buildPassedPawnKeySquareCandidate(input: MiniGameGenerationInput) {
  return buildKeySquareFamilyCandidate(input, "passed_pawn_key_square");
}
export function buildBlockadeCandidate(input: MiniGameGenerationInput) {
  return buildKeySquareFamilyCandidate(input, "blockade_square");
}
export function buildCentralControlCandidate(input: MiniGameGenerationInput) {
  return buildKeySquareFamilyCandidate(input, "central_control_square");
}
export function buildWeakColorComplexCandidate(input: MiniGameGenerationInput) {
  return buildKeySquareFamilyCandidate(input, "weak_color_complex");
}
export function buildAnchorSquareCandidate(input: MiniGameGenerationInput) {
  return buildKeySquareFamilyCandidate(input, "anchor_square");
}

export const keySquareConquestGenerator: ProceduralMiniGameGenerator = {
  id: "key_square_conquest",
  title: "Key Square Conquest",
  summary: "Train control, occupation, and contesting of key squares.",
  displayName: "Key Square Conquest",
  shortDescription: "Occupy the square that changes the game.",
  skillIds: ["key_square_control", "outpost", "invasion_square", "king_entry", "blockade"],
  recommendedFor: ["easy", "medium", "hard"],
  instructions: "Choose the move that occupies or controls the decisive square.",
  estimatedSeconds: 34,
  tags: ["key square", "control", "occupation"],
  canAppearInDailyBlundr: true,
  canAppearInStandalonePractice: true,
  selectionPriority: 10,
  generateCandidate(input: MiniGameGenerationInput) {
    const rng = createGeneratorRandom(input, "key_square_conquest:family");
    return buildKeySquareFamilyCandidate(input, rng.pick(KEY_FAMILIES) ?? "knight_outpost");
  },
  validateObjective: validateMiniGameObjective,
  verifySolution: verifyMiniGameSolution,
  classifyDifficulty: classifyMiniGameDifficulty,
  buildFallbackScenario(input: MiniGameGenerationInput): GeneratedMiniGameScenario | null {
    const candidate = buildKeySquareFamilyCandidate(input, "knight_outpost") ?? buildKeySquareFamilyCandidate({ ...input, seed: `${input.seed}:fallback` }, "rook_invasion");
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
      miniGameId: "key_square_conquest",
    }, keySquareConquestGenerator, true, { skipValidation: true }) : null;
  },
};
