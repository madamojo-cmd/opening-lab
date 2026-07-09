import type { Color, ParsedBoard, Square } from "@/lib/blundr/geometry/boardTypes";
import { fileIndex, isValidSquare, squareFrom } from "@/lib/blundr/geometry/squareUtils";
import { pawnAttackSquares, pawnPushSquare, pawnDoublePushSquare } from "@/lib/blundr/geometry/pawnGeometry";
import { parseMiniGameBoard } from "./miniGameAttackMaps";

export function pawnAdvanceDirection(color: Color): 1 | -1 {
  return color === "white" ? 1 : -1;
}

export function pawnPromotionDistance(square: Square, color: Color): number {
  if (!isValidSquare(square)) return Infinity;
  return color === "white" ? 8 - Number(square[1]) : Number(square[1]) - 1;
}

export function pawnPathSquares(square: Square, color: Color): Square[] {
  if (!isValidSquare(square)) return [];
  const out: Square[] = [];
  const dir = pawnAdvanceDirection(color);
  let rank = Number(square[1]) + dir;
  while (rank >= 1 && rank <= 8) {
    const target = squareFrom(fileIndex(square[0]), rank);
    if (target) out.push(target);
    rank += dir;
  }
  return out;
}

export function isPassedPawn(board: ParsedBoard, pawnSquare: Square): boolean {
  const pawn = board.pieceBySquare[pawnSquare];
  if (!pawn || pawn.type !== "pawn") return false;
  const enemyColor: Color = pawn.color === "white" ? "black" : "white";
  const enemyFiles = [fileIndex(pawnSquare[0]) - 1, fileIndex(pawnSquare[0]), fileIndex(pawnSquare[0]) + 1];
  for (const file of enemyFiles) {
    if (file < 0 || file > 7) continue;
    const dir = pawn.color === "white" ? 1 : -1;
    let rank = Number(pawnSquare[1]) + dir;
    while (rank >= 1 && rank <= 8) {
      const square = squareFrom(file, rank);
      if (!square) break;
      const occupant = board.pieceBySquare[square];
      if (occupant && occupant.color === enemyColor && occupant.type === "pawn") return false;
      rank += dir;
    }
  }
  return true;
}

export function isConnectedPassedPawn(board: ParsedBoard, pawnSquare: Square): boolean {
  const pawn = board.pieceBySquare[pawnSquare];
  if (!pawn || pawn.type !== "pawn") return false;
  if (!isPassedPawn(board, pawnSquare)) return false;
  const friendlyPawns = board.pieces.filter((piece) => piece.color === pawn.color && piece.type === "pawn" && piece.square !== pawnSquare);
  const file = fileIndex(pawnSquare[0]);
  return friendlyPawns.some((piece) => Math.abs(fileIndex(piece.square[0]) - file) === 1 && Math.abs(Number(piece.square[1]) - Number(pawnSquare[1])) <= 1);
}

export function pawnSupportDistance(kingSquare: Square, pawnSquare: Square): number {
  const fileGap = Math.abs(fileIndex(kingSquare[0]) - fileIndex(pawnSquare[0]));
  const rankGap = Math.abs(Number(kingSquare[1]) - Number(pawnSquare[1]));
  return fileGap + rankGap;
}

export function squareOfPawnRace(pawnSquare: Square, color: Color): Square {
  const push = pawnPushSquare(pawnSquare, color);
  return push ?? pawnSquare;
}

export function pawnFrontSquare(pawnSquare: Square, color: Color): Square | null {
  return pawnPushSquare(pawnSquare, color);
}

export function pawnDoubleAdvanceSquare(pawnSquare: Square, color: Color): Square | null {
  return pawnDoublePushSquare(pawnSquare, color);
}

export function pawnThreatSquares(pawnSquare: Square, color: Color): Square[] {
  return pawnAttackSquares(pawnSquare, color);
}

export function parsePawnBoard(fen: string): ParsedBoard {
  return parseMiniGameBoard(fen);
}
