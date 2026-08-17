import { Chess, type PieceSymbol, type Square } from "chess.js";

import type {
  ProductionDailyPublicCard,
  ProductionDailyPublicOption,
  ProductionDailyTeachingPayload,
} from "./productionDailyTypes";

const UCI_MOVE_PATTERN = /^([a-h][1-8])([a-h][1-8])([qrbn])?$/i;

export function isProductionDailyUciMove(value: string): boolean {
  return UCI_MOVE_PATTERN.test(String(value ?? "").trim());
}

export function productionDailyOptionMoveUci(
  option: Pick<ProductionDailyPublicOption, "id" | "moveUci">,
): string | null {
  const explicit = String(option.moveUci ?? "").trim().toLowerCase();
  if (isProductionDailyUciMove(explicit)) return explicit;
  const legacyId = String(option.id ?? "").trim().toLowerCase();
  return isProductionDailyUciMove(legacyId) ? legacyId : null;
}

export function productionDailyCardAcceptsBoardInput(
  card: Pick<ProductionDailyPublicCard, "interaction" | "options">,
): boolean {
  return (
    card.interaction === "move" ||
    Boolean(
      card.options?.some(
        (option) => productionDailyOptionMoveUci(option) !== null,
      ),
    )
  );
}

export function resolveProductionDailyBoardAnswer(
  card: Pick<ProductionDailyPublicCard, "interaction" | "options">,
  moveUci: string,
): string {
  const normalizedMove = String(moveUci ?? "").trim().toLowerCase();
  if (card.interaction === "move") return normalizedMove;
  const option = card.options?.find(
    (candidate) =>
      productionDailyOptionMoveUci(candidate) === normalizedMove,
  );
  return option?.id ?? normalizedMove;
}

export function resolveProductionDailyAnswerMoveUci(
  card: Pick<ProductionDailyPublicCard, "options">,
  answer: string,
): string | null {
  const normalizedAnswer = String(answer ?? "").trim();
  if (isProductionDailyUciMove(normalizedAnswer))
    return normalizedAnswer.toLowerCase();
  const option = card.options?.find(
    (candidate) => candidate.id === normalizedAnswer,
  );
  return option ? productionDailyOptionMoveUci(option) : null;
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
