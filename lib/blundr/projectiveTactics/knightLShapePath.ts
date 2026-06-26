import type { Square } from "chess.js";
import { squareToBoardPoint, squareToFileRank } from "./projectiveTacticGeometry";
import type { BoardOrientation, BoardPoint } from "./projectiveTacticTypes";

export function isKnightMove(from: Square, to: Square): boolean {
  const source = squareToFileRank(from);
  const target = squareToFileRank(to);
  if (!source || !target) return false;
  const fileDelta = Math.abs(source.file - target.file);
  const rankDelta = Math.abs(source.rank - target.rank);
  return (fileDelta === 1 && rankDelta === 2) || (fileDelta === 2 && rankDelta === 1);
}

export function buildKnightLShapePath(input: {
  from: Square;
  to: Square;
  orientation: BoardOrientation;
}): [BoardPoint, BoardPoint, BoardPoint] | null {
  if (!isKnightMove(input.from, input.to)) return null;
  const start = squareToBoardPoint(input.from, input.orientation);
  const target = squareToBoardPoint(input.to, input.orientation);
  if (!start || !target) return null;
  return [
    start,
    { x: start.x, y: target.y },
    target,
  ];
}
