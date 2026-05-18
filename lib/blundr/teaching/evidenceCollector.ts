import { Chess } from "chess.js";
import { analyzeBoard } from "./boardAnalyzer";
import { evaluateBookSupport, type BookSupportInput, type BookSupportResult } from "./bookSupport";
import { analyzeMoveDelta } from "./moveDeltaAnalyzer";
import type { BoardAnalysis, MoveDelta, TeachingCueInput } from "./teachingCueTypes";
import { centerSquares, extendedCenterSquares, isValidSquare, manhattanDistance } from "./squareUtils";

export type PositionPhase = "opening" | "middlegame" | "endgame" | "unclear";

export type CandidateMoveEvidence = {
  uci: string;
  san?: string;
  source: "expected" | "engine" | "book" | "user";
  rank?: number;
  scoreCp?: number;
  mate?: number;
  moveShare?: number;
};

export type TacticalThemeEvidence = {
  id:
    | "loose_piece"
    | "hanging_piece"
    | "attacked_loose_piece"
    | "immediate_material_win"
    | "fork_pattern"
    | "pin_pressure"
    | "discovered_attack_possibility"
    | "overloaded_defender"
    | "back_rank_weakness"
    | "exposed_king"
    | "undefended_target";
  title: string;
  side: "w" | "b";
  relevantSquares: string[];
  relevantPieces: string[];
  severity: number;
  confidence: number;
  visualPriority: number;
  pedagogicalPriority: number;
  claimSafety: "safe" | "cautious" | "speculative";
  reason: string;
};

export type StrategicThemeEvidence = {
  id:
    | "king_safety"
    | "center_tension"
    | "center_control"
    | "development_lag"
    | "piece_activity"
    | "improve_worst_piece"
    | "open_file"
    | "half_open_file"
    | "weak_square"
    | "outpost_candidate"
    | "pawn_lever"
    | "space_advantage"
    | "coordination"
    | "prophylaxis"
    | "rooks_connected"
    | "rooks_not_connected"
    | "bad_bishop"
    | "inactive_bishop"
    | "knight_outpost_potential";
  title: string;
  side: "w" | "b";
  relevantSquares: string[];
  relevantPieces: string[];
  severity: number;
  confidence: number;
  visualPriority: number;
  pedagogicalPriority: number;
  claimSafety: "safe" | "cautious" | "speculative";
  reason: string;
};

export type MoveClassificationEvidence = {
  isCapture: boolean;
  isCheck: boolean;
  isCheckmate: boolean;
  isCastle: boolean;
  isPromotion: boolean;
  isPawnMove: boolean;
  isDevelopingMove: boolean;
  isCenterMove: boolean;
  isAlternativeCandidate: boolean;
};

export type TeachingEvidence = {
  fenBefore: string;
  fenAfter?: string;
  sideToMove: "w" | "b";
  expectedMoveSan?: string;
  expectedMoveUci?: string;
  userMoveSan?: string;
  userMoveUci?: string;
  moveQualityStatus?: string;
  validationUserStatus: TeachingCueInput["validation"]["userStatus"];
  engineTopMoves: CandidateMoveEvidence[];
  bookTopMoves: CandidateMoveEvidence[];
  repertoireMoves: CandidateMoveEvidence[];
  bookSupport: BookSupportResult;
  boardBefore: BoardAnalysis;
  boardAfter?: BoardAnalysis;
  moveDelta?: MoveDelta;
  tacticalThemes: TacticalThemeEvidence[];
  strategicThemes: StrategicThemeEvidence[];
  safetyWarnings: string[];
  phase: PositionPhase;
  moveClassification: MoveClassificationEvidence;
  context: TeachingCueInput["context"];
  userMemory: TeachingCueInput["userMemory"];
};

