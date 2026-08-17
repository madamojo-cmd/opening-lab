import { Chess, type PieceSymbol, type Square } from "chess.js";

import type { ProductionDailyTeachingPayload } from "./productionDailyTypes";

const UCI_MOVE_PATTERN = /^([a-h][1-8])([a-h][1-8])([qrbn])?$/i;

export function isProductionDailyUciMove(value: string): boolean {
  return UCI_MOVE_PATTERN.test(String(value ?? "").trim());
}

export function buildProductionDailyTeachingPayload(input: {
  sourceFen: string;
  moveUci: string;
  note?: string;
}): ProductionDailyTeachingPayload | null {
  const moveUci = String(input.moveUci ?? "").trim().toLowerCase();
  const match = UCI_MOVE_PATTERN.exec(moveUci);
  if (!match) return null;

  try {
    const game = new Chess(input.sourceFen);
    const from = match[1].toLowerCase();
    const to = match[2].toLowerCase();
    const promotion = match[3]?.toLowerCase() ?? null;
    const move = game.move({
      from: from as Square,
      to: to as Square,
      ...(promotion ? { promotion: promotion as PieceSymbol } : {}),
    });
    if (!move) return null;

    return {
      sourceFen: input.sourceFen,
      moveUci,
      moveSan: move.san,
      resultFen: game.fen(),
      from,
      to,
      promotion,
      ...(input.note ? { note: input.note } : {}),
    };
  } catch {
    return null;
  }
}
