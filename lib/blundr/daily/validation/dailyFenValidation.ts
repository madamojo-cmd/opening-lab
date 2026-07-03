import { Chess, validateFen as chessValidateFen } from "chess.js";

import type { DailyBlundrCard } from "../dailyBlundrTypes";
import type { DailyValidationIssue, DailyValidationResult } from "./dailyValidationTypes";
import { makeValidationIssue, normalizeText, toValidationResult } from "./dailyValidationUtils";

type FenPieceCounts = {
  totalPieces: number;
  whitePieces: number;
  blackPieces: number;
  whiteKings: number;
  blackKings: number;
  whitePawns: number;
  blackPawns: number;
};

function emptyPieceCounts(): FenPieceCounts {
  return {
    totalPieces: 0,
    whitePieces: 0,
    blackPieces: 0,
    whiteKings: 0,
    blackKings: 0,
    whitePawns: 0,
    blackPawns: 0,
  };
}

function readFenPieceCounts(fen: string): FenPieceCounts | null {
  try {
    const game = new Chess(fen);
    const counts = emptyPieceCounts();
    for (const row of game.board()) {
      for (const piece of row) {
        if (!piece) continue;
        counts.totalPieces += 1;
        if (piece.color === "w") counts.whitePieces += 1;
        if (piece.color === "b") counts.blackPieces += 1;
        if (piece.type === "k" && piece.color === "w") counts.whiteKings += 1;
        if (piece.type === "k" && piece.color === "b") counts.blackKings += 1;
        if (piece.type === "p" && piece.color === "w") counts.whitePawns += 1;
        if (piece.type === "p" && piece.color === "b") counts.blackPawns += 1;
      }
    }
    return counts;
  } catch {
    return null;
  }
}

function prefixIssues(result: DailyValidationResult, path: string, fen?: string): DailyValidationResult {
  return {
    valid: result.valid,
    issues: result.issues.map((issue) => ({
      ...issue,
      path: issue.path ? `${path}.${issue.path}` : path,
      fen: fen ?? issue.fen,
    })),
  };
}

export function validateFen(fen: string | null | undefined): DailyValidationResult {
  const text = normalizeText(fen);
  const issues: DailyValidationIssue[] = [];
  if (!text) {
    issues.push(
      makeValidationIssue({
        severity: "error",
        category: "fen",
        code: "missing_fen",
        message: "FEN is missing.",
        suggestion: "Provide a full FEN string before serving this content.",
      }),
    );
    return toValidationResult(issues);
  }

  const structure = chessValidateFen(text);
  if (!structure.ok) {
    issues.push(
      makeValidationIssue({
        severity: "error",
        category: "fen",
        code: "invalid_fen",
        message: `Invalid FEN: ${structure.error}`,
        fen: text,
        suggestion: "Replace the position with a legal FEN that chess.js can parse.",
      }),
    );
    return toValidationResult(issues);
  }

  issues.push(...validateFenHasKings(text).issues);
  issues.push(...validateFenPieceCounts(text).issues);
  return toValidationResult(issues);
}

export function isLegalFen(fen: string | null | undefined): boolean {
  return validateFen(fen).valid;
}

export function validateFenSideToMove(fen: string | null | undefined, expectedSideToMove?: "w" | "b" | null): DailyValidationResult {
  const text = normalizeText(fen);
  if (!text) return validateFen(text);
  const base = validateFen(text);
  if (!base.valid || expectedSideToMove !== "w" && expectedSideToMove !== "b") {
    return base;
  }
  try {
    const game = new Chess(text);
    if (game.turn() !== expectedSideToMove) {
      return toValidationResult([
        ...base.issues,
        makeValidationIssue({
          severity: "error",
          category: "fen",
          code: "side_to_move_mismatch",
          message: `Expected ${expectedSideToMove === "w" ? "white" : "black"} to move, but the FEN says ${game.turn() === "w" ? "white" : "black"}.`,
          fen: text,
          suggestion: "Adjust the side-to-move field or replace the position.",
        }),
      ]);
    }
    return base;
  } catch {
    return base;
  }
}

