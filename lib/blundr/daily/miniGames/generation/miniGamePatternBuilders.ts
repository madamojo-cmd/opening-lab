import type { Square } from "@/lib/blundr/geometry/boardTypes";
import { ALL_SQUARES } from "@/lib/blundr/geometry/lineGeometry";
import { kingDistance } from "@/lib/blundr/geometry/squareUtils";
import { addPlacement, squareFromOffset, type PieceCode } from "./miniGamePiecePlacement";
import { buildCandidateFromPlacements, createGeneratorRandom } from "./miniGameCandidateFactory";
import type { MiniGameGenerationInput, GeneratedMiniGameDifficulty, MiniGameGenerationCandidate } from "./miniGameGenerationTypes";

function pickSafeKingSquare(
  rng: ReturnType<typeof createGeneratorRandom>,
  anchors: readonly Square[],
  preferred: readonly Square[],
): Square {
  const safePreferred = preferred.filter((square) => anchors.every((anchor) => kingDistance(square, anchor) > 1));
  if (safePreferred.length > 0) {
    return rng.pick(safePreferred) ?? safePreferred[0] ?? preferred[0] ?? "h8";
  }
  const safeAll = ALL_SQUARES.filter((square) => anchors.every((anchor) => kingDistance(square as Square, anchor) > 1)) as Square[];
  return rng.pick(safeAll) ?? preferred[0] ?? "h8";
}

export function buildKingMoveCandidate(
  input: MiniGameGenerationInput,
  config: {
    family: string;
    motif: string;
    goalDelta: readonly [number, number];
    pieceCount?: number;
    sideToMove?: "w" | "b";
    enemyKingSquare?: Square;
    extraPlacements?: readonly { square: Square; piece: PieceCode }[];
    prompt: string;
    instruction: string;
    goal: string;
    explanation: string;
    difficulty?: GeneratedMiniGameDifficulty;
    conceptTags: readonly string[];
    analysis?: Partial<MiniGameGenerationCandidate["analysis"]>;
    targetSquare?: Square;
    keySquare?: Square;
  },
): MiniGameGenerationCandidate | null {
  const rng = createGeneratorRandom(input, config.family);
  const whiteKing = rng.pick(["c3", "d3", "e3", "c4", "d4", "e4", "c5", "d5", "e5"]) ?? "d4";
  const goal = config.keySquare ?? squareFromOffset(whiteKing, config.goalDelta[0], config.goalDelta[1]) ?? whiteKing;
  const blackKing = config.enemyKingSquare ?? pickSafeKingSquare(rng, [whiteKing, goal], ["a8", "h8", "a1", "h1", "b7", "g7"]);
  const placements: Array<{ square: Square; piece: PieceCode }> = [];
  addPlacement(placements, whiteKing, "K");
  addPlacement(placements, blackKing, "k");
  if (config.targetSquare) {
    addPlacement(placements, config.targetSquare, config.sideToMove === "b" ? "P" : "p");
  } else {
    const pawnSquare = squareFromOffset(goal, rng.bool(0.5) ? 0 : 1, rng.bool(0.5) ? 2 : -2) ?? goal;
    addPlacement(placements, pawnSquare, config.sideToMove === "b" ? "p" : "P");
  }
  for (const extra of config.extraPlacements ?? []) addPlacement(placements, extra.square, extra.piece);
  const solutionTo = goal;
  const candidate = buildCandidateFromPlacements({
    miniGameId: input.miniGameId,
    source: input.source,
    seed: input.seed,
    family: config.family,
    motif: config.motif,
    difficulty: config.difficulty ?? input.difficulty,
    estimatedTimeSeconds: 34,
    placements,
    sideToMove: config.sideToMove ?? "w",
    orientation: input.userBoardPreference?.boardOrientation === "black" ? "black" : "white",
    prompt: config.prompt,
    instruction: config.instruction,
    goal: config.goal,
    explanation: config.explanation,
    solutionFrom: whiteKing,
    solutionTo,
    acceptedMoves: [`${whiteKing}${solutionTo}`],
    overlays: {
      targetSquares: config.targetSquare ? [config.targetSquare] : [goal],
      keySquares: config.keySquare ? [config.keySquare] : [goal],
      route: [whiteKing, solutionTo],
    },
    conceptTags: config.conceptTags,
    analysis: {
      complexity: config.analysis?.complexity ?? 24,
      decoyCount: config.analysis?.decoyCount ?? 0,
      blockerCount: config.analysis?.blockerCount ?? 0,
      routeLength: kingDistance(whiteKing, goal),
      forcing: Boolean(config.analysis?.forcing),
      candidateCount: config.analysis?.candidateCount ?? 4,
      note: config.family,
    },
  });
  return candidate;
}

