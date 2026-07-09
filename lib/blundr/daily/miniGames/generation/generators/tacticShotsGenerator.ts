import { buildGeneratedMiniGameScenarioContract } from "../miniGameLegacyAdapter";
import { createGeneratorRandom } from "../miniGameCandidateFactory";
import { classifyMiniGameDifficulty } from "../miniGameDifficultyClassifier";
import { validateMiniGameObjective } from "../miniGameObjectiveValidation";
import { verifyMiniGameSolution } from "../miniGameSolutionVerifier";
import type { GeneratedMiniGameScenario, MiniGameGenerationInput, ProceduralMiniGameGenerator } from "../miniGameGenerationTypes";
import { buildKnightMoveCandidate, buildSliderMoveCandidate } from "../miniGamePatternBuilders";

const TACTIC_FAMILIES = [
  "knight_fork",
  "bishop_pin",
  "rook_skewer",
  "queen_double_attack",
  "discovered_attack",
  "back_rank",
  "deflection",
  "overloaded_defender",
  "removal_of_guard",
  "clearance_tactic",
] as const;

function buildTacticFamilyCandidate(input: MiniGameGenerationInput, family: (typeof TACTIC_FAMILIES)[number]) {
  const configs = {
    knight_fork: () =>
      buildKnightMoveCandidate(input, {
        family,
        motif: "knight fork",
        from: "f3",
        to: "e5",
        targetSquares: ["d7", "g6"],
        prompt: "Find the knight fork.",
        instruction: "Jump the knight to fork the targets.",
        goal: "Fork two targets at once.",
        explanation: "The knight jump creates a fork.",
        conceptTags: ["fork", "knight"],
        analysis: { complexity: 34, forcing: true, candidateCount: 5 },
      }),
    bishop_pin: () =>
      buildSliderMoveCandidate(input, {
        family,
        motif: "bishop pin",
        piece: "B",
        from: "b1",
        to: "d3",
        targetSquares: ["g6"],
        enemyKingSquare: "g6",
        blockerSquare: "e4",
        blockerPiece: "N",
        prompt: "Pin the piece with the bishop.",
        instruction: "Move the bishop to pin the target.",
        goal: "Establish a pin.",
        explanation: "The bishop line pins the piece and creates pressure.",
        conceptTags: ["pin", "bishop"],
        analysis: { complexity: 30, candidateCount: 4 },
      }),
    rook_skewer: () =>
      buildSliderMoveCandidate(input, {
        family,
        motif: "rook skewer",
        piece: "R",
        from: "e1",
        to: "d1",
        targetSquares: ["a1"],
        enemyKingSquare: "a1",
        blockerSquare: "c1",
        blockerPiece: "N",
        prompt: "Find the rook skewer.",
        instruction: "Lift the rook to skewer the target.",
        goal: "Skewer the valuable piece.",
        explanation: "The rook line skewers the piece on the file.",
        conceptTags: ["skewer", "rook"],
        analysis: { complexity: 32, candidateCount: 5 },
      }),
    queen_double_attack: () =>
      buildSliderMoveCandidate(input, {
        family,
        motif: "queen double attack",
        piece: "Q",
        from: "d1",
        to: "d4",
        targetSquares: ["e5", "d8"],
        prompt: "Create the queen double attack.",
        instruction: "Move the queen to attack both targets.",
        goal: "Hit two targets at once.",
        explanation: "The queen creates a double attack from the new square.",
        conceptTags: ["double attack", "queen"],
        analysis: { complexity: 28, candidateCount: 5 },
      }),
    discovered_attack: () =>
      buildSliderMoveCandidate(input, {
        family,
        motif: "discovered attack",
        piece: "Q",
        from: "d1",
        to: "h5",
        targetSquares: ["e8"],
        blockerSquare: "e4",
        blockerPiece: "N",
        prompt: "Open the discovered attack.",
        instruction: "Clear the line for the discovered attack.",
        goal: "Reveal the hidden attack.",
        explanation: "Moving the blocker reveals the slider behind it.",
        conceptTags: ["discovered attack", "clearance"],
        analysis: { complexity: 34, decoyCount: 1, blockerCount: 1, forcing: true, candidateCount: 5 },
      }),
    back_rank: () =>
      buildSliderMoveCandidate(input, {
        family,
        motif: "back rank tactic",
        piece: "R",
        from: "e1",
        to: "e8",
        targetSquares: ["g8"],
        enemyKingSquare: "g8",
        prompt: "Hit the back rank.",
        instruction: "Move the rook to the back rank.",
        goal: "Pressure the back rank king.",
        explanation: "The rook lands on the back rank and attacks the king.",
        conceptTags: ["back rank", "rook"],
        analysis: { complexity: 30, candidateCount: 4, forcing: true },
      }),
    deflection: () =>
      buildSliderMoveCandidate(input, {
        family,
        motif: "deflection",
        piece: "Q",
        from: "d1",
        to: "h5",
        targetSquares: ["e8"],
        blockerSquare: "e4",
        blockerPiece: "N",
        prompt: "Deflect the defender.",
        instruction: "Move the queen to deflect the guard.",
        goal: "Deflect the guard and attack the king.",
        explanation: "The move deflects the defender and opens the file.",
        conceptTags: ["deflection", "queen"],
        analysis: { complexity: 36, blockerCount: 1, forcing: true, candidateCount: 5 },
      }),
    overloaded_defender: () =>
      buildSliderMoveCandidate(input, {
        family,
        motif: "overloaded defender",
        piece: "Q",
        from: "d1",
        to: "d4",
        targetSquares: ["e5", "d8"],
        blockerSquare: "e4",
        blockerPiece: "N",
        prompt: "Exploit the overloaded defender.",
        instruction: "Attack the overloaded defender.",
        goal: "Win the overloaded defender.",
        explanation: "The defender has too many jobs and cannot hold them all.",
        conceptTags: ["overloaded", "defender"],
        analysis: { complexity: 34, blockerCount: 1, forcing: true, candidateCount: 5 },
      }),
    removal_of_guard: () =>
      buildSliderMoveCandidate(input, {
        family,
        motif: "removal of guard",
        piece: "Q",
        from: "d1",
        to: "h5",
        targetSquares: ["e8"],
        blockerSquare: "e4",
        blockerPiece: "N",
        prompt: "Remove the guard.",
        instruction: "Capture the guard and open the line.",
        goal: "Remove the guard from the target.",
        explanation: "The move removes the guard and exposes the target.",
        conceptTags: ["removal of guard", "tactic"],
        analysis: { complexity: 36, blockerCount: 1, forcing: true, candidateCount: 5 },
      }),
    clearance_tactic: () =>
      buildSliderMoveCandidate(input, {
        family,
        motif: "clearance tactic",
        piece: "B",
        from: "d2",
        to: "f4",
        targetSquares: ["e5"],
        blockerSquare: "d3",
        blockerPiece: "N",
        prompt: "Clear the line for the tactic.",
        instruction: "Move the blocker and clear the line.",
        goal: "Open the line for the attack.",
        explanation: "The blocker moves away and the line opens.",
        conceptTags: ["clearance", "tactic"],
        analysis: { complexity: 34, blockerCount: 1, forcing: true, candidateCount: 5 },
      }),
  } as const;

  return configs[family]();
}

