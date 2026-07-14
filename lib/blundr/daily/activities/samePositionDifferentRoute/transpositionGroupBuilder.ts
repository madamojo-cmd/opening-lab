import { Chess } from "chess.js";
import type { LegalRoute } from "./transpositionActivityTypes";
export function replayRoute(
  startFen: string,
  moves: readonly string[],
): LegalRoute | null {
  try {
    const chess = new Chess(startFen);
    for (const uci of moves)
      chess.move({
        from: uci.slice(0, 2),
        to: uci.slice(2, 4),
        promotion: uci[4] as "q" | "r" | "b" | "n" | undefined,
      });
    return { moves: [...moves], finalFen: chess.fen() };
  } catch {
    return null;
  }
}
export function canonicalFen(fen: string): string {
  return fen.split(" ").slice(0, 4).join(" ");
}
export function routesReachSamePosition(a: LegalRoute, b: LegalRoute): boolean {
  return canonicalFen(a.finalFen) === canonicalFen(b.finalFen);
}
