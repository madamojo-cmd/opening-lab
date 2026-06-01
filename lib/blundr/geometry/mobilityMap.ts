import type { ParsedBoard, Square } from "./boardTypes";
import { bishopDirections, knightOffsets, queenDirections, rookDirections } from "./directionUtils";
import { parseFenBoard } from "./fenBoardParser";
import { applyMove } from "./legalMoveUtils";
import { isValidSquare, squareFrom } from "./squareUtils";

function slidingMobility(board: ParsedBoard, square: Square, directions: ReadonlyArray<readonly [number, number]>): Square[] {
  const piece = board.pieceBySquare[square];
  if (!piece) return [];
  const out: Square[] = [];
  const file = square.charCodeAt(0) - 97;
  const rank = Number(square[1]);
  for (const [df, dr] of directions) {
    let nextFile = file + df;
    let nextRank = rank + dr;
    while (true) {
      const target = squareFrom(nextFile, nextRank);
      if (!target) break;
      const blocker = board.pieceBySquare[target];
      if (!blocker) {
        out.push(target);
      } else {
        if (blocker.color !== piece.color) out.push(target);
        break;
      }
      nextFile += df;
      nextRank += dr;
    }
  }
  return out;
}

function stepMobility(board: ParsedBoard, square: Square, offsets: ReadonlyArray<readonly [number, number]>): Square[] {
  const piece = board.pieceBySquare[square];
  if (!piece) return [];
  const file = square.charCodeAt(0) - 97;
  const rank = Number(square[1]);
  return offsets
    .map(([df, dr]) => squareFrom(file + df, rank + dr))
    .filter((target): target is Square => Boolean(target))
    .filter((target) => board.pieceBySquare[target]?.color !== piece.color);
}

export function mobilitySquares(board: ParsedBoard, square: Square): Square[] {
  if (!isValidSquare(square)) return [];
  const piece = board.pieceBySquare[square];
  if (!piece) return [];
  if (piece.type === "bishop") return bishopMobility(board, square);
  if (piece.type === "rook") return rookMobility(board, square);
  if (piece.type === "queen") return queenMobility(board, square);
  if (piece.type === "knight") return knightMobility(board, square);
  if (piece.type === "king") return stepMobility(board, square, queenDirections);
  return [];
}

export function pseudoLegalMobilityCount(board: ParsedBoard, square: Square): number {
  return mobilitySquares(board, square).length;
}

export function bishopMobility(board: ParsedBoard, square: Square): Square[] {
  return slidingMobility(board, square, bishopDirections);
}

export function rookMobility(board: ParsedBoard, square: Square): Square[] {
  return slidingMobility(board, square, rookDirections);
}

export function queenMobility(board: ParsedBoard, square: Square): Square[] {
  return slidingMobility(board, square, queenDirections);
}

export function knightMobility(board: ParsedBoard, square: Square): Square[] {
  return stepMobility(board, square, knightOffsets);
}

export function blockedByOwnPieces(board: ParsedBoard, square: Square): Square[] {
  const piece = board.pieceBySquare[square];
  if (!piece) return [];
  const directions = piece.type === "bishop" ? bishopDirections : piece.type === "rook" ? rookDirections : piece.type === "queen" ? queenDirections : [];
  const blockers: Square[] = [];
  for (const [df, dr] of directions) {
    const target = squareFrom(square.charCodeAt(0) - 97 + df, Number(square[1]) + dr);
    if (target && board.pieceBySquare[target]?.color === piece.color) blockers.push(target);
  }
  return blockers;
}

export function mobilityDeltaAfterMove(fen: string, uci: string): { before: number; after: number; delta: number } | null {
  const from = uci.slice(0, 2);
  const to = uci.slice(2, 4);
  const beforeBoard = parseFenBoard(fen);
  const before = pseudoLegalMobilityCount(beforeBoard, from);
  const fenAfter = applyMove(fen, uci);
  if (!fenAfter) return null;
  const after = pseudoLegalMobilityCount(parseFenBoard(fenAfter), to);
  return { before, after, delta: after - before };
}
