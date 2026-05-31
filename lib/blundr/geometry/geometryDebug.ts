import type { ParsedBoard } from "./boardTypes";

export function summarizeGeometry(board: ParsedBoard): Record<string, unknown> {
  return {
    normalizedFen: board.normalizedFen,
    sideToMove: board.sideToMove,
    pieceCount: board.pieces.length,
    malformed: Boolean(board.malformed),
  };
}
