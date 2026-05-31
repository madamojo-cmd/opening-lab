export type Color = "white" | "black";
export type PieceType = "king" | "queen" | "rook" | "bishop" | "knight" | "pawn";
export type Square = string;

export interface BoardPiece {
  color: Color;
  type: PieceType;
  square: Square;
}

export interface ParsedBoard {
  fen: string;
  normalizedFen: string;
  sideToMove: Color;
  pieces: BoardPiece[];
  castlingRights: string;
  enPassantSquare: string | null;
  pieceBySquare: Record<Square, BoardPiece | undefined>;
  malformed?: boolean;
}

export const PIECE_VALUES: Record<PieceType, number> = {
  king: 0,
  queen: 9,
  rook: 5,
  bishop: 3,
  knight: 3,
  pawn: 1,
};
