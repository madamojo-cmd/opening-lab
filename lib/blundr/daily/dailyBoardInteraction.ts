import { Chess, type Square } from "chess.js";

export type DailyBoardPiece = { type: string; color: string } | null;

export type DailyBoardMoveAttempt = {
  from: string;
  to: string;
  uci: string;
  san: string | null;
  legal: boolean;
  promotion: string | null;
};

export type DailyBoardClickOutcome = {
  nextSelectedSquare: string | null;
  attempt: DailyBoardMoveAttempt | null;
};

function isOwnPiece(piece: DailyBoardPiece, turn: "w" | "b"): boolean {
  return Boolean(piece && piece.color === turn);
}

export function resolveDailyBoardClick(input: {
  fen: string;
  selectedSquare: string | null;
  square: string;
  piece: DailyBoardPiece;
  turn: "w" | "b";
  squareClickMode?: boolean;
}): DailyBoardClickOutcome {
  if (input.squareClickMode) {
    return { nextSelectedSquare: input.selectedSquare, attempt: null };
  }

  if (!input.selectedSquare) {
    return {
      nextSelectedSquare: isOwnPiece(input.piece, input.turn) ? input.square : null,
      attempt: null,
    };
  }

  if (input.square === input.selectedSquare) {
    return { nextSelectedSquare: null, attempt: null };
  }

  if (isOwnPiece(input.piece, input.turn)) {
    return {
      nextSelectedSquare: input.square,
      attempt: null,
    };
  }

  const trial = new Chess(input.fen);
  let move: ReturnType<Chess["move"]> | null = null;
  try {
    move = trial.move({
      from: input.selectedSquare as Square,
      to: input.square as Square,
      promotion: "q",
    });
  } catch {
    move = null;
  }
  const legal = Boolean(move);
  return {
    nextSelectedSquare: null,
    attempt: {
      from: input.selectedSquare,
      to: input.square,
      uci: legal && move ? `${move.from}${move.to}${move.promotion ?? ""}` : `${input.selectedSquare}${input.square}`,
      san: legal && move ? move.san : null,
      legal,
      promotion: legal && move?.promotion ? move.promotion : null,
    },
  };
}
