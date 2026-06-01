import { Chess } from "chess.js";

export type TrainingMode = "restricted" | "continuation";
export type TrainerView = "assisted" | "plain";
export type ChessColor = "w" | "b";
export type InstructionTargetKind = "guided_move" | "lichess_branch_move" | "adaptive_branch_move" | "continuation_candidate";

export type InstructionMoveInput = {
  uci?: string | null;
  san?: string | null;
  source?: string | null;
  kind?: InstructionTargetKind | string | null;
  trust?: string | null;
};

export type CurrentInstructionTarget = {
  kind: InstructionTargetKind;
  uci: string;
  san: string;
  from: string;
  to: string;
  promotion?: string;
  color: ChessColor;
  resultingFen: string;
  source: string;
  trust: string;
  pieceType: string;
  capture: boolean;
  check: boolean;
  mate: boolean;
  isCapture: boolean;
  isCheck: boolean;
  isMate: boolean;
  isPromotion: boolean;
  isDevelopment: boolean;
  isDiagonalMove: boolean;
  isKingSafetyMove: boolean;
  isCentralPawnAdvance: boolean;
  isCastle: boolean;
  promotionPiece: string | null;
  fenBefore: string;
};

export type CurrentInstructionFrame = {
  frameId: number | string;
  fen: string;
  normalizedFen: string;
  trainingMode: TrainingMode | string;
  trainerPhase: string;
  trainerView: TrainerView | string;
  isUserTurn: boolean;
  target: CurrentInstructionTarget | null;
  targetSource: string;
  nullReason: string | null;
  invariantKey: string;
  instructionFrameKey: string;   // v2.7.39.1 — stable key for target locking (Coach Perfection Gate)
};

export type VerifiedMoveFacts = ReturnType<typeof buildVerifiedMoveFacts>;

export type BuildCurrentInstructionFrameInput = {
  frameId: number | string;
  fen: string;
  trainingMode: TrainingMode | string;
  trainerPhase: string;
  trainerView: TrainerView | string;
  isUserTurn: boolean;
  guidedMove?: InstructionMoveInput | null;
  continuationCandidate?: InstructionMoveInput | null;
  preferredTargetKind?: InstructionTargetKind | string | null;
};

const USER_TURN_PHASES = new Set(["ready_for_user"]);
const BOOK_TARGET_KINDS = new Set<InstructionTargetKind>(["guided_move", "lichess_branch_move", "adaptive_branch_move"]);
const FILE_TO_INDEX: Record<string, number> = { a: 0, b: 1, c: 2, d: 3, e: 4, f: 5, g: 6, h: 7 };

function normalizeFen(fen: string) {
  return String(fen || "").split(" ").slice(0, 4).join(" ");
}

function normalizeUci(uci?: string | null) {
  const value = String(uci ?? "").trim().toLowerCase();
  return /^[a-h][1-8][a-h][1-8][qrbn]?$/.test(value) ? value : null;
}

function moveToUci(move: any) {
  return `${move.from}${move.to}${move.promotion ?? ""}`.toLowerCase();
}

function coerceTargetKind(value: unknown, fallback: InstructionTargetKind): InstructionTargetKind {
  return value === "lichess_branch_move" || value === "adaptive_branch_move" || value === "continuation_candidate" || value === "guided_move"
    ? value
    : fallback;
}

function isBackRankDevelopment(move: any) {
  if (!move || move.piece !== "n" && move.piece !== "b") return false;
  return (move.color === "w" && move.from[1] === "1") || (move.color === "b" && move.from[1] === "8");
}

function isDiagonalMove(from: string, to: string) {
  const df = Math.abs((FILE_TO_INDEX[from[0]] ?? -99) - (FILE_TO_INDEX[to[0]] ?? 99));
  const dr = Math.abs(Number(from[1]) - Number(to[1]));
  return df > 0 && df === dr;
}

