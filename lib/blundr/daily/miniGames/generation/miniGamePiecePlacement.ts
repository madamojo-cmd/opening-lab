import type { Square } from "@/lib/blundr/geometry/boardTypes";
import { coordsToSquare, squareToCoords } from "@/lib/blundr/geometry/lineGeometry";
import { translateSquare } from "./miniGameBoardGeometry";
import type { MiniGamePiecePlacement } from "./miniGameFenBuilder";

export type PieceCode = "K" | "Q" | "R" | "B" | "N" | "P" | "k" | "q" | "r" | "b" | "n" | "p";

export type PiecePlacementMap = Map<Square, PieceCode>;

export function createPlacementMap(placements: readonly MiniGamePiecePlacement[]): PiecePlacementMap {
  const map: PiecePlacementMap = new Map();
  for (const placement of placements) {
    const square = String(placement.square ?? "").trim().toLowerCase() as Square;
    const piece = String(placement.piece ?? "").trim() as PieceCode;
    if (!/^[a-h][1-8]$/.test(square) || !/^[KQRBNPkqrbnp]$/.test(piece)) continue;
    map.set(square, piece);
  }
  return map;
}

export function addPlacement(placements: MiniGamePiecePlacement[], square: Square, piece: PieceCode): boolean {
  const normalizedSquare = String(square ?? "").trim().toLowerCase();
  if (!/^[a-h][1-8]$/.test(normalizedSquare)) return false;
  if (placements.some((entry) => entry.square === normalizedSquare)) return false;
  placements.push({ square: normalizedSquare as Square, piece });
  return true;
}

export function isSquareFree(placements: readonly MiniGamePiecePlacement[], square: Square): boolean {
  return !placements.some((entry) => entry.square === square);
}

export function findFreeSquareNear(
  placements: readonly MiniGamePiecePlacement[],
  anchor: Square,
  deltas: readonly Array<readonly [number, number]>,
): Square | null {
  for (const [fileDelta, rankDelta] of deltas) {
    const target = translateSquare(anchor, fileDelta, rankDelta);
    if (target && isSquareFree(placements, target)) return target;
  }
  return null;
}

export function squareFromOffset(square: Square, fileDelta: number, rankDelta: number): Square | null {
  const coords = squareToCoords(square);
  return coordsToSquare(coords.file + fileDelta, coords.rank + rankDelta) as Square | null;
}

export function buildPlacementListFromMap(map: PiecePlacementMap): MiniGamePiecePlacement[] {
  return Array.from(map.entries()).map(([square, piece]) => ({ square, piece }));
}

export function clonePlacements(placements: readonly MiniGamePiecePlacement[]): MiniGamePiecePlacement[] {
  return placements.map((entry) => ({ ...entry }));
}