export type CollectTeachingEvidenceInput = {
  teachingInput: TeachingCueInput;
  expectedMove?: { uci?: string; san?: string };
  userMove?: { uci?: string; san?: string };
  engineTopMoves?: Array<{ uci: string; san?: string; rank?: number; scoreCp?: number; mate?: number }>;
  bookTopMoves?: Array<{ uci: string; san?: string; moveShare?: number; moveGames?: number; totalGames?: number }>;
  repertoireMoves?: Array<{ uci: string; san?: string }>;
  bookSupportInput?: BookSupportInput;
};

function classifyPhase(board: BoardAnalysis): PositionPhase {
  const nonPawnMaterial = board.pieces
    .filter((p) => p.type !== "p" && p.type !== "k")
    .reduce((sum, p) => sum + (p.type === "n" || p.type === "b" ? 3 : p.type === "r" ? 5 : 9), 0);
  const developedMinors = board.pieces.filter((p) => (p.type === "n" || p.type === "b") && (p.square[1] !== (p.color === "w" ? "1" : "8"))).length;
  if (board.material.w + board.material.b <= 18 || nonPawnMaterial <= 12) return "endgame";
  if (developedMinors <= 3) return "opening";
  if (nonPawnMaterial >= 20) return "middlegame";
  return "unclear";
}

function topCenterSquaresByDistance(square: string): string[] {
  const centers = [...centerSquares(), ...extendedCenterSquares()];
  return centers.sort((a, b) => manhattanDistance(square, a) - manhattanDistance(square, b)).slice(0, 2);
}

function detectTacticalThemes(evidence: {
  before: BoardAnalysis;
  after?: BoardAnalysis;
  delta?: MoveDelta;
  side: "w" | "b";
}): TacticalThemeEvidence[] {
  const out: TacticalThemeEvidence[] = [];
  const enemy = evidence.side === "w" ? "b" : "w";

  const looseEnemy = evidence.before.loosePieces.filter((sq) => evidence.before.pieces.some((p) => p.square === sq && p.color === enemy));
  if (looseEnemy.length) {
    out.push({
      id: "loose_piece",
      title: "Loose piece available",
      side: evidence.side,
      relevantSquares: looseEnemy.slice(0, 2),
      relevantPieces: looseEnemy.slice(0, 2),
      severity: 0.72,
      confidence: 0.78,
      visualPriority: 0.82,
      pedagogicalPriority: 0.88,
      claimSafety: "safe",
      reason: "Opponent piece has no defenders.",
    });
  }

  const hangingEnemy = evidence.before.hangingPieces.filter((sq) => evidence.before.pieces.some((p) => p.square === sq && p.color === enemy));
  if (hangingEnemy.length) {
    out.push({
      id: "hanging_piece",
      title: "Hanging piece",
      side: evidence.side,
      relevantSquares: hangingEnemy.slice(0, 2),
      relevantPieces: hangingEnemy.slice(0, 2),
      severity: 0.76,
      confidence: 0.75,
      visualPriority: 0.8,
      pedagogicalPriority: 0.86,
      claimSafety: "safe",
      reason: "Enemy piece is attacked more than defended.",
    });
  }

  if (evidence.delta?.newlyAttackedPieces?.length) {
    out.push({
      id: "attacked_loose_piece",
      title: "New target created",
      side: evidence.side,
      relevantSquares: evidence.delta.newlyAttackedPieces.slice(0, 2),
      relevantPieces: evidence.delta.newlyAttackedPieces.slice(0, 2),
      severity: 0.62,
      confidence: 0.72,
      visualPriority: 0.76,
      pedagogicalPriority: 0.74,
      claimSafety: "cautious",
      reason: "Move creates fresh tactical pressure.",
    });
  }

  if ((evidence.delta?.isCheck ?? false) || (evidence.before.kingSafety[enemy] < -2)) {
    out.push({
      id: "exposed_king",
      title: "King exposure",
      side: evidence.side,
      relevantSquares: [evidence.before.kingSquares[enemy]].filter((s): s is string => Boolean(s)),
      relevantPieces: [evidence.before.kingSquares[enemy]].filter((s): s is string => Boolean(s)),
      severity: 0.7,
      confidence: 0.7,
      visualPriority: 0.82,
      pedagogicalPriority: 0.78,
      claimSafety: "cautious",
      reason: "King zone pressure is elevated.",
    });
  }

  return out;
}

