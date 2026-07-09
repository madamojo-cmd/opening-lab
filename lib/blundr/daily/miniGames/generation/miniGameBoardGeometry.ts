import type { Color, Square } from "@/lib/blundr/geometry/boardTypes";
import { ALL_SQUARES, coordsToSquare, isBoardSquare, squareToCoords } from "@/lib/blundr/geometry/lineGeometry";
import { kingDistance, manhattanDistance } from "@/lib/blundr/geometry/squareUtils";
import { fileIndex, rankIndex } from "../miniGameUtils";

export { ALL_SQUARES };

export type BoardTransformId = "mirror_files" | "mirror_ranks" | "rotate_180" | "identity";

export function normalizeSquare(square: string | null | undefined): Square | null {
  const text = String(square ?? "").trim().toLowerCase();
  return isBoardSquare(text) ? (text as Square) : null;
}

export function translateSquare(square: Square, fileDelta: number, rankDelta: number): Square | null {
  const coords = squareToCoords(square);
  return coordsToSquare(coords.file + fileDelta, coords.rank + rankDelta) as Square | null;
}

export function mirrorFileSquare(square: Square): Square {
  const coords = squareToCoords(square);
  return coordsToSquare(7 - coords.file, coords.rank) as Square;
}

export function mirrorRankSquare(square: Square): Square {
  const coords = squareToCoords(square);
  return coordsToSquare(coords.file, 7 - coords.rank) as Square;
}

export function rotate180Square(square: Square): Square {
  const coords = squareToCoords(square);
  return coordsToSquare(7 - coords.file, 7 - coords.rank) as Square;
}

export function applyBoardTransform(square: Square, transformId: BoardTransformId): Square {
  if (transformId === "mirror_files") return mirrorFileSquare(square);
  if (transformId === "mirror_ranks") return mirrorRankSquare(square);
  if (transformId === "rotate_180") return rotate180Square(square);
  return square;
}

export function applyTransformToSquares(squares: readonly Square[] | undefined, transformId: BoardTransformId): Square[] {
  return (squares ?? []).map((square) => applyBoardTransform(square, transformId));
}

export function squareColor(square: Square): "light" | "dark" {
  const coords = squareToCoords(square);
  return (coords.file + coords.rank) % 2 === 0 ? "light" : "dark";
}

export function isSameColorSquare(a: Square, b: Square): boolean {
  return squareColor(a) === squareColor(b);
}

export function knightTargets(square: Square): Square[] {
  const offsets = [
    [1, 2],
    [2, 1],
    [2, -1],
    [1, -2],
    [-1, -2],
    [-2, -1],
    [-2, 1],
    [-1, 2],
  ] as const;
  const coords = squareToCoords(square);
  return offsets
    .map(([fileDelta, rankDelta]) => coordsToSquare(coords.file + fileDelta, coords.rank + rankDelta))
    .filter((entry): entry is Square => Boolean(entry));
}

export function kingTargets(square: Square): Square[] {
  const targets: Square[] = [];
  for (let fileDelta = -1; fileDelta <= 1; fileDelta += 1) {
    for (let rankDelta = -1; rankDelta <= 1; rankDelta += 1) {
      if (fileDelta === 0 && rankDelta === 0) continue;
      const target = translateSquare(square, fileDelta, rankDelta);
      if (target) targets.push(target);
    }
  }
  return targets;
}

export function lineSquaresBetween(from: Square, to: Square): Square[] {
  const start = squareToCoords(from);
  const end = squareToCoords(to);
  const fileDistance = Math.abs(end.file - start.file);
  const rankDistance = Math.abs(end.rank - start.rank);
  if (!(fileDistance === 0 || rankDistance === 0 || fileDistance === rankDistance)) return [];
  const fileStep = Math.sign(end.file - start.file);
  const rankStep = Math.sign(end.rank - start.rank);
  const out: Square[] = [];
  let file = start.file + fileStep;
  let rank = start.rank + rankStep;
  while (file !== end.file || rank !== end.rank) {
    const square = coordsToSquare(file, rank);
    if (square) out.push(square as Square);
    file += fileStep;
    rank += rankStep;
  }
  return out;
}

export function squareRing(center: Square, radius: number): Square[] {
  const result: Square[] = [];
  for (let fileDelta = -radius; fileDelta <= radius; fileDelta += 1) {
    for (let rankDelta = -radius; rankDelta <= radius; rankDelta += 1) {
      if (Math.max(Math.abs(fileDelta), Math.abs(rankDelta)) !== radius) continue;
      const target = translateSquare(center, fileDelta, rankDelta);
      if (target) result.push(target);
    }
  }
  return result;
}

export function chooseAnchorSquareBySeed(seedValue: number, preferredSquares: readonly Square[] = ["d4", "e4", "d5", "e5"]): Square {
  const index = Math.abs(seedValue) % preferredSquares.length;
  return preferredSquares[index] ?? "d4";
}

export function normalizeCoordinate(value: string): number {
  return Math.max(0, Math.min(7, Number(value)));
}

export function axisDistance(a: Square, b: Square): number {
  return Math.abs(fileIndex(a) - fileIndex(b)) + Math.abs(rankIndex(a) - rankIndex(b));
}

export function kingSpan(a: Square, b: Square): number {
  return kingDistance(a, b);
}

export function manhattanSpan(a: Square, b: Square): number {
  return manhattanDistance(a, b);
}

export function validBoardSquareList(values: readonly (string | null | undefined)[]): Square[] {
  return values.map((value) => normalizeSquare(value)).filter((value): value is Square => Boolean(value));
}

export function oppositeColor(color: Color): Color {
  return color === "white" ? "black" : "white";
}
