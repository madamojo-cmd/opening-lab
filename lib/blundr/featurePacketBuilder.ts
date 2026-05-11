import { Chess } from "chess.js";

import { BLUNDR_ANIMATION_PACKAGES } from "./animationPackages";
import { BLUNDR_CONCEPTS } from "./concepts";
import { isBoardSquare } from "./squareUtils";
import type { Color, ExpectedActor, TrainingPhase } from "./types";
import {
  expectedActorForPhase,
  expectedMoveColorForActor,
  validateTrainingState,
  type TrainingStateValidation,
} from "./trainingStateMachine";

export type FeatureValueSource =
  | "chess.js"
  | "opening_book"
  | "explorer"
  | "stockfish"
  | "deterministic_rules"
  | "provided_app_state"
  | "fallback";

export type BookStatus = "in_book" | "book_complete" | "continuation";

export type StockfishSummary = {
  bestMove?: string;
  evalCp?: number;
  mate?: number;
  pv?: string[];
  multiPV?: { move: string; evalCp?: number; mate?: number; pv: string[] }[];
  pending?: boolean;
};

export type HumanExplorerMove = {
  move: string;
  frequency?: number;
  ratingBucket?: string;
};

export type ProvidedCandidateMove = {
  move: string;
  source: FeatureValueSource;
  label?: string;
};

export type ProvidedCandidateSquare = {
  square: string;
  source: FeatureValueSource;
  label?: string;
};

export type CandidateMoveProvenance = {
  move: string;
  source: FeatureValueSource;
  reason: string;
};

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export type BlundrFeaturePacket = {
  schemaVersion: "blundr-feature-packet-v0";
  fen: string;
  normalizedFen: string;
  moveHistory: string[];
  sideToMove: Color;
  userColor: Color;
  expectedActor: ExpectedActor;
  expectedMoveColor: Color | null;
  userRatingBucket: string;
  trainingPhase: TrainingPhase;
  openingName?: string;
  bookStatus?: BookStatus;
  expectedMove?: string;
  candidateMove?: string;
  legalMoves: string[];
  stockfish: {
    bestMove?: string;
    evalCp?: number;
    mate?: number;
    pv: string[];
    multiPV: { move: string; evalCp?: number; mate?: number; pv: string[] }[];
    pending?: boolean;
  };
  human?: {
    commonMoves: HumanExplorerMove[];
  };
  state: TrainingStateValidation;
  derived: {
    candidateMoves: string[];
    candidateArrows: [string, string][];
    candidateSquares: string[];
    candidateConcepts: string[];
    candidateAnimations: string[];
    centerSquares: string[];
    weakSquares: string[];
    attackedSquares: string[];
    defendedSquares: string[];
    kingDangerSquares: string[];
    pinnedPieces: string[];
    pawnBreaks: string[];
    isDevelopmentPosition: boolean;
    castlingAvailable: boolean;
    queenOutEarly: boolean;
    samePieceMovedTwice: boolean;
    lastMove?: { from: string; to: string; san?: string; uci?: string; by?: ExpectedActor };
    metadata?: {
      attack?: JsonValue;
      defense?: JsonValue;
      plan?: JsonValue;
    };
  };
  provenance: {
    fen: FeatureValueSource;
    normalizedFen: FeatureValueSource;
    sideToMove: FeatureValueSource;
    legalMoves: FeatureValueSource;
    trainingState: FeatureValueSource;
    candidateMoves: CandidateMoveProvenance[];
    candidateSquares: {
      square: string;
      source: FeatureValueSource;
      reason: string;
    }[];
  };
  debug: {
    source: "buildFeaturePacket";
    deterministic: true;
    warnings: string[];
  };
};

export type BuildFeaturePacketInput = {
  fen: string;
  normalizedFen?: string;
  moveHistory: string[];
  userColor: Color;
  userRatingBucket: string;
  trainingPhase: TrainingPhase;
  openingName?: string;
  bookStatus?: BookStatus;
  expectedMove?: string;
  candidateMove?: string;
  candidateMoves?: ProvidedCandidateMove[];
  candidateSquares?: ProvidedCandidateSquare[];
  stockfish?: StockfishSummary;
  humanMoves?: HumanExplorerMove[];
  attackedSquares?: string[];
  defendedSquares?: string[];
  kingDangerSquares?: string[];
  pinnedPieces?: string[];
  pawnBreaks?: string[];
  metadata?: {
    attack?: JsonValue;
    defense?: JsonValue;
    plan?: JsonValue;
  };
  lastMove?: { from: string; to: string; san?: string; uci?: string; by?: ExpectedActor };
};

