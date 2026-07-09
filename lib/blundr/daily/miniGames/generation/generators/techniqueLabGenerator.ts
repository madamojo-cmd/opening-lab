import { buildGeneratedMiniGameScenarioContract } from "../miniGameLegacyAdapter";
import { createGeneratorRandom } from "../miniGameCandidateFactory";
import { classifyMiniGameDifficulty } from "../miniGameDifficultyClassifier";
import { validateTrainingQuality } from "../miniGameTrainingQualityGate";
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
        explanation: "Because the kings line up on the same file, direct opposition keeps the enemy king out.",
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
        explanation: "Because the king keeps the opposition from afar, the next king step stays under control.",
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
        explanation: "Because the king walks a triangle, it steals a tempo and gains the key square.",
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
        goal: "Hold the draw.",
        explanation: "Because the side to move is forced to waste tempo, zugzwang holds the draw.",
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
        explanation: "Because the rook sits behind the passed pawn, it supports the advance and the promotion race.",
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
        explanation: "Because the rook cuts off the enemy king, it blocks the pawn path and keeps control.",
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
        explanation: "Because the bridge square sets up the Lucena-like technique, it converts the rook ending.",
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
        explanation: "Because the rook holds the file, the Philidor-like defense keeps the draw intact.",
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
        explanation: "Because the outside passer stretches the defender, it supports the winning promotion race.",
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
        explanation: "Because the simplification converts the advantage, it turns the ending into a win.",
        conceptTags: ["simplification", "endgame"],
        analysis: { complexity: 24, candidateCount: 4 },
      }),
  } as const;

  return configs[family]();
}

function pickValidTechniqueFamilyCandidate(input: MiniGameGenerationInput, families: readonly (typeof TECHNIQUE_FAMILIES)[number][]) {
  const rng = createGeneratorRandom(input, "technique_lab:valid_pick");
  const validCandidates: NonNullable<ReturnType<typeof buildTechniqueFamilyCandidate>>[] = [];
  for (const family of families) {
    const candidate = buildTechniqueFamilyCandidate(input, family);
    if (!candidate) continue;
    if (!validateMiniGameObjective(candidate).passed) continue;
    if (!verifyMiniGameSolution(candidate).verified) continue;
    if (!validateTrainingQuality(candidate).passed) continue;
    validCandidates.push(candidate);
  }
  return validCandidates.length > 0 ? rng.pick(validCandidates) : null;
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
    return pickValidTechniqueFamilyCandidate(input, rng.shuffle(TECHNIQUE_FAMILIES)) ?? pickValidTechniqueFamilyCandidate(input, TECHNIQUE_FAMILIES);
  },
  validateObjective: validateMiniGameObjective,
  verifySolution: verifyMiniGameSolution,
  classifyDifficulty: classifyMiniGameDifficulty,
  buildFallbackScenario(input: MiniGameGenerationInput): GeneratedMiniGameScenario | null {
    const candidate =
      pickValidTechniqueFamilyCandidate(input, TECHNIQUE_FAMILIES) ??
      pickValidTechniqueFamilyCandidate({ ...input, seed: `${input.seed}:fallback` }, [...TECHNIQUE_FAMILIES].reverse() as typeof TECHNIQUE_FAMILIES);
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
