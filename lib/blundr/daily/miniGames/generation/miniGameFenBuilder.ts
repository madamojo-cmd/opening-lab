import { Chess } from "chess.js";
import type { Square } from "@/lib/blundr/geometry/boardTypes";
import { normalizeText } from "../miniGameUtils";

export type MiniGamePiecePlacement = {
  square: Square;
  piece: string;
};

export function normalizeFen(fen: string): string {
  return normalizeText(fen).replace(/\s+/g, " ");
}

export function buildFenFromPieces(pieces: readonly MiniGamePiecePlacement[], sideToMove: "w" | "b" = "w"): string {
  const board = Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => ""));
  for (const entry of pieces) {
    const text = normalizeText(entry.square).toLowerCase();
    if (!/^[a-h][1-8]$/.test(text)) continue;
    const file = text.charCodeAt(0) - 97;
    const rank = 8 - Number(text.slice(1));
    if (file < 0 || file > 7 || rank < 0 || rank > 7) continue;
    board[rank][file] = normalizeText(entry.piece);
  }

  const placement = board
    .map((rank) => {
      let empty = 0;
      let row = "";
      for (const cell of rank) {
        if (!cell) {
          empty += 1;
          continue;
        }
        if (empty > 0) {
          row += String(empty);
          empty = 0;
        }
        row += cell;
      }
      if (empty > 0) row += String(empty);
      return row || "8";
    })
    .join("/");

  return `${placement} ${sideToMove} - - 0 1`;
}

export function validateGeneratedFen(fen: string): boolean {
  try {
    const chess = new Chess(normalizeFen(fen));
    return Boolean(chess.fen());
  } catch {
    return false;
  }
}

export function buildFenSignature(fen: string): string {
  return normalizeFen(fen);
}
