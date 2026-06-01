import type { BoardPiece, ParsedBoard, Square } from "./boardTypes";
import { isValidSquare } from "./squareUtils";

export function squareColor(square: Square): "light" | "dark" {
  if (!isValidSquare(square)) return "light";
  const file = square.charCodeAt(0) - 97;
  const rank = Number(square[1]);
  return (file + rank) % 2 === 0 ? "dark" : "light";
}

export function bishopColorComplex(piece: BoardPiece): "light" | "dark" | null {
  if (piece.type !== "bishop") return null;
  return squareColor(piece.square);
}

export function squaresOfColor(color: "light" | "dark"): Square[] {
  const squares: Square[] = [];
  for (let file = 0; file < 8; file += 1) {
    for (let rank = 1; rank <= 8; rank += 1) {
      const square = `${String.fromCharCode(97 + file)}${rank}`;
      if (squareColor(square) === color) squares.push(square);
    }
  }
  return squares;
}

export function weakColorComplex(board: ParsedBoard, color: "white" | "black"): "light" | "dark" | "none" {
  const bishops = board.pieces.filter((piece) => piece.color === color && piece.type === "bishop");
  const hasLight = bishops.some((piece) => squareColor(piece.square) === "light");
  const hasDark = bishops.some((piece) => squareColor(piece.square) === "dark");
  if (!hasLight && hasDark) return "light";
  if (!hasDark && hasLight) return "dark";
  return "none";
}