function detectStrategicThemes(evidence: {
  before: BoardAnalysis;
  after?: BoardAnalysis;
  delta?: MoveDelta;
  side: "w" | "b";
  phase: PositionPhase;
}): StrategicThemeEvidence[] {
  const out: StrategicThemeEvidence[] = [];
  const enemy = evidence.side === "w" ? "b" : "w";

  if ((evidence.delta?.centerControlDelta ?? 0) !== 0) {
    out.push({
      id: "center_control",
      title: "Center control",
      side: evidence.side,
      relevantSquares: topCenterSquaresByDistance(evidence.delta?.to ?? "e4"),
      relevantPieces: [evidence.delta?.to ?? ""].filter(Boolean),
      severity: 0.55,
      confidence: 0.76,
      visualPriority: 0.68,
      pedagogicalPriority: 0.8,
      claimSafety: "safe",
      reason: "Center influence changed.",
    });
  }

  if ((evidence.before.extendedCenterControl[evidence.side] - evidence.before.extendedCenterControl[enemy]) * (evidence.after ? 1 : 0) >= 0) {
    out.push({
      id: "center_tension",
      title: "Center tension",
      side: evidence.side,
      relevantSquares: centerSquares(),
      relevantPieces: [],
      severity: 0.58,
      confidence: 0.64,
      visualPriority: 0.66,
      pedagogicalPriority: 0.82,
      claimSafety: "cautious",
      reason: "Center remains unresolved.",
    });
  }

  const undevelopedMinors = evidence.before.pieces.filter((p) => p.color === evidence.side && (p.type === "n" || p.type === "b") && p.square[1] === (evidence.side === "w" ? "1" : "8"));
  if (undevelopedMinors.length >= 1 && evidence.phase !== "endgame") {
    out.push({
      id: "development_lag",
      title: "Development lag",
      side: evidence.side,
      relevantSquares: undevelopedMinors.map((p) => p.square).slice(0, 2),
      relevantPieces: undevelopedMinors.map((p) => p.square).slice(0, 2),
      severity: 0.62,
      confidence: 0.78,
      visualPriority: 0.72,
      pedagogicalPriority: 0.9,
      claimSafety: "safe",
      reason: "Minor pieces remain on starting squares.",
    });
  }

  if (evidence.before.openFiles.length > 0) {
    out.push({
      id: "open_file",
      title: "Open file",
      side: evidence.side,
      relevantSquares: evidence.before.openFiles.slice(0, 2).map((f) => `${f}${evidence.side === "w" ? "2" : "7"}`),
      relevantPieces: [],
      severity: 0.48,
      confidence: 0.68,
      visualPriority: 0.62,
      pedagogicalPriority: 0.7,
      claimSafety: "safe",
      reason: "Open file can support heavy piece activity.",
    });
  }

  if (evidence.phase === "endgame") {
    out.push({
      id: "piece_activity",
      title: "Endgame activity",
      side: evidence.side,
      relevantSquares: [evidence.before.kingSquares[evidence.side]].filter((s): s is string => Boolean(s)),
      relevantPieces: [evidence.before.kingSquares[evidence.side]].filter((s): s is string => Boolean(s)),
      severity: 0.64,
      confidence: 0.74,
      visualPriority: 0.65,
      pedagogicalPriority: 0.85,
      claimSafety: "safe",
      reason: "King and piece activity dominate in reduced material.",
    });
  }

  return out;
}

