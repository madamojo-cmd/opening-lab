import { normalizeVisualFen } from "../visual/normalizeVisualFen";
import type { BoardPiece, Color, ParsedBoard, PieceType, Square } from "./boardTypes";
import { isValidSquare } from "./squareUtils";

const pieceMap: Record<string, PieceType> = {
  k: "king",
  q: "queen",
  r: "rook",
  b: "bishop",
  n: "knight",
  p: "pawn",
};

export function parseFenBoard(fen: string): ParsedBoard {
  const fields = fen.trim().split(/\s+/);
  const placement = fields[0] ?? "";
  const sideToMove: Color = fields[1] === "b" ? "black" : "white";
  const castlingRights = fields[2] ?? "-";
  const enPassantSquare = fields[3] && fields[3] !== "-" && isValidSquare(fields[3]) ? fields[3] : null;
  const pieces: BoardPiece[] = [];
  const pieceBySquare: Record<Square, BoardPiece | undefined> = {};
  let malformed = false;

  const ranks = placement.split("/");
  if (ranks.length !== 8) malformed = true;
  ranks.forEach((rankText, rankIndex) => {
    let fileIndex = 0;
    for (const char of rankText) {
      if (/\d/.test(char)) {
        fileIndex += Number(char);
        continue;
      }
      const type = pieceMap[char.toLowerCase()];
      const file = "abcdefgh"[fileIndex];
      const rank = 8 - rankIndex;
      const square = `${file}${rank}`;
      if (!type || !isValidSquare(square)) {
        malformed = true;
        fileIndex += 1;
        continue;
      }
      const piece: BoardPiece = {
        color: char === char.toUpperCase() ? "white" : "black",
        type,
        square,
      };
      pieces.push(piece);
      pieceBySquare[square] = piece;
      fileIndex += 1;
    }
    if (fileIndex !== 8) malformed = true;
  });

  return {
    fen,
    normalizedFen: normalizeVisualFen(fen),
    sideToMove,
    pieces,
    castlingRights,
    enPassantSquare,
    pieceBySquare,
    malformed,
  };
}
