import type { Square } from "chess.js";
import type { BoardOrientation, BoardPoint } from "./projectiveTacticTypes";

export const PROJECTIVE_TACTIC_FILES = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;

const FILE_TO_INDEX: Record<string, number> = Object.fromEntries(
  PROJECTIVE_TACTIC_FILES.map((file, index) => [file, index]),
);

export function squareToFileRank(square: string): { file: number; rank: number } | null {
  if (!isValidSquare(square)) return null;
  return {
    file: FILE_TO_INDEX[square[0]],
    rank: Number(square[1]) - 1,
  };
}

export function fileRankToSquare(file: number, rank: number): Square | null {
  if (!Number.isInteger(file) || !Number.isInteger(rank)) return null;
  if (file < 0 || file > 7 || rank < 0 || rank > 7) return null;
  return `${PROJECTIVE_TACTIC_FILES[file]}${rank + 1}` as Square;
}

export function isValidSquare(square: unknown): square is Square {
  return typeof square === "string" && /^[a-h][1-8]$/.test(square);
}

export function squareToBoardPoint(square: string, orientation: BoardOrientation): BoardPoint | null {
  const fileRank = squareToFileRank(square);
  if (!fileRank) return null;
  const x = orientation === "white" ? fileRank.file + 0.5 : 7 - fileRank.file + 0.5;
  const y = orientation === "white" ? 7 - fileRank.rank + 0.5 : fileRank.rank + 0.5;
  return {
    x: x * 12.5,
    y: y * 12.5,
  };
}
