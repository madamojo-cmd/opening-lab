import type { Color, ParsedBoard, Square } from "@/lib/blundr/geometry/boardTypes";
import { fileIndex, isValidSquare } from "@/lib/blundr/geometry/squareUtils";
import { kingDistance } from "@/lib/blundr/geometry/squareUtils";
import { parseMiniGameBoard } from "./miniGameAttackMaps";
import { pawnPromotionDistance, pawnPathSquares } from "./miniGamePawnRace";

export function isDirectOpposition(whiteKing: Square, blackKing: Square): boolean {
  if (!isValidSquare(whiteKing) || !isValidSquare(blackKing)) return false;
  const sameFile = whiteKing[0] === blackKing[0];
  const sameRank = whiteKing[1] === blackKing[1];
  const distance = kingDistance(whiteKing, blackKing);
  return distance === 2 && (sameFile || sameRank);
}

export function isDistantOpposition(whiteKing: Square, blackKing: Square): boolean {
  if (!isValidSquare(whiteKing) || !isValidSquare(blackKing)) return false;
  const sameFile = whiteKing[0] === blackKing[0];
  const sameRank = whiteKing[1] === blackKing[1];
  const distance = kingDistance(whiteKing, blackKing);
  return distance >= 3 && (sameFile || sameRank);
}

export function oppositionGap(a: Square, b: Square): number {
  return kingDistance(a, b);
}

export function rookBehindPassedPawn(rookSquare: Square, pawnSquare: Square, color: Color): boolean {
  if (!isValidSquare(rookSquare) || !isValidSquare(pawnSquare)) return false;
  if (rookSquare[0] !== pawnSquare[0]) return false;
  return color === "white" ? Number(rookSquare[1]) < Number(pawnSquare[1]) : Number(rookSquare[1]) > Number(pawnSquare[1]);
}

export function rookCutoffScore(rookSquare: Square, kingSquare: Square, targetSquare: Square): number {
  const fileSpan = Math.abs(fileIndex(rookSquare[0]) - fileIndex(kingSquare[0]));
  const rankSpan = Math.abs(Number(rookSquare[1]) - Number(targetSquare[1]));
  return fileSpan + rankSpan;
}

export function rookCutsOffKing(rookSquare: Square, kingSquare: Square): boolean {
  if (!isValidSquare(rookSquare) || !isValidSquare(kingSquare)) return false;
  return rookSquare[0] === kingSquare[0] || rookSquare[1] === kingSquare[1];
}

export function lucenaBridgePotential(board: ParsedBoard, rookSquare: Square, pawnSquare: Square): boolean {
  const pawn = board.pieceBySquare[pawnSquare];
  return Boolean(pawn && pawn.type === "pawn" && rookBehindPassedPawn(rookSquare, pawnSquare, pawn.color));
}

export function philidorDefensePotential(board: ParsedBoard, rookSquare: Square, pawnSquare: Square): boolean {
  const pawn = board.pieceBySquare[pawnSquare];
  return Boolean(pawn && pawn.type === "pawn" && rookBehindPassedPawn(rookSquare, pawnSquare, pawn.color));
}

export function canTriangulate(kingSquare: Square, targetSquare: Square): boolean {
  return kingDistance(kingSquare, targetSquare) >= 2;
}

export function promotionTempo(board: ParsedBoard, pawnSquare: Square, color: Color): number {
  return pawnPromotionDistance(pawnSquare, color) + pawnPathSquares(pawnSquare, color).length + (board.sideToMove === color ? 0 : 1);
}

export function endgameBoard(fen: string): ParsedBoard {
  return parseMiniGameBoard(fen);
}
