import type { Color } from "./boardTypes";

export type Direction = readonly [number, number];

export const rookDirections: Direction[] = [[1, 0], [-1, 0], [0, 1], [0, -1]];
export const bishopDirections: Direction[] = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
export const queenDirections: Direction[] = [...rookDirections, ...bishopDirections];
export const knightOffsets: Direction[] = [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]];
export const kingOffsets: Direction[] = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];

export function pawnAttackOffsets(color: Color): Direction[] {
  return color === "white" ? [[-1, 1], [1, 1]] : [[-1, -1], [1, -1]];
}

export function pawnPushOffset(color: Color): Direction {
  return color === "white" ? [0, 1] : [0, -1];
}

export function doublePawnPushRank(color: Color): number {
  return color === "white" ? 2 : 7;
}