export function validateFenHasKings(fen: string | null | undefined): DailyValidationResult {
  const text = normalizeText(fen);
  if (!text) {
    return toValidationResult([
      makeValidationIssue({
        severity: "error",
        category: "fen",
        code: "missing_fen",
        message: "FEN is missing.",
      }),
    ]);
  }

  const counts = readFenPieceCounts(text);
  if (!counts) {
    return toValidationResult([
      makeValidationIssue({
        severity: "error",
        category: "fen",
        code: "invalid_fen",
        message: "FEN could not be parsed.",
        fen: text,
      }),
    ]);
  }

  const issues: DailyValidationIssue[] = [];
  if (counts.whiteKings !== 1) {
    issues.push(
      makeValidationIssue({
        severity: "error",
        category: "fen",
        code: counts.whiteKings === 0 ? "missing_white_king" : "too_many_white_kings",
        message: counts.whiteKings === 0 ? "White king is missing." : "Too many white kings are present.",
        fen: text,
      }),
    );
  }
  if (counts.blackKings !== 1) {
    issues.push(
      makeValidationIssue({
        severity: "error",
        category: "fen",
        code: counts.blackKings === 0 ? "missing_black_king" : "too_many_black_kings",
        message: counts.blackKings === 0 ? "Black king is missing." : "Too many black kings are present.",
        fen: text,
      }),
    );
  }
  return toValidationResult(issues);
}

export function validateFenPieceCounts(fen: string | null | undefined): DailyValidationResult {
  const text = normalizeText(fen);
  if (!text) return validateFen(text);
  const counts = readFenPieceCounts(text);
  if (!counts) {
    return toValidationResult([
      makeValidationIssue({
        severity: "error",
        category: "fen",
        code: "invalid_fen",
        message: "FEN could not be parsed.",
        fen: text,
      }),
    ]);
  }

  const issues: DailyValidationIssue[] = [];
  if (counts.whitePieces > 16) {
    issues.push(
      makeValidationIssue({
        severity: "error",
        category: "fen",
        code: "too_many_white_pieces",
        message: `White has ${counts.whitePieces} pieces, which exceeds the legal limit of 16.`,
        fen: text,
      }),
    );
  }
  if (counts.blackPieces > 16) {
    issues.push(
      makeValidationIssue({
        severity: "error",
        category: "fen",
        code: "too_many_black_pieces",
        message: `Black has ${counts.blackPieces} pieces, which exceeds the legal limit of 16.`,
        fen: text,
      }),
    );
  }
  if (counts.whitePawns > 8) {
    issues.push(
      makeValidationIssue({
        severity: "error",
        category: "fen",
        code: "too_many_white_pawns",
        message: `White has ${counts.whitePawns} pawns, which exceeds the legal limit of 8.`,
        fen: text,
      }),
    );
  }
  if (counts.blackPawns > 8) {
    issues.push(
      makeValidationIssue({
        severity: "error",
        category: "fen",
        code: "too_many_black_pawns",
        message: `Black has ${counts.blackPawns} pawns, which exceeds the legal limit of 8.`,
        fen: text,
      }),
    );
  }
  return toValidationResult(issues);
}

export function validateDailyCardFen(card: Pick<DailyBlundrCard, "id" | "kind" | "fen" | "miniGame" | "trainingTarget">): DailyValidationResult {
  const issues: DailyValidationIssue[] = [];
  const cardFen = validateFen(card.fen);
  issues.push(
    ...cardFen.issues.map((issue) => ({
      ...issue,
      path: issue.path ? `fen.${issue.path}` : "fen",
      itemId: card.id,
    })),
  );

  if (card.kind === "mini_game" && card.miniGame) {
    const startFen = prefixIssues(validateFen(card.miniGame.startFen), "miniGame.startFen", card.miniGame.startFen);
    const currentFen = prefixIssues(validateFen(card.miniGame.currentFen), "miniGame.currentFen", card.miniGame.currentFen);
    const sideToMove = prefixIssues(validateFenSideToMove(card.miniGame.currentFen, card.miniGame.sideToMove), "miniGame.currentFen", card.miniGame.currentFen);
    issues.push(...startFen.issues.map((issue) => ({ ...issue, itemId: card.id })));
    issues.push(...currentFen.issues.map((issue) => ({ ...issue, itemId: card.id })));
    issues.push(...sideToMove.issues.map((issue) => ({ ...issue, itemId: card.id })));
  }

  if (card.kind === "training_target" && card.trainingTarget) {
    const startFen = prefixIssues(validateFen(card.trainingTarget.startFen), "trainingTarget.startFen", card.trainingTarget.startFen);
    const currentFen = prefixIssues(validateFen(card.trainingTarget.currentFen), "trainingTarget.currentFen", card.trainingTarget.currentFen);
    const sideToMove = prefixIssues(validateFenSideToMove(card.trainingTarget.currentFen, card.trainingTarget.sideToMove), "trainingTarget.currentFen", card.trainingTarget.currentFen);
    issues.push(...startFen.issues.map((issue) => ({ ...issue, itemId: card.id })));
    issues.push(...currentFen.issues.map((issue) => ({ ...issue, itemId: card.id })));
    issues.push(...sideToMove.issues.map((issue) => ({ ...issue, itemId: card.id })));
  }

  return toValidationResult(issues);
}
