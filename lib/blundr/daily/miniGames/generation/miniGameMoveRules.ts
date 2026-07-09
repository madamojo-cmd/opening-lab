import { Chess, type Move } from "chess.js";
import type { Square } from "@/lib/blundr/geometry/boardTypes";
import { normalizeText } from "../miniGameUtils";

export type UciMove = {
  from: Square;
  to: Square;
  promotion?: "q" | "r" | "b" | "n";
};

export function parseUciMove(uci: string): UciMove | null {
  const text = normalizeText(uci).toLowerCase();
  if (!/^[a-h][1-8][a-h][1-8][qrbn]?$/i.test(text)) return null;
  const from = text.slice(0, 2) as Square;
  const to = text.slice(2, 4) as Square;
  const promotion = text.length > 4 ? (text.slice(4, 5) as "q" | "r" | "b" | "n") : undefined;
  return { from, to, promotion };
}

export function listLegalMoves(fen: string, fromSquare?: Square): Move[] {
  try {
    const chess = new Chess(normalizeText(fen));
    return (chess.moves(fromSquare ? { square: fromSquare as never, verbose: true } : { verbose: true }) as Move[]) ?? [];
  } catch {
    return [];
  }
}

export function isLegalMove(fen: string, uci: string): boolean {
  const move = parseUciMove(uci);
  if (!move) return false;
  try {
    const chess = new Chess(normalizeText(fen));
    return Boolean(
      chess.move({
        from: move.from as never,
        to: move.to as never,
        promotion: move.promotion as never,
      }),
    );
  } catch {
    return false;
  }
}

export function applyMove(fen: string, uci: string): { fen: string; san: string | null; uci: string; move: Move } | null {
  const move = parseUciMove(uci);
  if (!move) return null;
  try {
    const chess = new Chess(normalizeText(fen));
    const applied = chess.move({
      from: move.from as never,
      to: move.to as never,
      promotion: move.promotion as never,
    }) as Move | null;
    if (!applied) return null;
    return {
      fen: chess.fen(),
      san: applied.san ?? null,
      uci: `${applied.from}${applied.to}${applied.promotion ?? ""}`,
      move: applied,
    };
  } catch {
    return null;
  }
}

export function moveToUci(move: Move): string {
  return `${move.from}${move.to}${move.promotion ?? ""}`;
}

export function legalMovesByFromSquare(fen: string, square: Square): Move[] {
  return listLegalMoves(fen, square);
}

export function findLegalMoveByUci(fen: string, uci: string): Move | null {
  const move = parseUciMove(uci);
  if (!move) return null;
  const legal = listLegalMoves(fen, move.from);
  return legal.find((entry) => entry.from === move.from && entry.to === move.to && (entry.promotion ?? "") === (move.promotion ?? "")) ?? null;
}
