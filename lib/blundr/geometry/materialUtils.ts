import type { BoardPiece, ParsedBoard } from "./boardTypes";
import { PIECE_VALUES } from "./boardTypes";

export function pieceValue(piece: BoardPiece): number {
  return PIECE_VALUES[piece.type] ?? 0;
}

export function materialByColor(board: ParsedBoard): Record<"white" | "black", number> {
  return board.pieces.reduce(
    (acc, piece) => {
      acc[piece.color] += pieceValue(piece);
      return acc;
    },
    { white: 0, black: 0 },
  );
}

export function materialBalance(board: ParsedBoard): number {
  const material = materialByColor(board);
  return material.white - material.black;
}

export function hasBishopPair(board: ParsedBoard, color: "white" | "black"): boolean {
  return board.pieces.filter((piece) => piece.color === color && piece.type === "bishop").length >= 2;
}

export function pieceCounts(board: ParsedBoard): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const piece of board.pieces) {
    const key = `${piece.color}_${piece.type}`;
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}