export function buildKnightMoveCandidate(
  input: MiniGameGenerationInput,
  config: {
    family: string;
    motif: string;
    from: Square;
    to: Square;
    targetSquares: readonly Square[];
    extraPlacements?: readonly { square: Square; piece: PieceCode }[];
    prompt: string;
    instruction: string;
    goal: string;
    explanation: string;
    conceptTags: readonly string[];
    analysis?: Partial<MiniGameGenerationCandidate["analysis"]>;
  },
): MiniGameGenerationCandidate | null {
  const placements: Array<{ square: Square; piece: PieceCode }> = [];
  const rng = createGeneratorRandom(input, config.family);
  addPlacement(placements, rng.pick(["g1", "b1", "g2", "b2", "c3", "d3"]) ?? "g1", "K");
  addPlacement(placements, pickSafeKingSquare(rng, [config.from, config.to, ...config.targetSquares], ["h8", "a8", "g7", "b7", "f8", "a1"]), "k");
  addPlacement(placements, config.from, "N");
  for (const target of config.targetSquares) addPlacement(placements, target, rng.bool(0.5) ? "q" : "r");
  for (const extra of config.extraPlacements ?? []) addPlacement(placements, extra.square, extra.piece);
  return buildCandidateFromPlacements({
    miniGameId: input.miniGameId,
    source: input.source,
    seed: input.seed,
    family: config.family,
    motif: config.motif,
    difficulty: input.difficulty,
    estimatedTimeSeconds: 30,
    placements,
    sideToMove: "w",
    orientation: input.userBoardPreference?.boardOrientation === "black" ? "black" : "white",
    prompt: config.prompt,
    instruction: config.instruction,
    goal: config.goal,
    explanation: config.explanation,
    solutionFrom: config.from,
    solutionTo: config.to,
    acceptedMoves: [`${config.from}${config.to}`],
    overlays: {
      targetSquares: [...config.targetSquares],
      keySquares: [...config.targetSquares],
      route: [config.from, config.to],
    },
    conceptTags: config.conceptTags,
    analysis: {
      complexity: config.analysis?.complexity ?? 30,
      decoyCount: config.analysis?.decoyCount ?? 1,
      blockerCount: config.analysis?.blockerCount ?? 0,
      routeLength: 1,
      forcing: Boolean(config.analysis?.forcing),
      candidateCount: config.analysis?.candidateCount ?? 4,
      note: config.family,
    },
  });
}

