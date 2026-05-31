import type { BoardPiece, ParsedBoard, Square } from "./boardTypes";
import type { Direction } from "./directionUtils";
import { bishopDirections, queenDirections, rookDirections } from "./directionUtils";
import { fileIndex, isValidSquare, rankOf, squareFrom } from "./squareUtils";

export interface RayTrace {
  from: Square;
  direction: Direction;
  pathSquares: Square[];
  firstPiece?: BoardPiece;
  blockedBy?: BoardPiece;
  targetReached?: boolean;
}

export interface XrayAlignment {
  aligned: boolean;
  direct: boolean;
  blockers: BoardPiece[];
}

export function traceRay(board: ParsedBoard, from: Square, direction: Direction): RayTrace {
  const pathSquares: Square[] = [];
  let firstPiece: BoardPiece | undefined;
  if (!isValidSquare(from)) return { from, direction, pathSquares };
  let file = fileIndex(from[0]) + direction[0];
  let rank = rankOf(from) + direction[1];
  while (true) {
    const sq = squareFrom(file, rank);
    if (!sq) break;
    pathSquares.push(sq);
    const piece = board.pieceBySquare[sq];
    if (piece) {
      firstPiece = piece;
      break;
    }
    file += direction[0];
    rank += direction[1];
  }
  return { from, direction, pathSquares, firstPiece, blockedBy: firstPiece };
}

export function lineDirectionBetween(a: Square, b: Square): Direction | null {
  if (!isValidSquare(a) || !isValidSquare(b) || a === b) return null;
  const df = fileIndex(b[0]) - fileIndex(a[0]);
  const dr = rankOf(b) - rankOf(a);
  if (df === 0) return [0, Math.sign(dr)] as Direction;
  if (dr === 0) return [Math.sign(df), 0] as Direction;
  if (Math.abs(df) === Math.abs(dr)) return [Math.sign(df), Math.sign(dr)] as Direction;
  return null;
}

export function squaresBetween(a: Square, b: Square): Square[] {
  const direction = lineDirectionBetween(a, b);
  if (!direction) return [];
  const out: Square[] = [];
  let file = fileIndex(a[0]) + direction[0];
  let rank = rankOf(a) + direction[1];
  while (true) {
    const sq = squareFrom(file, rank);
    if (!sq || sq === b) break;
    out.push(sq);
    file += direction[0];
    rank += direction[1];
  }
  return out;
}

export function firstPieceOnRay(board: ParsedBoard, from: Square, direction: Direction): BoardPiece | undefined {
  return traceRay(board, from, direction).firstPiece;
}

function sliderCanUseDirection(piece: BoardPiece | undefined, direction: Direction): boolean {
  if (!piece) return false;
  const isRookDir = rookDirections.some(([df, dr]) => df === direction[0] && dr === direction[1]);
  const isBishopDir = bishopDirections.some(([df, dr]) => df === direction[0] && dr === direction[1]);
  if (piece.type === "queen") return queenDirections.some(([df, dr]) => df === direction[0] && dr === direction[1]);
  if (piece.type === "rook") return isRookDir;
  if (piece.type === "bishop") return isBishopDir;
  return false;
}

export function directSliderAttack(board: ParsedBoard, from: Square, target: Square): boolean {
  const direction = lineDirectionBetween(from, target);
  const piece = board.pieceBySquare[from];
  if (!direction || !sliderCanUseDirection(piece, direction)) return false;
  return squaresBetween(from, target).every((sq) => !board.pieceBySquare[sq]);
}

export function xrayAlignment(board: ParsedBoard, from: Square, target: Square): XrayAlignment {
  const direction = lineDirectionBetween(from, target);
  const piece = board.pieceBySquare[from];
  if (!direction || !sliderCanUseDirection(piece, direction)) return { aligned: false, direct: false, blockers: [] };
  const blockers = squaresBetween(from, target).map((sq) => board.pieceBySquare[sq]).filter(Boolean) as BoardPiece[];
  return { aligned: true, direct: blockers.length === 0, blockers };
}

export function isSameFile(a: Square, b: Square): boolean {
  return isValidSquare(a) && isValidSquare(b) && a[0] === b[0];
}

export function isSameRank(a: Square, b: Square): boolean {
  return isValidSquare(a) && isValidSquare(b) && a[1] === b[1];
}

export function isSameDiagonal(a: Square, b: Square): boolean {
  return isValidSquare(a) && isValidSquare(b) && Math.abs(fileIndex(a[0]) - fileIndex(b[0])) === Math.abs(rankOf(a) - rankOf(b));
}