function buildTargetFromMove(fen: string, moveInput: InstructionMoveInput, kind: InstructionTargetKind): CurrentInstructionTarget | null {
  const uci = normalizeUci(moveInput.uci);
  if (!uci) return null;
  try {
    const game = new Chess(fen);
    const from = uci.slice(0, 2);
    const to = uci.slice(2, 4);
    const promotion = uci.length > 4 ? uci.slice(4, 5) : undefined;
    const move = game.move({ from, to, promotion: promotion ?? "q" });
    if (!move) return null;
    const actualUci = moveToUci(move);
    const isKingSafetyMove = move.piece === "k" && Math.abs((FILE_TO_INDEX[from[0]] ?? 0) - (FILE_TO_INDEX[to[0]] ?? 0)) >= 2;
    const isCastle = move.piece === "k" && Math.abs((FILE_TO_INDEX[from[0]] ?? 0) - (FILE_TO_INDEX[to[0]] ?? 0)) >= 2;
    const isCentralPawnAdvance = move.piece === "p" && ["d", "e"].includes(from[0]) && ["d", "e"].includes(to[0]);
    const capture = Boolean(move.captured);
    const check = Boolean(move.san?.includes("+"));
    const mate = Boolean(move.san?.includes("#"));
    return {
      kind,
      uci: actualUci,
      san: move.san || moveInput.san || actualUci,
      from,
      to,
      promotion,
      color: move.color as ChessColor,
      resultingFen: game.fen(),
      source: String(moveInput.source ?? kind),
      trust: String(moveInput.trust ?? (kind === "continuation_candidate" ? "continuation_verified" : "book_verified")),
      pieceType: move.piece,
      capture,
      check,
      mate,
      isCapture: capture,
      isCheck: check,
      isMate: mate,
      isPromotion: Boolean(move.promotion || promotion),
      isDevelopment: isBackRankDevelopment(move),
      isDiagonalMove: isDiagonalMove(from, to),
      isKingSafetyMove,
      isCentralPawnAdvance,
      isCastle,
      promotionPiece: move.promotion ?? null,
      fenBefore: fen,
    };
  } catch {
    return null;
  }
}

export function isBookLikeInstructionTarget(target: CurrentInstructionTarget | null | undefined): target is CurrentInstructionTarget {
  return Boolean(target && BOOK_TARGET_KINDS.has(target.kind));
}

export function buildVerifiedMoveFacts(
  input: CurrentInstructionTarget | { fenBefore: string; uci?: string | null; san?: string | null } | null | undefined,
): any {
  const target =
    input && "fenBefore" in input && "kind" in input === false
      ? buildTargetFromMove(input.fenBefore, { uci: input.uci, san: input.san }, "guided_move")
      : (input as CurrentInstructionTarget | null | undefined);
  if (!target) {
    return {
      verified: false,
      hasTarget: false,
      uci: null,
      san: null,
      from: null,
      to: null,
      pieceType: null,
      piece: null,
      claims: [],
      warnings: ["missing_instruction_target"],
    };
  }

  const pieceNameByCode: Record<string, string> = {
    p: "pawn",
    n: "knight",
    b: "bishop",
    r: "rook",
    q: "queen",
    k: "king",
  };

  const pieceName = pieceNameByCode[target.pieceType] ?? target.pieceType;

  const claims = [
    `move:${target.uci}`,
    `piece:${pieceName}`,
    `from:${target.from}`,
    `to:${target.to}`,
  ];

  if (target.isCapture) claims.push("capture");
  if (target.isCheck) claims.push("check");
  if (target.isMate) claims.push("mate");
  if (target.isPromotion) claims.push("promotion");
  if (target.isDevelopment) claims.push("development");
  if (target.isDiagonalMove) claims.push("diagonal_move");
  if (target.isKingSafetyMove) claims.push("king_safety");
  if (target.isCentralPawnAdvance) claims.push("central_pawn_advance");

  return {
    verified: true,
    hasTarget: true,

    uci: target.uci,
    san: target.san,
    from: target.from,
    to: target.to,
    promotion: target.promotion ?? null,
    promotionPiece: target.promotionPiece ?? null,
    isCastle: target.isCastle,
    color: target.color,

    pieceType: target.pieceType,
    piece: target.pieceType,
    pieceName,

    source: target.source,
    trust: target.trust,
    kind: target.kind,
    resultingFen: target.resultingFen,

    capture: target.capture,
    check: target.check,
    mate: target.mate,

    isCapture: target.isCapture,
    isCheck: target.isCheck,
    isMate: target.isMate,
    isPromotion: target.isPromotion,
    isDevelopment: target.isDevelopment,
    isDiagonalMove: target.isDiagonalMove,
    isKingSafetyMove: target.isKingSafetyMove,
    isCentralPawnAdvance: target.isCentralPawnAdvance,

    claims,
    warnings: [],
  };
}