export function buildSliderMoveCandidate(
  input: MiniGameGenerationInput,
  config: {
    family: string;
    motif: string;
    piece: "B" | "R" | "Q";
    from: Square;
    to: Square;
    targetSquares: readonly Square[];
    enemyKingSquare?: Square;
    blockerSquare?: Square;
    blockerPiece?: PieceCode;
    extraPlacements?: readonly { square: Square; piece: PieceCode }[];
    prompt: string;
    instruction: string;
    goal: string;
    explanation: string;
    conceptTags: readonly string[];
    analysis?: Partial<MiniGameGenerationCandidate["analysis"]>;
  },
): MiniGameGenerationCandidate | null {
  const placements: Array<{ square: Square; piece: PieceCode }> = [];
  const rng = createGeneratorRandom(input, config.family);
  addPlacement(placements, rng.pick(["g1", "b1", "g2", "b2", "c3", "d3"]) ?? "g1", "K");
  addPlacement(placements, config.enemyKingSquare ?? pickSafeKingSquare(rng, [config.from, config.to, ...config.targetSquares, ...(config.blockerSquare ? [config.blockerSquare] : [])], ["h8", "a8", "g7", "b7", "f8", "a1"]), "k");
  addPlacement(placements, config.from, config.piece);
  if (config.blockerSquare) addPlacement(placements, config.blockerSquare, config.blockerPiece ?? "P");
  for (const target of config.targetSquares) {
    if (config.enemyKingSquare && target === config.enemyKingSquare) continue;
    addPlacement(placements, target, rng.bool(0.5) ? "q" : "r");
  }
  for (const extra of config.extraPlacements ?? []) addPlacement(placements, extra.square, extra.piece);
  return buildCandidateFromPlacements({
    miniGameId: input.miniGameId,
    source: input.source,
    seed: input.seed,
    family: config.family,
    motif: config.motif,
    difficulty: input.difficulty,
    estimatedTimeSeconds: 34,
    placements,
    sideToMove: "w",
    orientation: input.userBoardPreference?.boardOrientation === "black" ? "black" : "white",
    prompt: config.prompt,
    instruction: config.instruction,
    goal: config.goal,
    explanation: config.explanation,
    solutionFrom: config.from,
    solutionTo: config.to,
    acceptedMoves: [`${config.from}${config.to}`],
    overlays: {
      targetSquares: [...config.targetSquares],
      keySquares: [...config.targetSquares],
      route: [config.from, config.to],
    },
    conceptTags: config.conceptTags,
    analysis: {
      complexity: config.analysis?.complexity ?? 34,
      decoyCount: config.analysis?.decoyCount ?? 1,
      blockerCount: config.analysis?.blockerCount ?? (config.blockerSquare ? 1 : 0),
      routeLength: 1,
      forcing: Boolean(config.analysis?.forcing),
      candidateCount: config.analysis?.candidateCount ?? 5,
      note: config.family,
    },
  });
}

export function buildPawnMoveCandidate(
  input: MiniGameGenerationInput,
  config: {
    family: string;
    motif: string;
    color?: "w" | "b";
    from: Square;
    to: Square;
    targetSquares: readonly Square[];
    extraPlacements?: readonly { square: Square; piece: PieceCode }[];
    prompt: string;
    instruction: string;
    goal: string;
    explanation: string;
    conceptTags: readonly string[];
    analysis?: Partial<MiniGameGenerationCandidate["analysis"]>;
  },
): MiniGameGenerationCandidate | null {
  const placements: Array<{ square: Square; piece: PieceCode }> = [];
  const rng = createGeneratorRandom(input, config.family);
  addPlacement(placements, rng.pick(["g1", "b1", "g2", "b2", "c3", "d3"]) ?? "g1", "K");
  addPlacement(placements, pickSafeKingSquare(rng, [config.from, config.to, ...config.targetSquares], ["h8", "a8", "g7", "b7", "f8", "a1"]), "k");
  addPlacement(placements, config.from, config.color === "b" ? "p" : "P");
  for (const extra of config.extraPlacements ?? []) addPlacement(placements, extra.square, extra.piece);
  return buildCandidateFromPlacements({
    miniGameId: input.miniGameId,
    source: input.source,
    seed: input.seed,
    family: config.family,
    motif: config.motif,
    difficulty: input.difficulty,
    estimatedTimeSeconds: 30,
    placements,
    sideToMove: config.color ?? "w",
    orientation: input.userBoardPreference?.boardOrientation === "black" ? "black" : "white",
    prompt: config.prompt,
    instruction: config.instruction,
    goal: config.goal,
    explanation: config.explanation,
    solutionFrom: config.from,
    solutionTo: config.to,
    acceptedMoves: [`${config.from}${config.to}`],
    overlays: {
      targetSquares: [...config.targetSquares],
      keySquares: [...config.targetSquares],
      route: [config.from, config.to],
    },
    conceptTags: config.conceptTags,
    analysis: {
      complexity: config.analysis?.complexity ?? 28,
      decoyCount: config.analysis?.decoyCount ?? 1,
      blockerCount: config.analysis?.blockerCount ?? 0,
      routeLength: 1,
      forcing: Boolean(config.analysis?.forcing),
      candidateCount: config.analysis?.candidateCount ?? 4,
      note: config.family,
    },
  });
}
