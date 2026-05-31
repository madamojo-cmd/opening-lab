import type { Color, Square } from "./boardTypes";

export const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;
export const CENTER_SQUARES = ["d4", "e4", "d5", "e5"] as const;
export const EXTENDED_CENTER_SQUARES = [
  "c3", "d3", "e3", "f3",
  "c4", "d4", "e4", "f4",
  "c5", "d5", "e5", "f5",
  "c6", "d6", "e6", "f6",
] as const;

export function isValidSquare(square?: string | null): square is Square {
  return Boolean(square && /^[a-h][1-8]$/.test(square));
}

export function fileOf(square: Square): string {
  return isValidSquare(square) ? square[0] : "";
}

export function rankOf(square: Square): number {
  return isValidSquare(square) ? Number(square[1]) : 0;
}

export function fileIndex(file: string): number {
  return FILES.indexOf(file as (typeof FILES)[number]);
}

export function squareFrom(file: number, rank: number): Square | null {
  if (file < 0 || file > 7 || rank < 1 || rank > 8) return null;
  return `${FILES[file]}${rank}`;
}

export function adjacentFiles(file: string): string[] {
  const index = fileIndex(file);
  return [index - 1, index + 1].filter((value) => value >= 0 && value < 8).map((value) => FILES[value]);
}

export function forwardDirection(color: Color): 1 | -1 {
  return color === "white" ? 1 : -1;
}

export function relativeRank(color: Color, square: Square): number {
  const rank = rankOf(square);
  if (!rank) return 0;
  return color === "white" ? rank : 9 - rank;
}

export function mirrorSquare(square: Square): Square {
  if (!isValidSquare(square)) return square;
  return `${square[0]}${9 - Number(square[1])}`;
}

export function manhattanDistance(a: Square, b: Square): number {
  if (!isValidSquare(a) || !isValidSquare(b)) return Infinity;
  return Math.abs(fileIndex(a[0]) - fileIndex(b[0])) + Math.abs(Number(a[1]) - Number(b[1]));
}

export function kingDistance(a: Square, b: Square): number {
  if (!isValidSquare(a) || !isValidSquare(b)) return Infinity;
  return Math.max(Math.abs(fileIndex(a[0]) - fileIndex(b[0])), Math.abs(Number(a[1]) - Number(b[1])));
}

export function squaresOnFile(file: string): Square[] {
  const index = fileIndex(file);
  if (index < 0) return [];
  return Array.from({ length: 8 }, (_, i) => `${file}${i + 1}`);
}

export function squaresOnRank(rank: number): Square[] {
  if (rank < 1 || rank > 8) return [];
  return FILES.map((file) => `${file}${rank}`);
}

export function centerSquares(): Square[] {
  return [...CENTER_SQUARES];
}

export function extendedCenterSquares(): Square[] {
  return [...EXTENDED_CENTER_SQUARES];
}
