import { buildGeneratedMiniGameScenarioContract } from "../miniGameLegacyAdapter";
import { createGeneratorRandom } from "../miniGameCandidateFactory";
import { classifyMiniGameDifficulty } from "../miniGameDifficultyClassifier";
import { validateMiniGameObjective } from "../miniGameObjectiveValidation";
import { verifyMiniGameSolution } from "../miniGameSolutionVerifier";
import type { GeneratedMiniGameScenario, MiniGameGenerationInput, ProceduralMiniGameGenerator } from "../miniGameGenerationTypes";
import { buildKingMoveCandidate, buildKnightMoveCandidate, buildSliderMoveCandidate, buildPawnMoveCandidate } from "../miniGamePatternBuilders";

const IMBALANCE_FAMILIES = [
  "bishop_pair_open",
  "good_knight_bad_bishop",
  "rook_activity_open_file",
  "exchange_sac_compensation",
  "queen_vs_pieces",
  "space_advantage",
  "opposite_colored_bishop_attack",
  "material_down_initiative",
  "avoid_bad_trade",
  "favorable_trade",
] as const;

function buildImbalanceFamilyCandidate(input: MiniGameGenerationInput, family: (typeof IMBALANCE_FAMILIES)[number]) {
  const configs = {
    bishop_pair_open: () =>
      buildSliderMoveCandidate(input, {
        family,
        motif: "bishop pair in open position",
        piece: "B",
        from: "c4",
        to: "g8",
        targetSquares: ["d5"],
        prompt: "Use the bishop pair in the open position.",
        instruction: "Activate the bishop pair.",
        goal: "Exploit the bishop pair.",
        explanation: "The bishop pair works best in the open position.",
        conceptTags: ["bishop pair", "open position"],
        analysis: { complexity: 30, candidateCount: 4 },
      }),
    good_knight_bad_bishop: () =>
      buildKnightMoveCandidate(input, {
        family,
        motif: "good knight vs bad bishop",
        from: "f3",
        to: "e5",
        targetSquares: ["d7"],
        prompt: "Activate the good knight against the bad bishop.",
        instruction: "Jump the knight to the outpost.",
        goal: "Improve the knight against the bishop.",
        explanation: "The knight outpost makes the bishop worse.",
        conceptTags: ["knight", "bishop"],
        analysis: { complexity: 32, candidateCount: 4 },
      }),
    rook_activity_open_file: () =>
      buildSliderMoveCandidate(input, {
        family,
        motif: "rook activity on open file",
        piece: "R",
        from: "e1",
        to: "e7",
        targetSquares: ["e7"],
        prompt: "Activate the rook on the open file.",
        instruction: "Move the rook to the open file.",
        goal: "Occupy the open file.",
        explanation: "The rook becomes active on the open file.",
        conceptTags: ["rook activity", "open file"],
        analysis: { complexity: 28, candidateCount: 4 },
      }),
    exchange_sac_compensation: () =>
      buildSliderMoveCandidate(input, {
        family,
        motif: "exchange sacrifice compensation",
        piece: "R",
        from: "a1",
        to: "a8",
        targetSquares: ["g8"],
        prompt: "Find the exchange sacrifice.",
        instruction: "Sacrifice the exchange for compensation.",
        goal: "Gain compensation.",
        explanation: "The sacrifice opens lines and creates compensation.",
        conceptTags: ["exchange sac", "compensation"],
        analysis: { complexity: 42, forcing: true, candidateCount: 5 },
      }),
    queen_vs_pieces: () =>
      buildSliderMoveCandidate(input, {
        family,
        motif: "queen versus pieces",
        piece: "Q",
        from: "d1",
        to: "h5",
        targetSquares: ["e8", "g6"],
        prompt: "Play the queen against the pieces.",
        instruction: "Move the queen to create pressure.",
        goal: "Use the queen advantage.",
        explanation: "The queen pressures the minor pieces.",
        conceptTags: ["queen", "piece imbalance"],
        analysis: { complexity: 30, candidateCount: 5 },
      }),
    space_advantage: () =>
      buildPawnMoveCandidate(input, {
        family,
        motif: "space advantage",
        from: "d4",
        to: "d5",
        color: "w",
        targetSquares: ["e6"],
        prompt: "Claim more space.",
        instruction: "Push the pawn to gain space.",
        goal: "Increase space on the board.",
        explanation: "The pawn push claims central space.",
        conceptTags: ["space", "pawn"],
        analysis: { complexity: 22, candidateCount: 4 },
      }),
    opposite_colored_bishop_attack: () =>
      buildSliderMoveCandidate(input, {
        family,
        motif: "opposite colored bishop attack",
        piece: "B",
        from: "c4",
        to: "g8",
        targetSquares: ["d5"],
        prompt: "Attack with opposite-colored bishops.",
        instruction: "Move the bishop to the attacking diagonal.",
        goal: "Use the opposite-colored bishop attack.",
        explanation: "Opposite-colored bishops can still generate attack chances.",
        conceptTags: ["bishop", "opposite colors"],
        analysis: { complexity: 34, candidateCount: 4 },
      }),
    material_down_initiative: () =>
      buildQueenMoveCandidate(input, {
        family,
        motif: "material down with initiative",
        from: "d1",
        to: "h5",
        targetSquares: ["e8"],
        prompt: "Use initiative while down material.",
        instruction: "Move the queen aggressively.",
        goal: "Keep the initiative.",
        explanation: "The initiative compensates for the material deficit.",
        conceptTags: ["initiative", "material imbalance"],
        analysis: { complexity: 40, forcing: true, candidateCount: 5 },
      }),
    avoid_bad_trade: () =>
      buildKingMoveCandidate(input, {
        family,
        motif: "avoid bad trade",
        goalDelta: [1, 1],
        keySquare: "e5",
        prompt: "Avoid the bad trade.",
        instruction: "Make the move that avoids the bad trade.",
        goal: "Keep the stronger imbalance.",
        explanation: "The move avoids simplifying into a worse ending.",
        conceptTags: ["trade", "imbalance"],
        analysis: { complexity: 22, candidateCount: 4 },
      }),
    favorable_trade: () =>
      buildKnightMoveCandidate(input, {
        family,
        motif: "trade into favorable imbalance",
        from: "f3",
        to: "e5",
        targetSquares: ["d7"],
        prompt: "Trade into the favorable imbalance.",
        instruction: "Jump the knight to improve the trade.",
        goal: "Trade into the better ending.",
        explanation: "The trade leads to the favorable imbalance.",
        conceptTags: ["trade", "favorably imbalanced"],
        analysis: { complexity: 28, candidateCount: 4 },
      }),
  } as const;

  return configs[family]();
}

