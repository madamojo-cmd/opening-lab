import { normalizeRuntimeCastlingUci } from "@/lib/blundr/runtime/uciNormalization";

export const RUNTIME_STARTPOS_PLAY_KEY = "startpos" as const;

export function splitRuntimePlayKey(value: unknown): string[] {
  const text = String(value ?? "")
    .trim()
    .toLowerCase();
  if (!text || text === RUNTIME_STARTPOS_PLAY_KEY) return [];
  return text
    .split(/[\s,]+/)
    .map((move) => normalizeRuntimeCastlingUci(move))
    .filter((move): move is string => Boolean(move));
}

export function canonicalRuntimePlayKey(value: unknown): string {
  const moves = splitRuntimePlayKey(value);
  return moves.length ? moves.join(",") : RUNTIME_STARTPOS_PLAY_KEY;
}

export function appendRuntimeMove(playKey: unknown, moveUci: unknown): string {
  const move = normalizeRuntimeCastlingUci(moveUci);
  if (!move) throw new Error("invalid_uci");
  return [...splitRuntimePlayKey(playKey), move].join(",");
}

export function parentRuntimePlayKey(playKey: unknown): string | null {
  const moves = splitRuntimePlayKey(playKey);
  if (!moves.length) return null;
  return moves.length === 1
    ? RUNTIME_STARTPOS_PLAY_KEY
    : moves.slice(0, -1).join(",");
}