type VerboseMove = {
  from: string;
  to: string;
  san: string;
  piece: string;
  flags: string;
  promotion?: string;
};

const CENTER_SQUARES = ["d4", "e4", "d5", "e5"] as const;

export function normalizeFen(fen: string): string {
  return fen.trim().split(/\s+/).slice(0, 4).join(" ");
}

function normalizeMove(move: string): string {
  return move.trim().toLowerCase();
}

function toUci(move: VerboseMove): string {
  return `${move.from}${move.to}${move.promotion ?? ""}`;
}

function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}

function normalizeStockfish(stockfish?: StockfishSummary): BlundrFeaturePacket["stockfish"] {
  return {
    bestMove: stockfish?.bestMove ? normalizeMove(stockfish.bestMove) : undefined,
    evalCp: stockfish?.evalCp,
    mate: stockfish?.mate,
    pv: (stockfish?.pv ?? []).map(normalizeMove),
    multiPV: (stockfish?.multiPV ?? []).map((entry) => ({
      move: normalizeMove(entry.move),
      evalCp: entry.evalCp,
      mate: entry.mate,
      pv: entry.pv.map(normalizeMove),
    })),
    pending: stockfish?.pending,
  };
}

function legalHumanMoves(
  humanMoves: HumanExplorerMove[] | undefined,
  legalMoveSet: Set<string>,
  warnings: string[]
): HumanExplorerMove[] | undefined {
  if (!humanMoves || humanMoves.length === 0) return undefined;

  const result: HumanExplorerMove[] = [];
  const seen = new Set<string>();
  for (const move of humanMoves) {
    const normalizedMove = normalizeMove(move.move);
    if (!legalMoveSet.has(normalizedMove)) {
      warnings.push(`Ignored non-legal explorer move: ${move.move}`);
      continue;
    }
    if (seen.has(normalizedMove)) continue;
    seen.add(normalizedMove);
    result.push({
      move: normalizedMove,
      frequency: move.frequency,
      ratingBucket: move.ratingBucket,
    });
  }

  return result.length > 0 ? result : undefined;
}

function safeSquares(values: string[] | undefined, warnings: string[], label: string): string[] {
  if (!values) return [];
  const squares: string[] = [];
  for (const value of values) {
    const square = value.trim().toLowerCase();
    if (!isBoardSquare(square)) {
      warnings.push(`Ignored invalid ${label} square: ${value}`);
      continue;
    }
    squares.push(square);
  }
  return unique(squares);
}

function normalizeLastMove(
  lastMove: BuildFeaturePacketInput["lastMove"],
  warnings: string[]
): BlundrFeaturePacket["derived"]["lastMove"] {
  if (!lastMove) return undefined;
  const from = lastMove.from.trim().toLowerCase();
  const to = lastMove.to.trim().toLowerCase();
  if (!isBoardSquare(from) || !isBoardSquare(to)) {
    warnings.push(`Ignored invalid lastMove: ${lastMove.from}${lastMove.to}`);
    return undefined;
  }
  return {
    from,
    to,
    san: lastMove.san,
    uci: lastMove.uci ? normalizeMove(lastMove.uci) : `${from}${to}`,
    by: lastMove.by,
  };
}

function isCastlingMove(move: VerboseMove): boolean {
  return move.san === "O-O" || move.san === "O-O-O" || move.flags.includes("k") || move.flags.includes("q");
}

function isPawnBreak(move: VerboseMove): boolean {
  return move.piece === "p" && CENTER_SQUARES.includes(move.to as (typeof CENTER_SQUARES)[number]);
}

function isQueenOutEarly(moveHistory: string[]): boolean {
  if (moveHistory.length > 12) return false;
  return moveHistory.some((move) => {
    const normalizedMove = move.trim();
    return normalizedMove.startsWith("Q") || normalizedMove.startsWith("d1") || normalizedMove.startsWith("d8");
  });
}

function isSamePieceMovedTwice(moveHistory: string[]): boolean {
  const origins = new Set<string>();
  for (const move of moveHistory) {
    const normalizedMove = normalizeMove(move);
    const from = normalizedMove.slice(0, 2);
    if (!isBoardSquare(from)) continue;
    if (origins.has(from)) return true;
    origins.add(from);
  }
  return false;
}