function buildQueenMoveCandidate(input: MiniGameGenerationInput, config: Parameters<typeof buildSliderMoveCandidate>[1]) {
  return buildSliderMoveCandidate(input, {
    ...config,
    piece: "Q",
  });
}

export function buildBishopPairCandidate(input: MiniGameGenerationInput) {
  return buildImbalanceFamilyCandidate(input, "bishop_pair_open");
}
export function buildGoodKnightBadBishopCandidate(input: MiniGameGenerationInput) {
  return buildImbalanceFamilyCandidate(input, "good_knight_bad_bishop");
}
export function buildRookActivityCandidate(input: MiniGameGenerationInput) {
  return buildImbalanceFamilyCandidate(input, "rook_activity_open_file");
}
export function buildExchangeSacCompensationCandidate(input: MiniGameGenerationInput) {
  return buildImbalanceFamilyCandidate(input, "exchange_sac_compensation");
}
export function buildQueenVsPiecesCandidate(input: MiniGameGenerationInput) {
  return buildImbalanceFamilyCandidate(input, "queen_vs_pieces");
}
export function buildSpaceAdvantageCandidate(input: MiniGameGenerationInput) {
  return buildImbalanceFamilyCandidate(input, "space_advantage");
}
export function buildOppositeColoredBishopAttackCandidate(input: MiniGameGenerationInput) {
  return buildImbalanceFamilyCandidate(input, "opposite_colored_bishop_attack");
}
export function buildMaterialDownInitiativeCandidate(input: MiniGameGenerationInput) {
  return buildImbalanceFamilyCandidate(input, "material_down_initiative");
}
export function buildAvoidBadTradeCandidate(input: MiniGameGenerationInput) {
  return buildImbalanceFamilyCandidate(input, "avoid_bad_trade");
}
export function buildFavorableTradeCandidate(input: MiniGameGenerationInput) {
  return buildImbalanceFamilyCandidate(input, "favorable_trade");
}

export const imbalanceArenaGenerator: ProceduralMiniGameGenerator = {
  id: "imbalance_arena",
  title: "Imbalance Arena",
  summary: "Train play according to material and positional imbalances.",
  displayName: "Imbalance Arena",
  shortDescription: "Use the imbalance.",
  skillIds: ["bishop_vs_knight", "rook_activity", "exchange_value", "material_imbalance", "color_complex"],
  recommendedFor: ["easy", "medium", "hard"],
  instructions: "Choose the move that best supports the imbalance.",
  estimatedSeconds: 40,
  tags: ["imbalance", "material", "activity"],
  canAppearInDailyBlundr: true,
  canAppearInStandalonePractice: true,
  selectionPriority: 10,
  generateCandidate(input: MiniGameGenerationInput) {
    const rng = createGeneratorRandom(input, "imbalance_arena:family");
    return buildImbalanceFamilyCandidate(input, rng.pick(IMBALANCE_FAMILIES) ?? "bishop_pair_open");
  },
  validateObjective: validateMiniGameObjective,
  verifySolution: verifyMiniGameSolution,
  classifyDifficulty: classifyMiniGameDifficulty,
  buildFallbackScenario(input: MiniGameGenerationInput): GeneratedMiniGameScenario | null {
    const candidate = buildImbalanceFamilyCandidate(input, "bishop_pair_open") ?? buildImbalanceFamilyCandidate({ ...input, seed: `${input.seed}:fallback` }, "rook_activity_open_file");
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
      miniGameId: "imbalance_arena",
    }, imbalanceArenaGenerator, true) : null;
  },
};
