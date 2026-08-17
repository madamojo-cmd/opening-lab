import { Chess } from "chess.js";

const UCI_PATTERN = /^[a-h][1-8][a-h][1-8][qrbn]?$/;
const MAX_CONTINUATION_CHECKMATE_PLIES = 128;

export type VerifiedContinuationCheckmatePath = {
  pathUci: string[];
  completedFen: string;
  matingMoveUci: string;
};

export function verifyContinuationCheckmatePath(input: {
  terminalFen: string;
  userColor: "w" | "b";
  pathUci: readonly unknown[];
}): VerifiedContinuationCheckmatePath {
  const pathUci = input.pathUci.map((move) =>
    String(move ?? "")
      .trim()
      .toLowerCase(),
  );
  if (
    pathUci.length < 1 ||
    pathUci.length > MAX_CONTINUATION_CHECKMATE_PLIES ||
    pathUci.some((move) => !UCI_PATTERN.test(move))
  ) {
    throw new Error("continuation_checkmate_path_invalid");
  }

  let game: Chess;
  try {
    game = new Chess(input.terminalFen);
  } catch {
    throw new Error("continuation_terminal_position_invalid");
  }
  if (game.isGameOver() || game.moves().length === 0) {
    throw new Error("continuation_terminal_position_unplayable");
  }

  let userMoveCount = 0;
  let lastMover: "w" | "b" | null = null;
  for (const [index, uci] of pathUci.entries()) {
    if (game.isGameOver()) {
      throw new Error("continuation_checkmate_path_invalid");
    }
    const mover = game.turn();
    let applied = null;
    try {
      applied = game.move({
        from: uci.slice(0, 2),
        to: uci.slice(2, 4),
        promotion: uci[4] as "q" | "r" | "b" | "n" | undefined,
      });
    } catch {
      applied = null;
    }
    if (!applied) throw new Error("continuation_move_illegal");
    if (mover === input.userColor) userMoveCount += 1;
    lastMover = mover;

    if (index < pathUci.length - 1 && game.isGameOver()) {
      throw new Error("continuation_checkmate_path_invalid");
    }
  }

  if (userMoveCount < 1 || lastMover !== input.userColor) {
    throw new Error("continuation_checkmate_not_learner");
  }
  if (!game.isCheckmate()) {
    throw new Error("continuation_checkmate_unverified");
  }

  return {
    pathUci,
    completedFen: game.fen(),
    matingMoveUci: pathUci[pathUci.length - 1],
  };
}