export function buildKnightForkCandidate(input: MiniGameGenerationInput) {
  return buildTacticFamilyCandidate(input, "knight_fork");
}
export function buildPinCandidate(input: MiniGameGenerationInput) {
  return buildTacticFamilyCandidate(input, "bishop_pin");
}
export function buildSkewerCandidate(input: MiniGameGenerationInput) {
  return buildTacticFamilyCandidate(input, "rook_skewer");
}
export function buildDoubleAttackCandidate(input: MiniGameGenerationInput) {
  return buildTacticFamilyCandidate(input, "queen_double_attack");
}
export function buildDiscoveredAttackCandidate(input: MiniGameGenerationInput) {
  return buildTacticFamilyCandidate(input, "discovered_attack");
}
export function buildBackRankCandidate(input: MiniGameGenerationInput) {
  return buildTacticFamilyCandidate(input, "back_rank");
}
export function buildDeflectionCandidate(input: MiniGameGenerationInput) {
  return buildTacticFamilyCandidate(input, "deflection");
}
export function buildOverloadedDefenderCandidate(input: MiniGameGenerationInput) {
  return buildTacticFamilyCandidate(input, "overloaded_defender");
}
export function buildRemovalOfGuardCandidate(input: MiniGameGenerationInput) {
  return buildTacticFamilyCandidate(input, "removal_of_guard");
}
export function buildClearanceCandidate(input: MiniGameGenerationInput) {
  return buildTacticFamilyCandidate(input, "clearance_tactic");
}

export const tacticShotsGenerator: ProceduralMiniGameGenerator = {
  id: "tactic_shots",
  title: "Tactic Shots",
  summary: "Train tactical recognition from compact positions.",
  displayName: "Tactic Shots",
  shortDescription: "Spot the tactical shot.",
  skillIds: ["forks", "pins", "skewers", "discovered_attack", "back_rank", "overloaded_piece"],
  recommendedFor: ["easy", "medium", "hard"],
  instructions: "Choose the tactical shot that wins material or creates the strongest attack.",
  estimatedSeconds: 38,
  tags: ["tactical", "pattern", "shot"],
  canAppearInDailyBlundr: true,
  canAppearInStandalonePractice: true,
  selectionPriority: 10,
  generateCandidate(input: MiniGameGenerationInput) {
    const rng = createGeneratorRandom(input, "tactic_shots:family");
    return buildTacticFamilyCandidate(input, rng.pick(TACTIC_FAMILIES) ?? "knight_fork");
  },
  validateObjective: validateMiniGameObjective,
  verifySolution: verifyMiniGameSolution,
  classifyDifficulty: classifyMiniGameDifficulty,
  buildFallbackScenario(input: MiniGameGenerationInput): GeneratedMiniGameScenario | null {
    const candidate = buildTacticFamilyCandidate(input, "knight_fork") ?? buildTacticFamilyCandidate({ ...input, seed: `${input.seed}:fallback` }, "back_rank");
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
      miniGameId: "tactic_shots",
    }, tacticShotsGenerator, true, { skipValidation: true }) : null;
  },
};
