import { buildGeneratedMiniGameScenarioContract } from "../miniGameLegacyAdapter";
import { createGeneratorRandom } from "../miniGameCandidateFactory";
import { classifyMiniGameDifficulty } from "../miniGameDifficultyClassifier";
import { validateMiniGameObjective } from "../miniGameObjectiveValidation";
import { verifyMiniGameSolution } from "../miniGameSolutionVerifier";
import type { GeneratedMiniGameScenario, MiniGameGenerationInput, ProceduralMiniGameGenerator } from "../miniGameGenerationTypes";
import { buildKingMoveCandidate, buildPawnMoveCandidate, buildSliderMoveCandidate } from "../miniGamePatternBuilders";

const TECHNIQUE_FAMILIES = [
  "direct_opposition",
  "distant_opposition",
  "triangulation",
  "zugzwang",
  "rook_behind_passed_pawn",
  "rook_cutoff",
  "lucena_like",
  "philidor_like",
  "outside_passer",
  "simplification",
] as const;

function buildTechniqueFamilyCandidate(input: MiniGameGenerationInput, family: (typeof TECHNIQUE_FAMILIES)[number]) {
  const configs = {
    direct_opposition: () =>
      buildKingMoveCandidate(input, {
        family,
        motif: "direct opposition",
        goalDelta: [1, 0],
        keySquare: "e5",
        enemyKingSquare: "e7",
        prompt: "Take direct opposition.",
        instruction: "Move the king into direct opposition.",
        goal: "Hold direct opposition.",
        explanation: "Direct opposition is the point of the endgame technique.",
        conceptTags: ["opposition", "king endgame"],
        analysis: { complexity: 22, candidateCount: 4 },
      }),
    distant_opposition: () =>
      buildKingMoveCandidate(input, {
        family,
        motif: "distant opposition",
        goalDelta: [1, 1],
        keySquare: "d5",
        enemyKingSquare: "d8",
        prompt: "Take distant opposition.",
        instruction: "Move the king toward distant opposition.",
        goal: "Hold distant opposition.",
        explanation: "Distant opposition sets up the next king step.",
        conceptTags: ["opposition", "distance"],
        analysis: { complexity: 24, candidateCount: 4 },
      }),
    triangulation: () =>
      buildKingMoveCandidate(input, {
        family,
        motif: "triangulation",
        goalDelta: [1, 1],
        keySquare: "e5",
        prompt: "Find the triangulation step.",
        instruction: "Triangulate with the king.",
        goal: "Use the spare tempo.",
        explanation: "The king route uses triangulation to gain a tempo.",
        conceptTags: ["triangulation", "king endgame"],
        analysis: { complexity: 30, forcing: true, candidateCount: 5 },
      }),
    zugzwang: () =>
      buildKingMoveCandidate(input, {
        family,
        motif: "zugzwang",
        goalDelta: [0, 1],
        keySquare: "e5",
        prompt: "Create the zugzwang position.",
        instruction: "Move the king into zugzwang geometry.",
        goal: "Force zugzwang.",
        explanation: "Zugzwang appears when the king move improves the position.",
        conceptTags: ["zugzwang", "endgame"],
        analysis: { complexity: 34, forcing: true, candidateCount: 5 },
      }),
    rook_behind_passed_pawn: () =>
      buildSliderMoveCandidate(input, {
        family,
        motif: "rook behind passed pawn",
        piece: "R",
        from: "e1",
        to: "e7",
        targetSquares: ["e7"],
        prompt: "Put the rook behind the passed pawn.",
        instruction: "Lift the rook behind the pawn.",
        goal: "Rook behind the passed pawn.",
        explanation: "The rook belongs behind the passed pawn.",
        conceptTags: ["rook endgame", "passed pawn"],
        analysis: { complexity: 28, candidateCount: 4 },
      }),
    rook_cutoff: () =>
      buildSliderMoveCandidate(input, {
        family,
        motif: "rook cutoff",
        piece: "R",
        from: "a1",
        to: "a7",
        targetSquares: ["g7"],
        prompt: "Cut off the king with the rook.",
        instruction: "Move the rook to cut off the king.",
        goal: "Keep the king cut off.",
        explanation: "The rook cuts off the enemy king from the pawn path.",
        conceptTags: ["rook cutoff", "endgame"],
        analysis: { complexity: 30, candidateCount: 4 },
      }),
    lucena_like: () =>
      buildSliderMoveCandidate(input, {
        family,
        motif: "lucena like",
        piece: "R",
        from: "a1",
        to: "a8",
        targetSquares: ["a7"],
        prompt: "Build the Lucena-like bridge.",
        instruction: "Move the rook into the bridge square.",
        goal: "Build the bridge.",
        explanation: "The bridge square sets up the Lucena-like technique.",
        conceptTags: ["lucena", "rook endgame"],
        analysis: { complexity: 36, forcing: true, candidateCount: 5 },
      }),
    philidor_like: () =>
      buildSliderMoveCandidate(input, {
        family,
        motif: "philidor like",
        piece: "R",
        from: "h1",
        to: "h6",
        targetSquares: ["h7"],
        prompt: "Set up the Philidor-like defense.",
        instruction: "Move the rook to the defensive file.",
        goal: "Hold the Philidor defense.",
        explanation: "The rook holds the file in Philidor-like style.",
        conceptTags: ["philidor", "rook endgame"],
        analysis: { complexity: 34, candidateCount: 5 },
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
        goal: "Create the passer.",
        explanation: "The outside passer stretches the defender.",
        conceptTags: ["outside passer", "endgame"],
        analysis: { complexity: 28, candidateCount: 4 },
      }),
    simplification: () =>
      buildKingMoveCandidate(input, {
        family,
        motif: "simplification into won ending",
        goalDelta: [1, 0],
        keySquare: "e5",
        prompt: "Simplify into the won ending.",
        instruction: "Move to the simplifying square.",
        goal: "Trade into the better ending.",
        explanation: "The simplification converts the advantage.",
        conceptTags: ["simplification", "endgame"],
        analysis: { complexity: 24, candidateCount: 4 },
      }),
  } as const;

  return configs[family]();
}

