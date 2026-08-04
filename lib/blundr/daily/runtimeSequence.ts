import { Chess } from "chess.js";

export function splitRuntimeMoveSequence(sequence: string): string[] {
  return sequence
    .trim()
    .split(/[,\s]+/)
    .filter(Boolean);
}

export function runtimeSequenceToFen(sequence: string): string | null {
  try {
    const chess = new Chess();
    for (const uci of splitRuntimeMoveSequence(sequence)) {
      chess.move({
        from: uci.slice(0, 2),
        to: uci.slice(2, 4),
        promotion: uci[4] as "q" | "r" | "b" | "n" | undefined,
      });
    }
    return chess.fen();
  } catch {
    return null;
  }
}