export function buildCurrentInstructionFrame(input: BuildCurrentInstructionFrameInput): CurrentInstructionFrame {
  const normalizedFen = normalizeFen(input.fen);
  const base = {
    frameId: input.frameId,
    fen: input.fen,
    normalizedFen,
    trainingMode: input.trainingMode,
    trainerPhase: input.trainerPhase,
    trainerView: input.trainerView,
    isUserTurn: input.isUserTurn,
  };

  // v2.7.39.1: compute stable frame key for target locking (used by app to prevent async overwrites)
  const frameKeyInputs = {
    fen: input.fen,
    trainingMode: input.trainingMode,
    isUserTurn: input.isUserTurn,
    trainerPhase: input.trainerPhase,
    source: input.preferredTargetKind || (input.trainingMode === "continuation" ? "continuation" : "guided"),
  };
  const instructionFrameKey = computeInstructionFrameKey(frameKeyInputs);

  if (!input.isUserTurn) {
    return { ...base, target: null, targetSource: "none", nullReason: "opponent_turn", invariantKey: `${normalizedFen}|opponent_turn|none`, instructionFrameKey };
  }

  if (!USER_TURN_PHASES.has(input.trainerPhase)) {
    return { ...base, target: null, targetSource: "none", nullReason: `phase_${input.trainerPhase}`, invariantKey: `${normalizedFen}|${input.trainerPhase}|none`, instructionFrameKey };
  }

  const preferred = input.preferredTargetKind === "continuation_candidate" || input.trainingMode === "continuation" ? "continuation_candidate" : "guided_move";
  const candidates: Array<{ move: InstructionMoveInput | null | undefined; kind: InstructionTargetKind; source: string }> = preferred === "continuation_candidate"
    ? [
        { move: input.continuationCandidate, kind: "continuation_candidate", source: "continuation_candidate" },
        { move: input.guidedMove, kind: coerceTargetKind(input.guidedMove?.kind, "guided_move"), source: "guided_move" },
      ]
    : [
        { move: input.guidedMove, kind: coerceTargetKind(input.guidedMove?.kind, "guided_move"), source: "guided_move" },
        { move: input.continuationCandidate, kind: "continuation_candidate", source: "continuation_candidate" },
      ];

  for (const candidate of candidates) {
    if (!candidate.move?.uci) continue;
    const target = buildTargetFromMove(input.fen, candidate.move, candidate.kind);
    if (target) {
      return { ...base, target, targetSource: candidate.source, nullReason: null, invariantKey: `${normalizedFen}|${target.kind}|${target.uci}`, instructionFrameKey };
    }
  }

  const expectedReason = preferred === "continuation_candidate" ? "missing_or_illegal_continuation_candidate" : "missing_or_illegal_guided_move";
  return { ...base, target: null, targetSource: "none", nullReason: expectedReason, invariantKey: `${normalizedFen}|${preferred}|none`, instructionFrameKey };
}

/**
 * v2.7.39.1 Target Stability (Coach Perfection Gate 3A)
 * Stable key that uniquely identifies an "instructional frame" for target locking.
 * Prevents engine previews, explorer data, or re-renders from swapping the official
 * instructional target (especially continuation_candidate) for the same logical frame.
 */
export function computeInstructionFrameKey(params: {
  fen: string;
  trainingMode: TrainingMode | string;
  isUserTurn: boolean;
  trainerPhase?: string;
  sideToMove?: ChessColor | string;
  userColor?: ChessColor | string;
  source?: string;
}): string {
  const fen4 = normalizeFen(params.fen);
  const mode = String(params.trainingMode || "restricted");
  const userTurn = params.isUserTurn ? "user" : "opponent";
  const phase = String(params.trainerPhase || "ready_for_user");
  const side = String(params.sideToMove || "").slice(0, 1).toLowerCase() || "x";
  const uColor = String(params.userColor || "").slice(0, 1).toLowerCase() || "x";
  const src = String(params.source || "auto").toLowerCase().replace(/[^a-z0-9_]/g, "");
  return [fen4, mode, userTurn, phase, side, uColor, src].join("|");
}