export function buildFeaturePacket(input: BuildFeaturePacketInput): BlundrFeaturePacket {
  const warnings: string[] = [];
  const game = new Chess(input.fen);
  const sideToMove = game.turn() as Color;
  const expectedActor = expectedActorForPhase(input.trainingPhase);
  const expectedMoveColor = expectedMoveColorForActor(expectedActor, input.userColor);
  const state = validateTrainingState({
    trainingPhase: input.trainingPhase,
    sideToMove,
    userColor: input.userColor,
  });

  const legalMovesVerbose = game.moves({ verbose: true }) as VerboseMove[];
  const legalMoves = legalMovesVerbose.map(toUci);
  const legalMoveSet = new Set(legalMoves);
  const verboseMoveByUci = new Map(legalMovesVerbose.map((move) => [toUci(move), move]));
  const stockfish = normalizeStockfish(input.stockfish);
  const candidateMoveProvenance: CandidateMoveProvenance[] = [];
  const candidateMoveSet = new Set<string>();

  function addCandidateMove(
    move: string | undefined,
    source: FeatureValueSource,
    reason: string
  ): void {
    if (!move) return;
    const normalizedMove = normalizeMove(move);
    if (!legalMoveSet.has(normalizedMove)) {
      warnings.push(`Ignored non-legal candidate move from ${source}: ${move}`);
      return;
    }
    if (candidateMoveSet.has(normalizedMove)) return;
    candidateMoveSet.add(normalizedMove);
    candidateMoveProvenance.push({ move: normalizedMove, source, reason });
  }

  if (input.expectedMove && input.bookStatus === "in_book") {
    addCandidateMove(input.expectedMove, "opening_book", "book expected move");
  }

  addCandidateMove(input.candidateMove, "provided_app_state", "provided candidate move");

  for (const candidate of input.candidateMoves ?? []) {
    addCandidateMove(candidate.move, candidate.source, candidate.label ?? "provided candidate move");
  }

  if (input.bookStatus === "continuation") {
    addCandidateMove(stockfish.bestMove, "stockfish", "continuation Stockfish best move");
  }

  for (const entry of stockfish.multiPV) {
    addCandidateMove(entry.move, "stockfish", "Stockfish MultiPV move");
  }

  const human = legalHumanMoves(input.humanMoves, legalMoveSet, warnings);
  for (const move of human ?? []) {
    addCandidateMove(move.move, "explorer", "human explorer common move");
  }

  if (candidateMoveSet.size === 0 && stockfish.pending) {
    warnings.push("Stockfish is pending; no legal fallback move was promoted as a candidate.");
  }

  if (candidateMoveSet.size === 0) {
    warnings.push("No provided legal candidate moves were available.");
  }

  const candidateMoves = Array.from(candidateMoveSet);
  const candidateArrows: [string, string][] = [];
  const candidateSquareProvenance: BlundrFeaturePacket["provenance"]["candidateSquares"] = [];
  const candidateSquares: string[] = [];

  function addCandidateSquare(
    square: string,
    source: FeatureValueSource,
    reason: string
  ): void {
    const normalizedSquare = square.trim().toLowerCase();
    if (!isBoardSquare(normalizedSquare)) {
      warnings.push(`Ignored invalid candidate square from ${source}: ${square}`);
      return;
    }
    if (!candidateSquares.includes(normalizedSquare)) {
      candidateSquares.push(normalizedSquare);
      candidateSquareProvenance.push({ square: normalizedSquare, source, reason });
    }
  }

  for (const move of candidateMoves) {
    const from = move.slice(0, 2);
    const to = move.slice(2, 4);
    if (isBoardSquare(from) && isBoardSquare(to)) {
      candidateArrows.push([from, to]);
      addCandidateSquare(from, "chess.js", "candidate move source square");
      addCandidateSquare(to, "chess.js", "candidate move destination square");
    }
  }

  for (const square of CENTER_SQUARES) {
    addCandidateSquare(square, "deterministic_rules", "center square");
  }

  const weakSquares = input.userColor === "w" ? ["f7"] : ["f2"];
  for (const square of weakSquares) {
    addCandidateSquare(square, "deterministic_rules", "common opening soft target");
  }

  for (const pvMove of stockfish.pv) {
    const to = pvMove.slice(2, 4);
    if (isBoardSquare(to)) {
      addCandidateSquare(to, "stockfish", "Stockfish PV destination square");
    }
  }

  for (const square of input.candidateSquares ?? []) {
    addCandidateSquare(square.square, square.source, square.label ?? "provided candidate square");
  }

  const pawnBreaks = unique([
    ...safeSquares(input.pawnBreaks, warnings, "pawn break"),
    ...candidateMoves
      .map((move) => verboseMoveByUci.get(move))
      .filter((move): move is VerboseMove => Boolean(move))
      .filter(isPawnBreak)
      .map((move) => move.to),
  ]);

  const castlingAvailable = legalMovesVerbose.some(isCastlingMove);
  const candidateConcepts = new Set<string>();
  const candidateAnimations = new Set<string>();

  candidateConcepts.add("quiet_development");
  candidateAnimations.add("quiet-development-glow");

  if (weakSquares.includes("f7")) {
    candidateConcepts.add("development_with_f7_pressure");
    candidateAnimations.add("diagonal-pressure-glow");
  }

  if (weakSquares.includes("f2")) {
    candidateConcepts.add("development_with_f2_pressure");
    candidateAnimations.add("diagonal-pressure-glow");
  }

  if (candidateMoves.some((move) => CENTER_SQUARES.includes(move.slice(2, 4) as (typeof CENTER_SQUARES)[number]))) {
    candidateConcepts.add("occupy_center");
    candidateAnimations.add("center-break-pulse");
  }

  if (
    candidateMoves
      .map((move) => verboseMoveByUci.get(move))
      .some((move) => move?.piece === "n" && CENTER_SQUARES.includes(move.to as (typeof CENTER_SQUARES)[number]))
  ) {
    candidateConcepts.add("knight_center_pressure");
    candidateAnimations.add("knight-pressure-center");
  }

  if (pawnBreaks.length > 0) {
    candidateConcepts.add("prepare_center_break");
    candidateAnimations.add("center-break-pulse");
  }

  if (castlingAvailable) {
    candidateConcepts.add("castle_for_safety");
    candidateAnimations.add("castle-safety-aura");
  }

  if (input.bookStatus === "continuation" || stockfish.bestMove) {
    candidateConcepts.add("continuation_plan");
    candidateAnimations.add("continuation-ghost-plan");
  }

  return {
    schemaVersion: "blundr-feature-packet-v0",
    fen: input.fen,
    normalizedFen: input.normalizedFen ?? normalizeFen(input.fen),
    moveHistory: [...input.moveHistory],
    sideToMove,
    userColor: input.userColor,
    expectedActor,
    expectedMoveColor,
    userRatingBucket: input.userRatingBucket,
    trainingPhase: input.trainingPhase,
    openingName: input.openingName,
    bookStatus: input.bookStatus,
    expectedMove: input.expectedMove ? normalizeMove(input.expectedMove) : undefined,
    candidateMove: input.candidateMove ? normalizeMove(input.candidateMove) : undefined,
    legalMoves,
    stockfish,
    human: human ? { commonMoves: human } : undefined,
    state,
    derived: {
      candidateMoves,
      candidateArrows,
      candidateSquares,
      candidateConcepts: Array.from(candidateConcepts).filter((concept) =>
        (BLUNDR_CONCEPTS as readonly string[]).includes(concept)
      ),
      candidateAnimations: Array.from(candidateAnimations).filter((animation) =>
        (BLUNDR_ANIMATION_PACKAGES as readonly string[]).includes(animation)
      ),
      centerSquares: [...CENTER_SQUARES],
      weakSquares,
      attackedSquares: safeSquares(input.attackedSquares, warnings, "attacked"),
      defendedSquares: safeSquares(input.defendedSquares, warnings, "defended"),
      kingDangerSquares: safeSquares(input.kingDangerSquares, warnings, "king danger"),
      pinnedPieces: safeSquares(input.pinnedPieces, warnings, "pinned piece"),
      pawnBreaks,
      isDevelopmentPosition: input.moveHistory.length <= 16,
      castlingAvailable,
      queenOutEarly: isQueenOutEarly(input.moveHistory),
      samePieceMovedTwice: isSamePieceMovedTwice(input.moveHistory),
      lastMove: normalizeLastMove(input.lastMove, warnings),
      metadata: input.metadata,
    },
    provenance: {
      fen: "provided_app_state",
      normalizedFen: input.normalizedFen ? "provided_app_state" : "deterministic_rules",
      sideToMove: "chess.js",
      legalMoves: "chess.js",
      trainingState: "deterministic_rules",
      candidateMoves: candidateMoveProvenance,
      candidateSquares: candidateSquareProvenance,
    },
    debug: {
      source: "buildFeaturePacket",
      deterministic: true,
      warnings: unique([...state.warnings, ...warnings]),
    },
  };
}
