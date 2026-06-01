import type { BoardPiece, Color, ParsedBoard, Square } from "./boardTypes";
import { bishopDirections, kingOffsets, knightOffsets, pawnAttackOffsets, queenDirections, rookDirections } from "./directionUtils";
import { fileIndex, isValidSquare, rankOf, squareFrom } from "./squareUtils";
import { directSliderAttack, xrayAlignment } from "./rayGeometry";

export interface AttackMapOptions {
  directOnly?: boolean;
  includeXray?: boolean;
  includeKingUnsafe?: boolean;
  pseudoLegal?: boolean;
}

function offsetSquares(from: Square, offsets: ReadonlyArray<readonly [number, number]>): Square[] {
  if (!isValidSquare(from)) return [];
  return offsets.map(([df, dr]) => squareFrom(fileIndex(from[0]) + df, rankOf(from) + dr)).filter(Boolean) as Square[];
}

function sliderSquares(board: ParsedBoard, from: Square, directions: ReadonlyArray<readonly [number, number]>, includeXray = false): Square[] {
  const out: Square[] = [];
  for (const direction of directions) {
    let blocked = false;
    let file = fileIndex(from[0]) + direction[0];
    let rank = rankOf(from) + direction[1];
    while (true) {
      const sq = squareFrom(file, rank);
      if (!sq) break;
      if (!blocked) out.push(sq);
      else if (includeXray) out.push(sq);
      if (board.pieceBySquare[sq] && !blocked) blocked = true;
      file += direction[0];
      rank += direction[1];
    }
  }
  return out;
}

export function getPieceAttacks(board: ParsedBoard, square: Square, options: AttackMapOptions = {}): Square[] {
  const piece = board.pieceBySquare[square];
  if (!piece) return [];
  if (piece.type === "pawn") return offsetSquares(square, pawnAttackOffsets(piece.color));
  if (piece.type === "knight") return offsetSquares(square, knightOffsets);
  if (piece.type === "king") return offsetSquares(square, kingOffsets);
  if (piece.type === "bishop") return sliderSquares(board, square, bishopDirections, options.includeXray && !options.directOnly);
  if (piece.type === "rook") return sliderSquares(board, square, rookDirections, options.includeXray && !options.directOnly);
  if (piece.type === "queen") return sliderSquares(board, square, queenDirections, options.includeXray && !options.directOnly);
  return [];
}

export function getAttackedSquares(board: ParsedBoard, color: Color, options: AttackMapOptions = {}): Square[] {
  const set = new Set<Square>();
  for (const piece of board.pieces) {
    if (piece.color !== color) continue;
    for (const square of getPieceAttacks(board, piece.square, options)) set.add(square);
  }
  return Array.from(set).sort();
}

export function squareAttackedBy(board: ParsedBoard, square: Square, color: Color, options: AttackMapOptions = {}): boolean {
  return attackersTo(board, square, color, options).length > 0;
}

export function attackersTo(board: ParsedBoard, square: Square, color: Color, options: AttackMapOptions = {}): BoardPiece[] {
  return board.pieces.filter((piece) => piece.color === color && getPieceAttacks(board, piece.square, options).includes(square));
}

export function defendersOf(board: ParsedBoard, square: Square, color: Color, options: AttackMapOptions = {}): BoardPiece[] {
  return attackersTo(board, square, color, options);
}

export function getDirectAttackersTo(board: ParsedBoard, square: Square, color: Color): BoardPiece[] {
  return attackersTo(board, square, color, { directOnly: true });
}

export function getXrayAttackersTo(board: ParsedBoard, square: Square, color: Color): BoardPiece[] {
  return board.pieces.filter((piece) => {
    if (piece.color !== color) return false;
    if (piece.type !== "bishop" && piece.type !== "rook" && piece.type !== "queen") return false;
    const alignment = xrayAlignment(board, piece.square, square);
    return alignment.aligned && !alignment.direct;
  });
}

export function directPieceAttacksSquare(board: ParsedBoard, from: Square, target: Square): boolean {
  const piece = board.pieceBySquare[from];
  if (!piece) return false;
  if (piece.type === "bishop" || piece.type === "rook" || piece.type === "queen") return directSliderAttack(board, from, target);
  return getPieceAttacks(board, from, { directOnly: true }).includes(target);
}
