import { Chess } from "chess.js";
import { normalizeVisualFen } from "../visual/normalizeVisualFen";
import type { RepertoireContinuation } from "./openingTypes";

function moveToUci(move: { from: string; to: string; promotion?: string }): string {
  return `${move.from}${move.to}${move.promotion ?? ""}`;
}

function piecePriority(move: any): number {
  const uci = moveToUci(move);
  if (move.san === "O-O" || move.san === "O-O-O") return 100;
  if (["e2e4", "d2d4", "e7e5", "d7d5", "c2c4", "c7c5"].includes(uci)) return 90;
  if (move.piece === "n" && ["c3", "f3", "c6", "f6", "d2", "e2", "d7", "e7"].includes(move.to)) return 80;
  if (move.piece === "b" && !["c1", "f1", "c8", "f8"].includes(move.to)) return 70;
  if (move.piece === "p" && ["c3", "c6", "d3", "d6", "e3", "e6"].includes(move.to)) return 55;
  if (move.piece === "r" && ["d1", "e1", "d8", "e8"].includes(move.to)) return 45;
  return 10;
}

export interface OpeningFamilyPlanFallback {
  continuation: RepertoireContinuation | null;
  planType: string | null;
  reason: string;
}

export function resolveOpeningFamilyPlanFallback(input: {
  fen: string;
  openingId: string;
  lineId: string;
  userColor: "w" | "b";
}): OpeningFamilyPlanFallback {
  try {
    const game = new Chess(input.fen);
    if (game.turn() !== input.userColor) {
      return { continuation: null, planType: null, reason: "not_user_turn" };
    }
    const legal = (game.moves({ verbose: true }) as any[]).filter((move) => move.color === input.userColor);
    const selected = legal
      .map((move) => ({ move, score: piecePriority(move) }))
      .sort((a, b) => b.score - a.score || String(a.move.san).localeCompare(String(b.move.san)) || moveToUci(a.move).localeCompare(moveToUci(b.move)))[0];
    if (!selected || selected.score < 45) {
      return { continuation: null, planType: null, reason: "no_concrete_plan_move" };
    }
    const clone = new Chess(input.fen);
    const moveInput: { from: string; to: string; promotion?: string } = { from: selected.move.from, to: selected.move.to };
    if (selected.move.promotion) {
      moveInput.promotion = selected.move.promotion;
    }
    const applied = clone.move(moveInput);
    if (!applied) return { continuation: null, planType: null, reason: "selected_move_failed_legality" };
    const planType =
      applied.san === "O-O" || applied.san === "O-O-O" ? "castle_and_connect_rooks" :
      applied.piece === "p" && ["e", "d", "c"].includes(applied.to[0]) ? "central_break_preparation" :
      applied.piece === "n" || applied.piece === "b" ? "development_completion" :
      applied.piece === "r" ? "rook_centralization" :
      "general_feature_plan";
    return {
      continuation: {
        san: applied.san,
        uci: moveToUci(applied),
        color: applied.color as "w" | "b",
        resultingFen: clone.fen(),
        resultingFen4: normalizeVisualFen(clone.fen()),
        source: "legacy_recoverable",
        lineId: input.lineId,
        openingId: input.openingId,
        ply: game.history().length,
      },
      planType,
      reason: "generic_opening_family_plan_move",
    };
  } catch {
    return { continuation: null, planType: null, reason: "fallback_exception" };
  }
}
