import { Chess } from "chess.js";
export function validateRefutationSequence(
  fen: string,
  moves: readonly string[],
): string[] {
  try {
    const chess = new Chess(fen);
    for (const uci of moves)
      chess.move({
        from: uci.slice(0, 2),
        to: uci.slice(2, 4),
        promotion: uci[4] as "q" | "r" | "b" | "n" | undefined,
      });
    return [];
  } catch {
    return ["illegal_move"];
  }
}
