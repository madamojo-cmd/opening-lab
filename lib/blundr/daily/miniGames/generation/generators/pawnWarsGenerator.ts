import { buildGeneratedMiniGameScenarioContract } from "../miniGameLegacyAdapter";
import { createGeneratorRandom } from "../miniGameCandidateFactory";
import { classifyMiniGameDifficulty } from "../miniGameDifficultyClassifier";
import { validateMiniGameObjective } from "../miniGameObjectiveValidation";
import { verifyMiniGameSolution } from "../miniGameSolutionVerifier";
import type { GeneratedMiniGameScenario, MiniGameGenerationInput, ProceduralMiniGameGenerator } from "../miniGameGenerationTypes";
import { buildKingMoveCandidate, buildPawnMoveCandidate } from "../miniGamePatternBuilders";

const PAWN_FAMILIES = [
  "basic_promotion_race",
  "outside_passer",
  "connected_passer_breakthrough",
  "protected_passer",
  "king_supports_pawn",
  "spare_tempo",
  "capture_choice",
  "square_of_pawn",
  "breakthrough_sacrifice",
  "hold_draw",
] as const;

function buildPawnWarsFamilyCandidate(input: MiniGameGenerationInput, family: (typeof PAWN_FAMILIES)[number]) {
  const configs = {
    basic_promotion_race: () =>
      buildPawnMoveCandidate(input, {
        family,
        motif: "basic promotion race",
        from: "e6",
        to: "e7",
        color: "w",
        targetSquares: ["e7"],
        prompt: "Win the basic promotion race.",
        instruction: "Push the pawn to the seventh rank.",
        goal: "Promote first.",
        explanation: "The pawn race gets closer to promotion.",
        conceptTags: ["promotion", "pawn race"],
        analysis: { complexity: 24, candidateCount: 4 },
      }),
    outside_passer: () =>
      buildPawnMoveCandidate(input, {
        family,
        motif: "outside passer",
        from: "h4",
        to: "h5",
        color: "w",
        targetSquares: ["h5"],
        prompt: "Create the outside passer.",
        instruction: "Push the outside pawn.",
        goal: "Create the outside passed pawn.",
        explanation: "The outside passer stretches the defender.",
        conceptTags: ["outside passer", "pawn race"],
        analysis: { complexity: 26, candidateCount: 4 },
      }),
    connected_passer_breakthrough: () =>
      buildPawnMoveCandidate(input, {
        family,
        motif: "connected passer breakthrough",
        from: "c4",
        to: "c5",
        color: "w",
        targetSquares: ["d5"],
        prompt: "Break through with the connected passers.",
        instruction: "Push the pawn to break through.",
        goal: "Create the connected passer breakthrough.",
        explanation: "The connected pawns break through together.",
        conceptTags: ["connected passer", "breakthrough"],
        analysis: { complexity: 30, candidateCount: 4 },
      }),
    protected_passer: () =>
      buildPawnMoveCandidate(input, {
        family,
        motif: "protected passer",
        from: "d4",
        to: "d5",
        color: "w",
        targetSquares: ["d5"],
        prompt: "Make the protected passer.",
        instruction: "Push the pawn with support.",
        goal: "Create a protected passer.",
        explanation: "The pawn is protected as it advances.",
        conceptTags: ["protected passer", "pawn race"],
        analysis: { complexity: 24, candidateCount: 4 },
      }),
    king_supports_pawn: () =>
      buildKingMoveCandidate(input, {
        family,
        motif: "king supports pawn",
        goalDelta: [1, 0],
        keySquare: "e5",
        prompt: "Bring the king to support the pawn.",
        instruction: "Move the king toward the pawn.",
        goal: "Support the pawn.",
        explanation: "The king supports the pawn race.",
        conceptTags: ["king support", "pawn race"],
        analysis: { complexity: 22, candidateCount: 4 },
      }),
    spare_tempo: () =>
      buildKingMoveCandidate(input, {
        family,
        motif: "spare tempo",
        goalDelta: [1, 1],
        keySquare: "e5",
        prompt: "Use the spare tempo in the race.",
        instruction: "Move the king with the spare tempo.",
        goal: "Win with tempo.",
        explanation: "The spare tempo decides the pawn race.",
        conceptTags: ["tempo", "pawn race"],
        analysis: { complexity: 28, forcing: true, candidateCount: 4 },
      }),
    capture_choice: () =>
      buildPawnMoveCandidate(input, {
        family,
        motif: "capture choice",
        from: "c4",
        to: "c5",
        color: "w",
        targetSquares: ["d5"],
        prompt: "Choose the capture that helps the race.",
        instruction: "Push the pawn to improve the capture choice.",
        goal: "Make the better capture choice.",
        explanation: "The pawn move prepares the capture choice in the race.",
        conceptTags: ["capture choice", "pawn race"],
        analysis: { complexity: 26, candidateCount: 4 },
      }),
    square_of_pawn: () =>
      buildPawnMoveCandidate(input, {
        family,
        motif: "square of the pawn",
        from: "e5",
        to: "e6",
        color: "w",
        targetSquares: ["e6"],
        prompt: "Use the square of the pawn.",
        instruction: "Push the pawn to the square of the pawn.",
        goal: "Occupy the square of the pawn.",
        explanation: "The square-of-the-pawn geometry supports the race.",
        conceptTags: ["square of the pawn", "pawn race"],
        analysis: { complexity: 28, candidateCount: 4 },
      }),
    breakthrough_sacrifice: () =>
      buildPawnMoveCandidate(input, {
        family,
        motif: "breakthrough sacrifice",
        from: "d4",
        to: "d5",
        color: "w",
        targetSquares: ["e5"],
        prompt: "Break through with the sacrificial pawn move.",
        instruction: "Push the pawn to force the breakthrough.",
        goal: "Force the breakthrough.",
        explanation: "The sacrifice opens the way for the pawn race.",
        conceptTags: ["breakthrough", "sacrifice"],
        analysis: { complexity: 34, forcing: true, candidateCount: 5 },
      }),
    hold_draw: () =>
      buildKingMoveCandidate(input, {
        family,
        motif: "hold the draw",
        goalDelta: [0, 1],
        keySquare: "e4",
        prompt: "Hold the draw in the pawn race.",
        instruction: "Move the king to hold the draw.",
        goal: "Keep the draw.",
        explanation: "The king move holds the draw in the pawn race.",
        conceptTags: ["draw", "pawn race"],
        analysis: { complexity: 22, candidateCount: 4 },
      }),
  } as const;

  return configs[family]();
}

