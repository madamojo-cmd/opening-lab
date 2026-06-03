export type BlundrColor = "white" | "black";
export type ChessColor = "w" | "b";

export type BlundrPieceType =
  | "pawn"
  | "knight"
  | "bishop"
  | "rook"
  | "queen"
  | "king"
  | "p"
  | "n"
  | "b"
  | "r"
  | "q"
  | "k";

export type BlundrSquare = string;

export type CurrentInstructionFrameKind =
  | "guided_move"
  | "lichess_branch_move"
  | "adaptive_branch_move"
  | "continuation_candidate"
  | "opponent_replying"
  | "transitioning"
  | "branch_complete"
  | "terminal"
  | "blocked";

export type CurrentInstructionMode =
  | "guided"
  | "continuation"
  | "terminal"
  | "blocked";

export type CurrentInstructionSource =
  | "opening_tree"
  | "lichess_branch"
  | "adaptive_branch"
  | "continuation_policy"
  | "terminal"
  | "none"
  | "opening_branch"
  | "opening_family_plan"
  | "continuation_candidate"
  | "lesson_line"
  | "legacy_recoverable"
  | "engine_preview_fallback";

export type CurrentInstructionTargetConfidence = "locked" | "derived" | "fallback";

export type CurrentInstructionTarget = {
  uci: string;
  san?: string;
  from: BlundrSquare;
  to: BlundrSquare;
  pieceType: BlundrPieceType;
  color: ChessColor;
  blundrColor?: BlundrColor;
  flags: {
    isCapture: boolean;
    isCheck: boolean;
    isCheckmate: boolean;
    isCastle: boolean;
    isPromotion: boolean;
    isEnPassant: boolean;
  };
  provenance: {
    source: CurrentInstructionSource;
    reason: string;
    confidence: CurrentInstructionTargetConfidence;
  };

  // Compatibility fields used by existing runtime/presentation code.
  kind?: string;
  source?: string;
  trust?: string;
  resultingFen?: string;
  fenBefore?: string;
  promotion?: string;
  promotionPiece?: string | null;
  capture?: boolean;
  check?: boolean;
  mate?: boolean;
  isCapture: boolean;
  isCheck: boolean;
  isMate: boolean;
  isCheckmate: boolean;
  isPromotion: boolean;
  isCastle: boolean;
  isEnPassant: boolean;
  isDevelopment?: boolean;
  isDiagonalMove?: boolean;
  isKingSafetyMove?: boolean;
  isCentralPawnAdvance?: boolean;
};

export type CurrentInstructionDebugIssue = {
  code:
    | "missing_instruction_target"
    | "illegal_instruction_target"
    | "target_piece_missing"
    | "stale_instruction_frame"
    | "target_source_ambiguous"
    | "continuation_candidate_unlocked"
    | "opponent_turn_has_user_target"
    | "terminal_frame_has_target";
  severity: "info" | "warning" | "critical";
  message: string;
  details?: Record<string, unknown>;
};

const PIECE_BY_CODE: Record<string, BlundrPieceType> = {
  p: "pawn",
  n: "knight",
  b: "bishop",
  r: "rook",
  q: "queen",
  k: "king",
};

export function pieceCodeToBlundrPieceType(code: string | null | undefined): BlundrPieceType | null {
  if (!code) return null;
  return PIECE_BY_CODE[String(code).toLowerCase()] ?? null;
}

export function normalizeBlundrColorFromChessColor(color: ChessColor | BlundrColor | null | undefined): BlundrColor {
  if (color === "white" || color === "w") return "white";
  return "black";
}

export function normalizeBlundrColor(color: BlundrColor | ChessColor): BlundrColor {
  return normalizeBlundrColorFromChessColor(color);
}

export function normalizeChessColor(color: BlundrColor | ChessColor): ChessColor {
  return color === "white" ? "w" : color === "black" ? "b" : color;
}

export function splitUciMove(uci: string): { from: BlundrSquare; to: BlundrSquare; promotion?: string | null } {
  const normalized = String(uci || "").trim().toLowerCase();
  if (!/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(normalized)) {
    throw new Error(`Invalid UCI move: ${uci}`);
  }
  return {
    from: normalized.slice(0, 2),
    to: normalized.slice(2, 4),
    promotion: normalized.length > 4 ? normalized.slice(4, 5) : null,
  };
}

export function getTargetSignature(target: CurrentInstructionTarget | null): string | null {
  if (!target) return null;
  return `${target.uci}|${target.pieceType}|${target.from}->${target.to}`;
}

export function getCurrentInstructionTargetSignature(target: CurrentInstructionTarget | null | undefined): string {
  return getTargetSignature(target ?? null) ?? "none";
}
