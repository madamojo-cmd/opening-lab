import type { Color, Square } from "./boardTypes";
import { fileIndex, fileOf, isValidSquare, squareFrom } from "./squareUtils";

export function kingZoneSquares(kingSquare: Square): Square[] {
  if (!isValidSquare(kingSquare)) return [];
  const out: Square[] = [];
  const file = fileIndex(fileOf(kingSquare));
  const rank = Number(kingSquare[1]);
  for (let df = -1; df <= 1; df += 1) {
    for (let dr = -1; dr <= 1; dr += 1) {
      const target = squareFrom(file + df, rank + dr);
      if (target) out.push(target);
    }
  }
  return out;
}

export function extendedKingZoneSquares(kingSquare: Square): Square[] {
  if (!isValidSquare(kingSquare)) return [];
  const out = new Set<Square>();
  const file = fileIndex(fileOf(kingSquare));
  const rank = Number(kingSquare[1]);
  for (let df = -2; df <= 2; df += 1) {
    for (let dr = -2; dr <= 2; dr += 1) {
      const target = squareFrom(file + df, rank + dr);
      if (target) out.add(target);
    }
  }
  return Array.from(out);
}

export function shieldSquaresForKing(kingSquare: Square, color: Color, castledSide?: "king" | "queen"): Square[] {
  if (!isValidSquare(kingSquare)) return [];
  const rank = color === "white" ? 2 : 7;
  const files = castledSide === "queen" ? ["a", "b", "c"] : castledSide === "king" ? ["f", "g", "h"] : adjacentFilesNearKing(kingSquare);
  return files.map((file) => `${file}${rank}`).filter(isValidSquare);
}

export function adjacentFilesNearKing(kingSquare: Square): string[] {
  if (!isValidSquare(kingSquare)) return [];
  const file = fileOf(kingSquare);
  const idx = fileIndex(file);
  return [idx - 1, idx, idx + 1].map((next) => String.fromCharCode(97 + next)).filter((next) => next >= "a" && next <= "h");
}