export function collectTeachingEvidence(input: CollectTeachingEvidenceInput): TeachingEvidence {
  const teachingInput = input.teachingInput;
  const before = analyzeBoard(teachingInput.fenBefore);
  let fenAfter = teachingInput.fenAfter;
  if (!fenAfter && isValidSquare(teachingInput.move.from) && isValidSquare(teachingInput.move.to)) {
    try {
      const game = new Chess(teachingInput.fenBefore);
      const played = game.move({
        from: teachingInput.move.from,
        to: teachingInput.move.to,
        promotion: teachingInput.move.promotion ?? "q",
      });
      if (played) fenAfter = game.fen();
    } catch {
      // keep undefined
    }
  }
  const after = fenAfter ? analyzeBoard(fenAfter) : undefined;
  const delta = after
    ? analyzeMoveDelta({ before, after, move: teachingInput.move, side: teachingInput.sideToMove })
    : undefined;

  const phase = classifyPhase(before);
  const bookSupport = evaluateBookSupport(
    input.bookSupportInput ?? {
      source: input.bookTopMoves?.length ? "book_data" : "book_missing",
      totalGames: input.bookTopMoves?.[0]?.totalGames,
      moveGames: input.bookTopMoves?.[0]?.moveGames,
      moveShare: input.bookTopMoves?.[0]?.moveShare,
    },
  );

  const engineTopMoves: CandidateMoveEvidence[] = (input.engineTopMoves ?? []).map((m) => ({
    ...m,
    source: "engine",
  }));
  const bookTopMoves: CandidateMoveEvidence[] = (input.bookTopMoves ?? []).map((m) => ({
    uci: m.uci,
    san: m.san,
    source: "book",
    moveShare: m.moveShare,
  }));
  const repertoireMoves: CandidateMoveEvidence[] = (input.repertoireMoves ?? []).map((m) => ({ ...m, source: "expected" }));

  const tacticalThemes = detectTacticalThemes({ before, after, delta, side: teachingInput.sideToMove });
  const strategicThemes = detectStrategicThemes({ before, after, delta, side: teachingInput.sideToMove, phase });

  const safetyWarnings: string[] = [];
  if (before.kingSafety[teachingInput.sideToMove] < -2) safetyWarnings.push("King safety is fragile.");
  if ((before.hangingPieces ?? []).some((sq) => before.pieces.some((p) => p.square === sq && p.color === teachingInput.sideToMove))) {
    safetyWarnings.push("One of your pieces is hanging.");
  }

  const expectedUci = input.expectedMove?.uci ?? teachingInput.move.uci;
  const expectedSan = input.expectedMove?.san ?? teachingInput.move.san;
  const userMoveUci = input.userMove?.uci;
  const userMoveSan = input.userMove?.san;

  const moveClassification: MoveClassificationEvidence = {
    isCapture: Boolean(delta?.isCapture ?? teachingInput.move.captured),
    isCheck: Boolean(delta?.isCheck),
    isCheckmate: Boolean(delta?.isCheckmate),
    isCastle: Boolean(delta?.isCastle),
    isPromotion: Boolean(delta?.isPromotion),
    isPawnMove: Boolean(delta?.isPawnMove),
    isDevelopingMove: Boolean(delta?.developmentDelta && delta.developmentDelta > 0),
    isCenterMove: centerSquares().includes(teachingInput.move.to),
    isAlternativeCandidate: Boolean(userMoveUci && expectedUci && userMoveUci !== expectedUci),
  };

  return {
    fenBefore: teachingInput.fenBefore,
    fenAfter,
    sideToMove: teachingInput.sideToMove,
    expectedMoveSan: expectedSan,
    expectedMoveUci: expectedUci,
    userMoveSan,
    userMoveUci,
    moveQualityStatus: teachingInput.validation.internalStatus,
    validationUserStatus: teachingInput.validation.userStatus,
    engineTopMoves,
    bookTopMoves,
    repertoireMoves,
    bookSupport,
    boardBefore: before,
    boardAfter: after,
    moveDelta: delta,
    tacticalThemes,
    strategicThemes,
    safetyWarnings,
    phase,
    moveClassification,
    context: teachingInput.context,
    userMemory: teachingInput.userMemory,
  };
}
