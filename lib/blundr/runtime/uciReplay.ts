import { Chess } from "chess.js";

import { normalizeRuntimeCastlingUci } from "./uciNormalization";

function toSanCastlingMove(uci: string): string | null {
  if (uci === "e1g1" || uci === "e8g8") return "O-O";
  if (uci === "e1c1" || uci === "e8c8") return "O-O-O";
  return null;
}

function toUciMove(uci: string): { from: string; to: string; promotion?: string } {
  return {
    from: uci.slice(0, 2),
    to: uci.slice(2, 4),
    promotion: uci.length > 4 ? uci.slice(4, 5) : undefined,
  };
}

export function applyRuntimeUciMove(
  game: Chess,
  uci: unknown,
): { from: string; to: string; promotion?: string; san: string; color: "w" | "b"; piece: string } | null {
  const normalized = normalizeRuntimeCastlingUci(uci);
  if (!normalized) return null;
  const castlingSan = toSanCastlingMove(normalized);
  const move = castlingSan ? game.move(castlingSan) : game.move(toUciMove(normalized));
  if (!move) return null;
  return {
    from: String(move.from),
    to: String(move.to),
    promotion: move.promotion ?? undefined,
    san: String(move.san),
    color: move.color as "w" | "b",
    piece: String(move.piece),
  };
}

