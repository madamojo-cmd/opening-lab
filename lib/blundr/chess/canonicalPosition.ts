import { Chess } from "chess.js";

export type CanonicalFenParts = {
  piecePlacement: string;
  sideToMove: "w" | "b";
  castlingRights: string;
  enPassantSquare: string;
};

export type ChessRuleState = {
  checkmate: boolean;
  stalemate: boolean;
  deadPosition: boolean;
  threefoldClaimable: boolean;
  fivefoldAutomatic: boolean;
  fiftyMoveClaimable: boolean;
  seventyFiveMoveAutomatic: boolean;
  automaticDraw: boolean;
  claimableDraw: boolean;
  terminal: boolean;
  reason:
    | "checkmate"
    | "stalemate"
    | "dead_position"
    | "fivefold_repetition"
    | "seventy_five_move_rule"
    | "threefold_repetition_claimable"
    | "fifty_move_rule_claimable"
    | null;
};

function parseFenParts(fen: string): CanonicalFenParts {
  const fields = fen.trim().split(/\s+/);
  if (fields.length < 4) throw new Error("invalid_fen");
  const sideToMove = fields[1] === "b" ? "b" : fields[1] === "w" ? "w" : null;
  if (!sideToMove) throw new Error("invalid_fen_side");
  return {
    piecePlacement: fields[0],
    sideToMove,
    castlingRights: fields[2] || "-",
    enPassantSquare: fields[3] || "-",
  };
}

export function canonicalPositionFen(fen: string): string {
  const normalized = new Chess(fen).fen();
  const parts = parseFenParts(normalized);
  return [
    parts.piecePlacement,
    parts.sideToMove,
    parts.castlingRights,
    parts.enPassantSquare,
  ].join(" ");
}

export function canonicalPositionFenFromChess(chess: Chess): string {
  return canonicalPositionFen(chess.fen());
}

export function halfmoveClock(fen: string): number {
  const value = Number(fen.trim().split(/\s+/)[4] ?? 0);
  return Number.isFinite(value) ? value : 0;
}

export function classifyChessRuleState(
  chess: Chess,
  positionCounts?: ReadonlyMap<string, number>,
): ChessRuleState {
  const repetitions =
    positionCounts?.get(canonicalPositionFenFromChess(chess)) ??
    (chess.isThreefoldRepetition() ? 3 : 1);
  const halfmoves = halfmoveClock(chess.fen());
  const checkmate = chess.isCheckmate();
  const stalemate = !checkmate && chess.isStalemate();
  const deadPosition =
    !checkmate && !stalemate && chess.isInsufficientMaterial();
  const fivefoldAutomatic = !checkmate && repetitions >= 5;
  const seventyFiveMoveAutomatic = !checkmate && halfmoves >= 150;
  const threefoldClaimable =
    !checkmate && !fivefoldAutomatic && repetitions >= 3;
  const fiftyMoveClaimable =
    !checkmate && !seventyFiveMoveAutomatic && halfmoves >= 100;
  const automaticDraw =
    stalemate || deadPosition || fivefoldAutomatic || seventyFiveMoveAutomatic;
  const claimableDraw = threefoldClaimable || fiftyMoveClaimable;
  const terminal = checkmate || automaticDraw;
  const reason: ChessRuleState["reason"] = checkmate
    ? "checkmate"
    : stalemate
      ? "stalemate"
      : deadPosition
        ? "dead_position"
        : fivefoldAutomatic
          ? "fivefold_repetition"
          : seventyFiveMoveAutomatic
            ? "seventy_five_move_rule"
            : threefoldClaimable
              ? "threefold_repetition_claimable"
              : fiftyMoveClaimable
                ? "fifty_move_rule_claimable"
                : null;
  return {
    checkmate,
    stalemate,
    deadPosition,
    threefoldClaimable,
    fivefoldAutomatic,
    fiftyMoveClaimable,
    seventyFiveMoveAutomatic,
    automaticDraw,
    claimableDraw,
    terminal,
    reason,
  };
}