export function buildDirectOppositionCandidate(input: MiniGameGenerationInput) {
  return buildTechniqueFamilyCandidate(input, "direct_opposition");
}
export function buildDistantOppositionCandidate(input: MiniGameGenerationInput) {
  return buildTechniqueFamilyCandidate(input, "distant_opposition");
}
export function buildTriangulationCandidate(input: MiniGameGenerationInput) {
  return buildTechniqueFamilyCandidate(input, "triangulation");
}
export function buildZugzwangCandidate(input: MiniGameGenerationInput) {
  return buildTechniqueFamilyCandidate(input, "zugzwang");
}
export function buildRookBehindPassedPawnCandidate(input: MiniGameGenerationInput) {
  return buildTechniqueFamilyCandidate(input, "rook_behind_passed_pawn");
}
export function buildRookCutoffCandidate(input: MiniGameGenerationInput) {
  return buildTechniqueFamilyCandidate(input, "rook_cutoff");
}
export function buildLucenaLikeCandidate(input: MiniGameGenerationInput) {
  return buildTechniqueFamilyCandidate(input, "lucena_like");
}
export function buildPhilidorLikeCandidate(input: MiniGameGenerationInput) {
  return buildTechniqueFamilyCandidate(input, "philidor_like");
}
export function buildOutsidePasserCandidate(input: MiniGameGenerationInput) {
  return buildTechniqueFamilyCandidate(input, "outside_passer");
}
export function buildSimplificationCandidate(input: MiniGameGenerationInput) {
  return buildTechniqueFamilyCandidate(input, "simplification");
}

export const techniqueLabGenerator: ProceduralMiniGameGenerator = {
  id: "technique_lab",
  title: "Technique Lab",
  summary: "Train endgame and conversion technique.",
  displayName: "Technique Lab",
  shortDescription: "Train technique.",
  skillIds: ["conversion", "zugzwang", "triangulation", "rook_endgame", "mating_net"],
  recommendedFor: ["easy", "medium", "hard"],
  instructions: "Choose the move that improves the endgame technique.",
  estimatedSeconds: 36,
  tags: ["endgame", "technique", "conversion"],
  canAppearInDailyBlundr: true,
  canAppearInStandalonePractice: true,
  selectionPriority: 10,
  generateCandidate(input: MiniGameGenerationInput) {
    const rng = createGeneratorRandom(input, "technique_lab:family");
    return buildTechniqueFamilyCandidate(input, rng.pick(TECHNIQUE_FAMILIES) ?? "direct_opposition");
  },
  validateObjective: validateMiniGameObjective,
  verifySolution: verifyMiniGameSolution,
  classifyDifficulty: classifyMiniGameDifficulty,
  buildFallbackScenario(input: MiniGameGenerationInput): GeneratedMiniGameScenario | null {
    const candidate = buildTechniqueFamilyCandidate(input, "direct_opposition") ?? buildTechniqueFamilyCandidate({ ...input, seed: `${input.seed}:fallback` }, "simplification");
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
      miniGameId: "technique_lab",
    }, techniqueLabGenerator, true, { skipValidation: true }) : null;
  },
};
