import { Chess } from "chess.js";
import type { Square } from "@/lib/blundr/geometry/boardTypes";
import { parseMiniGameBoard } from "./miniGameAttackMaps";
import { buildFenFromPieces, validateGeneratedFen, type MiniGamePiecePlacement } from "./miniGameFenBuilder";
import { createSeededRandom, resolveSeedParts } from "./miniGameSeededRandom";
import { listLegalMoves, moveToUci } from "./miniGameMoveRules";
import { buildGeneratedScenarioKey } from "./miniGameScenarioNovelty";
import { classifyMiniGameDifficulty } from "./miniGameDifficultyClassifier";
import type { GeneratedMiniGameDifficulty, MiniGameGenerationCandidate, MiniGameGenerationInput } from "./miniGameGenerationTypes";
import { buildProceduralMiniGameCard } from "./miniGameLegacyAdapter";
import { materialBalance } from "@/lib/blundr/geometry/materialUtils";

export type CandidatePlacementInput = {
  family: string;
  motif?: string;
  difficulty: GeneratedMiniGameDifficulty;
  estimatedTimeSeconds: number;
  placements: readonly MiniGamePiecePlacement[];
  sideToMove?: "w" | "b";
  prompt: string;
  instruction: string;
  goal: string;
  explanation: string;
  solutionFrom: Square;
  solutionTo: Square;
  solutionPromotion?: "q" | "r" | "b" | "n";
  acceptedMoves?: readonly string[];
  overlays?: MiniGameGenerationCandidate["overlays"];
  conceptTags: readonly string[];
  transformIds?: readonly string[];
  templateId?: string;
  scaffoldId?: string;
  analysis?: Partial<MiniGameGenerationCandidate["analysis"]>;
  moveSearchHint?: string;
};

function defaultAnalysis(candidate: MiniGameGenerationCandidate): MiniGameGenerationCandidate["analysis"] {
  return {
    complexity: candidate.analysis.complexity ?? 0,
    decoyCount: candidate.analysis.decoyCount ?? 0,
    blockerCount: candidate.analysis.blockerCount ?? 0,
    routeLength: candidate.analysis.routeLength ?? 1,
    forcing: Boolean(candidate.analysis.forcing),
    materialBalance: candidate.analysis.materialBalance ?? 0,
    candidateCount: candidate.analysis.candidateCount ?? 1,
    note: candidate.analysis.note,
  };
}

export function buildCandidateFromPlacements(input: CandidatePlacementInput & { miniGameId: MiniGameGenerationInput["miniGameId"]; source: MiniGameGenerationInput["source"]; seed: string | number; orientation?: "white" | "black"; recentScenarioKeys?: readonly string[] | null }): MiniGameGenerationCandidate | null {
  const sideToMove = input.sideToMove ?? "w";
  const fen = buildFenFromPieces(input.placements, sideToMove);
  if (!validateGeneratedFen(fen)) return null;

  const moveUci = `${input.solutionFrom}${input.solutionTo}${input.solutionPromotion ?? ""}`.toLowerCase();
  const acceptedMoves = Array.from(new Set([moveUci, ...(input.acceptedMoves ?? [])].map((move) => move.toLowerCase())));
  const board = parseMiniGameBoard(fen);
  const legalMoves = listLegalMoves(fen);
  if (!legalMoves.some((move) => moveToUci(move).toLowerCase() === moveUci)) return null;
  const applied = new Chess(fen).move({ from: input.solutionFrom as never, to: input.solutionTo as never, promotion: input.solutionPromotion as never });
  if (!applied) return null;

  const candidate: MiniGameGenerationCandidate = {
    miniGameId: input.miniGameId,
    source: input.source,
    seed: input.seed,
    family: input.family,
    motif: input.motif ?? input.family,
    difficulty: input.difficulty,
    estimatedTimeSeconds: input.estimatedTimeSeconds,
    board: {
      fen,
      orientation: input.orientation ?? "white",
      sideToMove,
      lockedOrientation: true,
    },
    prompt: input.prompt,
    instruction: input.instruction,
    goal: input.goal,
    explanation: input.explanation,
    solution: {
      primaryMoveUci: moveUci,
      acceptedMoves,
      from: input.solutionFrom,
      to: input.solutionTo,
      promotion: input.solutionPromotion,
      verification: {
        verified: true,
        verifier: "candidate-factory",
      },
    },
    overlays: {
      selectedSquares: input.overlays?.selectedSquares,
      targetSquares: input.overlays?.targetSquares,
      keySquares: input.overlays?.keySquares,
      dangerSquares: input.overlays?.dangerSquares,
      arrows: input.overlays?.arrows,
      route: input.overlays?.route,
      lastMove: input.overlays?.lastMove,
    },
    conceptTags: [...input.conceptTags],
    analysis: {
      complexity: input.analysis?.complexity ?? 10,
      decoyCount: input.analysis?.decoyCount ?? 0,
      blockerCount: input.analysis?.blockerCount ?? 0,
      routeLength: input.analysis?.routeLength ?? 1,
      forcing: Boolean(input.analysis?.forcing),
      materialBalance: input.analysis?.materialBalance ?? materialBalance(board),
      candidateCount: input.analysis?.candidateCount ?? Math.max(1, legalMoves.length),
      note: input.analysis?.note,
    },
    transformIds: [...(input.transformIds ?? [])],
    templateId: input.templateId,
    scaffoldId: input.scaffoldId,
  };

  candidate.difficulty = classifyMiniGameDifficulty(candidate);
  return candidate;
}

export function scoreCandidateNovelty(candidate: MiniGameGenerationCandidate, input: MiniGameGenerationInput): string {
  return buildGeneratedScenarioKey({
    miniGameId: input.miniGameId,
    source: input.source,
    family: candidate.family,
    motif: candidate.motif,
    fen: candidate.board.fen,
    primaryMoveUci: candidate.solution.primaryMoveUci,
    targetSquares: candidate.overlays.targetSquares ?? candidate.overlays.keySquares ?? [],
    difficulty: candidate.difficulty,
    orientation: candidate.board.orientation,
  });
}

export function createGeneratorRandom(input: MiniGameGenerationInput, label: string): ReturnType<typeof createSeededRandom> {
  return createSeededRandom(resolveSeedParts([input.seed, input.miniGameId, input.source, input.difficulty, label, input.dateKey, input.userId ?? "local"]));
}

export function withFallbackCandidate(candidate: MiniGameGenerationCandidate, input: MiniGameGenerationInput): MiniGameGenerationCandidate {
  return {
    ...candidate,
    metadataSeed: input.seed,
  } as never;
}

export function buildCandidateQuickStats(candidate: MiniGameGenerationCandidate): MiniGameGenerationCandidate["analysis"] {
  return defaultAnalysis(candidate);
}