export function buildBasicPromotionRaceCandidate(input: MiniGameGenerationInput) {
  return buildPawnWarsFamilyCandidate(input, "basic_promotion_race");
}
export function buildOutsidePasserCandidate(input: MiniGameGenerationInput) {
  return buildPawnWarsFamilyCandidate(input, "outside_passer");
}
export function buildConnectedPasserBreakthroughCandidate(input: MiniGameGenerationInput) {
  return buildPawnWarsFamilyCandidate(input, "connected_passer_breakthrough");
}
export function buildProtectedPasserCandidate(input: MiniGameGenerationInput) {
  return buildPawnWarsFamilyCandidate(input, "protected_passer");
}
export function buildKingSupportsPawnCandidate(input: MiniGameGenerationInput) {
  return buildPawnWarsFamilyCandidate(input, "king_supports_pawn");
}
export function buildSpareTempoCandidate(input: MiniGameGenerationInput) {
  return buildPawnWarsFamilyCandidate(input, "spare_tempo");
}
export function buildCaptureChoiceCandidate(input: MiniGameGenerationInput) {
  return buildPawnWarsFamilyCandidate(input, "capture_choice");
}
export function buildSquareOfPawnCandidate(input: MiniGameGenerationInput) {
  return buildPawnWarsFamilyCandidate(input, "square_of_pawn");
}
export function buildBreakthroughSacrificeCandidate(input: MiniGameGenerationInput) {
  return buildPawnWarsFamilyCandidate(input, "breakthrough_sacrifice");
}
export function buildHoldDrawCandidate(input: MiniGameGenerationInput) {
  return buildPawnWarsFamilyCandidate(input, "hold_draw");
}

export const pawnWarsGenerator: ProceduralMiniGameGenerator = {
  id: "pawn_wars",
  title: "Pawn Wars",
  summary: "Train pawn races, breakthroughs, and promotion timing.",
  displayName: "Pawn Wars",
  shortDescription: "Race the pawns.",
  skillIds: ["pawn_race", "promotion", "passed_pawn"],
  recommendedFor: ["easy", "medium", "hard"],
  instructions: "Choose the move that wins or stops the pawn race.",
  estimatedSeconds: 34,
  tags: ["pawn", "race", "promotion"],
  canAppearInDailyBlundr: true,
  canAppearInStandalonePractice: true,
  selectionPriority: 10,
  generateCandidate(input: MiniGameGenerationInput) {
    const rng = createGeneratorRandom(input, "pawn_wars:family");
    return buildPawnWarsFamilyCandidate(input, rng.pick(PAWN_FAMILIES) ?? "basic_promotion_race");
  },
  validateObjective: validateMiniGameObjective,
  verifySolution: verifyMiniGameSolution,
  classifyDifficulty: classifyMiniGameDifficulty,
  buildFallbackScenario(input: MiniGameGenerationInput): GeneratedMiniGameScenario | null {
    const candidate = buildPawnWarsFamilyCandidate(input, "basic_promotion_race") ?? buildPawnWarsFamilyCandidate({ ...input, seed: `${input.seed}:fallback` }, "hold_draw");
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
      miniGameId: "pawn_wars",
    }, pawnWarsGenerator, true) : null;
  },
};
