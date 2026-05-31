import type { Color, Square } from "./boardTypes";
import { adjacentFiles, fileIndex, fileOf, forwardDirection, isValidSquare, squareFrom } from "./squareUtils";

export function pawnAttackSquares(square: Square, color: Color): Square[] {
  if (!isValidSquare(square)) return [];
  const dir = forwardDirection(color);
  return [-1, 1]
    .map((df) => squareFrom(fileIndex(fileOf(square)) + df, Number(square[1]) + dir))
    .filter((target): target is Square => Boolean(target));
}

export function pawnPushSquare(square: Square, color: Color): Square | null {
  if (!isValidSquare(square)) return null;
  return squareFrom(fileIndex(fileOf(square)), Number(square[1]) + forwardDirection(color));
}

export function pawnDoublePushSquare(square: Square, color: Color): Square | null {
  if (!isValidSquare(square)) return null;
  const startRank = color === "white" ? 2 : 7;
  if (Number(square[1]) !== startRank) return null;
  return squareFrom(fileIndex(fileOf(square)), Number(square[1]) + forwardDirection(color) * 2);
}

export function filesAhead(square: Square, color: Color): Square[] {
  if (!isValidSquare(square)) return [];
  const out: Square[] = [];
  const file = fileIndex(fileOf(square));
  const dir = forwardDirection(color);
  for (let rank = Number(square[1]) + dir; rank >= 1 && rank <= 8; rank += dir) {
    const target = squareFrom(file, rank);
    if (target) out.push(target);
  }
  return out;
}

export function sameAndAdjacentFiles(file: string): string[] {
  return [file, ...adjacentFiles(file)];
}

export function opposingPawnSquaresAhead(square: Square, color: Color): Square[] {
  if (!isValidSquare(square)) return [];
  const files = sameAndAdjacentFiles(fileOf(square));
  const dir = forwardDirection(color);
  const out: Square[] = [];
  for (const file of files) {
    for (let rank = Number(square[1]) + dir; rank >= 1 && rank <= 8; rank += dir) {
      const target = squareFrom(fileIndex(file), rank);
      if (target) out.push(target);
    }
  }
  return out;
}

export function pawnCanAttackSquare(pawnSquare: Square, target: Square, color: Color): boolean {
  return pawnAttackSquares(pawnSquare, color).includes(target);
}

export function pawnCanChallengeSquare(pawnSquare: Square, target: Square, color: Color): boolean {
  return pawnAttackSquares(pawnSquare, color).includes(target) || pawnPushSquare(pawnSquare, color) === target || pawnDoublePushSquare(pawnSquare, color) === target;
}
