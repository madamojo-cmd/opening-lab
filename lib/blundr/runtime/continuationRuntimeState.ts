import { Chess } from "chess.js";

export type ContinuationRuntimeStatus =
  | "idle"
  | "requested"
  | "opponent_replying"
  | "analyzing"
  | "ready"
  | "terminal"
  | "error";

export type ContinuationRuntimeState = {
  status: ContinuationRuntimeStatus;
  reason?: "checkmate" | "stalemate" | "draw" | "no_legal_moves" | "game_over" | "not_continuation" | "opponent_to_move" | "candidate_ready" | "analysis_pending" | "analysis_error" | "idle";
  legalMoveCount: number;
  sideToMove: "w" | "b" | null;
};

function isCheckmate(game: Chess): boolean {
  const anyGame = game as any;
  if (typeof anyGame.isCheckmate === "function") return Boolean(anyGame.isCheckmate());
  if (typeof anyGame.in_checkmate === "function") return Boolean(anyGame.in_checkmate());
  if (typeof anyGame.inCheckmate === "function") return Boolean(anyGame.inCheckmate());
  return false;
}

function isStalemate(game: Chess): boolean {
  const anyGame = game as any;
  if (typeof anyGame.isStalemate === "function") return Boolean(anyGame.isStalemate());
  if (typeof anyGame.in_stalemate === "function") return Boolean(anyGame.in_stalemate());
  if (typeof anyGame.inStalemate === "function") return Boolean(anyGame.inStalemate());
  return false;
}

function isDraw(game: Chess): boolean {
  const anyGame = game as any;
  if (typeof anyGame.isDraw === "function") return Boolean(anyGame.isDraw());
  if (typeof anyGame.in_draw === "function") return Boolean(anyGame.in_draw());
  if (typeof anyGame.inDraw === "function") return Boolean(anyGame.inDraw());
  return false;
}

export function classifyContinuationRuntimeState(input: {
  fen: string;
  trainingMode: "restricted" | "continuation";
  isUserTurn: boolean;
  userExplicitlyEnteredContinuation: boolean;
  hasContinuationCandidate: boolean;
  analysisStatus?: ContinuationRuntimeStatus;
}): ContinuationRuntimeState {
  let game: Chess;
  try {
    game = new Chess(input.fen);
  } catch {
    return { status: "error", reason: "analysis_error", legalMoveCount: 0, sideToMove: null };
  }
  const legalMoveCount = game.moves().length;
  const sideToMove = game.turn() as "w" | "b";

  if (input.trainingMode !== "continuation") {
    return { status: "idle", reason: "not_continuation", legalMoveCount, sideToMove };
  }

  if (legalMoveCount === 0 || isCheckmate(game) || isStalemate(game) || isDraw(game)) {
    return {
      status: "terminal",
      reason: isCheckmate(game) ? "checkmate" : isStalemate(game) ? "stalemate" : isDraw(game) ? "draw" : "no_legal_moves",
      legalMoveCount,
      sideToMove,
    };
  }

  if (!input.isUserTurn) {
    return { status: "opponent_replying", reason: "opponent_to_move", legalMoveCount, sideToMove };
  }

  if (input.hasContinuationCandidate) {
    return { status: "ready", reason: "candidate_ready", legalMoveCount, sideToMove };
  }

  if (input.analysisStatus === "error") {
    return { status: "error", reason: "analysis_error", legalMoveCount, sideToMove };
  }

  if (input.analysisStatus === "analyzing" || input.userExplicitlyEnteredContinuation) {
    return { status: "analyzing", reason: "analysis_pending", legalMoveCount, sideToMove };
  }

  return { status: "requested", reason: "idle", legalMoveCount, sideToMove };
}
