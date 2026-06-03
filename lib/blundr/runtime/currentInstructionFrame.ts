import { Chess } from "chess.js";
import {
  type BlundrColor,
  type ChessColor,
  type BlundrPieceType,
  type BlundrSquare,
  type CurrentInstructionTarget,
  type CurrentInstructionSource,
  type CurrentInstructionFrameKind,
  type CurrentInstructionMode,
  type CurrentInstructionDebugIssue,
  getCurrentInstructionTargetSignature,
  getTargetSignature,
  normalizeBlundrColorFromChessColor,
  normalizeChessColor,
} from "./currentInstructionTarget";

export type TrainingMode = "restricted" | "continuation";
export type TrainerView = "assisted" | "plain";
export type InstructionTargetKind = "guided_move" | "lichess_branch_move" | "adaptive_branch_move" | "continuation_candidate";

export type InstructionMoveInput = {
  uci?: string | null;
  san?: string | null;
  source?: string | null;
  kind?: InstructionTargetKind | string | null;
  trust?: string | null;
};

export type CurrentInstructionFrame = {
  frameKey: string;
  kind: CurrentInstructionFrameKind;
  fenBefore: string;
  fenAfterTarget?: string;
  ply: number;
  sideToMove: BlundrColor;
  target: CurrentInstructionTarget | null;
  mode: CurrentInstructionMode;
  source: CurrentInstructionSource;
  debug: {
    issues: CurrentInstructionDebugIssue[];
    targetSignature: string | null;
    createdAt: string;
  };
  branchComplete?: {
    isComplete: boolean;
    reason?: string;
    continueFromHereAvailable?: boolean;
  };
  continuation?: {
    candidateLocked: boolean;
    candidateUci?: string | null;
    reason?: string;
  };

  // Compatibility fields used across current app runtime.
  frameId: number | string;
  fen: string;
  normalizedFen: string;
  trainingMode: TrainingMode | string;
  trainerPhase: string;
  trainerView: TrainerView | string;
  isUserTurn: boolean;
  targetSource: string;
  nullReason: string | null;
  invariantKey: string;
  instructionFrameKey: string;
};

export type VerifiedMoveFacts = ReturnType<typeof buildVerifiedMoveFacts>;

export type LegacyBuildCurrentInstructionFrameInput = {
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

export type CanonicalBuildCurrentInstructionFrameInput = {
  kind: CurrentInstructionFrameKind;
  fenBefore: string;
  fenAfterTarget?: string;
  ply: number;
  sideToMove: BlundrColor | ChessColor;
  target?: CurrentInstructionTarget | null;
  mode: CurrentInstructionMode;
  source: CurrentInstructionSource;
  branchComplete?: {
    isComplete: boolean;
    reason?: string;
    continueFromHereAvailable?: boolean;
  };
  continuation?: {
    candidateLocked: boolean;
    candidateUci?: string | null;
    reason?: string;
  };
  debug?: Partial<CurrentInstructionFrame["debug"]>;
};

export type BuildCurrentInstructionFrameInput =
  | LegacyBuildCurrentInstructionFrameInput
  | CanonicalBuildCurrentInstructionFrameInput;

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
  if (!move || (move.piece !== "n" && move.piece !== "b")) return false;
  return (move.color === "w" && move.from[1] === "1") || (move.color === "b" && move.from[1] === "8");
}

function isDiagonalMove(from: string, to: string) {
  const df = Math.abs((FILE_TO_INDEX[from[0]] ?? -99) - (FILE_TO_INDEX[to[0]] ?? 99));
  const dr = Math.abs(Number(from[1]) - Number(to[1]));
  return df > 0 && df === dr;
}

function mapSource(raw: string | null | undefined, fallbackKind: InstructionTargetKind): CurrentInstructionSource {
  const value = String(raw ?? fallbackKind);
  if (value === "opening_branch") return "lichess_branch";
  if (value === "opening_family_plan") return "adaptive_branch";
  if (value === "continuation_candidate") return "continuation_policy";
  if (value === "lesson_line") return "opening_tree";
  if (value === "engine_preview_fallback") return "engine_preview_fallback";
  if (value === "legacy_recoverable") return "legacy_recoverable";
  if (value === "guided_move" || value === "lichess_branch_move" || value === "adaptive_branch_move") return "opening_tree";
  return "none";
}

function mapMode(trainingMode: TrainingMode | string, hasTarget: boolean, kind: CurrentInstructionFrameKind): CurrentInstructionMode {
  if (kind === "terminal") return "terminal";
  if (!hasTarget) return "blocked";
  return trainingMode === "continuation" ? "continuation" : "guided";
}

function estimatePlyFromFen(fen: string): number {
  const parts = String(fen).split(" ");
  const fullMove = Number(parts[5] ?? 1) || 1;
  const side = parts[1] === "b" ? 1 : 0;
  return Math.max(0, (fullMove - 1) * 2 + side);
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
    const isEnPassant = Boolean(move.flags?.includes("e"));

    return {
      kind,
      uci: actualUci,
      san: move.san || moveInput.san || actualUci,
      from,
      to,
      color: normalizeChessColor(move.color as ChessColor),
      blundrColor: normalizeBlundrColorFromChessColor(move.color as ChessColor),
      pieceType: move.piece as BlundrPieceType,
      flags: {
        isCapture: capture,
        isCheck: check,
        isCheckmate: mate,
        isCastle,
        isPromotion: Boolean(move.promotion || promotion),
        isEnPassant,
      },
      provenance: {
        source: mapSource(moveInput.source, kind),
        reason: String(moveInput.source ?? kind),
        confidence: kind === "continuation_candidate" ? "derived" : "locked",
      },

      // Compatibility payload
      promotion,
      resultingFen: game.fen(),
      source: String(moveInput.source ?? kind),
      trust: String(moveInput.trust ?? (kind === "continuation_candidate" ? "continuation_verified" : "book_verified")),
      capture,
      check,
      mate,
      isCapture: capture,
      isCheck: check,
      isMate: mate,
      isCheckmate: mate,
      isPromotion: Boolean(move.promotion || promotion),
      isDevelopment: isBackRankDevelopment(move),
      isDiagonalMove: isDiagonalMove(from, to),
      isKingSafetyMove,
      isCentralPawnAdvance,
      isCastle,
      isEnPassant,
      promotionPiece: move.promotion ?? null,
      fenBefore: fen,
    };
  } catch {
    return null;
  }
}

function buildIssues(input: {
  isUserTurn: boolean;
  trainerPhase: string;
  target: CurrentInstructionTarget | null;
  nullReason: string | null;
  kind: CurrentInstructionFrameKind;
}): CurrentInstructionDebugIssue[] {
  const issues: CurrentInstructionDebugIssue[] = [];
  if (!input.target) {
    if (input.isUserTurn && input.trainerPhase === "ready_for_user") {
      issues.push({
        code: "missing_instruction_target",
        severity: "critical",
        message: "User teaching frame has no locked instruction target.",
        details: { nullReason: input.nullReason },
      });
    }
    if (input.kind === "terminal") {
      issues.push({
        code: "terminal_frame_has_target",
        severity: "info",
        message: "Terminal frame is targetless by contract.",
      });
    }
  } else {
    if (!input.target.pieceType) {
      issues.push({
        code: "target_piece_missing",
        severity: "critical",
        message: "Instruction target is missing piece type.",
      });
    }
  }
  if (!input.isUserTurn && input.target) {
    issues.push({
      code: "opponent_turn_has_user_target",
      severity: "critical",
      message: "Opponent turn frame should not expose a user teaching target.",
    });
  }
  return issues;
}

function isCanonicalBuildInput(input: BuildCurrentInstructionFrameInput): input is CanonicalBuildCurrentInstructionFrameInput {
  return "fenBefore" in input && "kind" in input && "mode" in input && "source" in input && !("fen" in input);
}

function isStructurallyValidTarget(target: CurrentInstructionTarget | null | undefined): target is CurrentInstructionTarget {
  if (!target) return false;
  if (!/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(String(target.uci ?? "").toLowerCase())) return false;
  if (!target.from || !target.to) return false;
  return true;
}

function buildDeterministicFrameKey(input: {
  fenBefore: string;
  ply: number;
  kind: CurrentInstructionFrameKind;
  mode: CurrentInstructionMode;
  source: CurrentInstructionSource;
  target: CurrentInstructionTarget | null;
}): string {
  const fen4 = normalizeFen(input.fenBefore);
  const sig = getTargetSignature(input.target) ?? "none";
  return [fen4, String(input.ply), input.kind, input.mode, input.source, sig].join("|");
}

function buildCanonicalFrame(input: CanonicalBuildCurrentInstructionFrameInput): CurrentInstructionFrame {
  const target = input.target ?? null;
  const issues: CurrentInstructionDebugIssue[] = [...(input.debug?.issues ?? [])];
  const targetSignature = getTargetSignature(target);
  const sideToMove = normalizeBlundrColorFromChessColor(input.sideToMove);

  const kindRequiresTarget =
    input.kind === "guided_move" ||
    input.kind === "lichess_branch_move" ||
    input.kind === "adaptive_branch_move" ||
    input.kind === "continuation_candidate";

  const kindRequiresNullTarget =
    input.kind === "opponent_replying" ||
    input.kind === "transitioning" ||
    input.kind === "branch_complete" ||
    input.kind === "terminal";

  if (kindRequiresTarget && !target) {
    issues.push({
      code: "missing_instruction_target",
      severity: "critical",
      message: "Frame kind requires a locked instruction target.",
      details: { kind: input.kind },
    });
  }

  if (target && !/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(String(target.uci ?? "").toLowerCase())) {
    issues.push({
      code: "illegal_instruction_target",
      severity: "critical",
      message: "Instruction target is not a legal-shaped UCI target.",
      details: { uci: target.uci, from: target.from, to: target.to },
    });
  }

  if (target && !target.pieceType) {
    issues.push({
      code: "target_piece_missing",
      severity: "critical",
      message: "Instruction target is missing piece type.",
    });
  }

  if (input.kind === "continuation_candidate" && input.continuation?.candidateLocked !== true) {
    issues.push({
      code: "continuation_candidate_unlocked",
      severity: "critical",
      message: "Continuation candidate must be explicitly locked before becoming target.",
    });
  }

  if (kindRequiresNullTarget && target) {
    issues.push({
      code: input.kind === "terminal" ? "terminal_frame_has_target" : "opponent_turn_has_user_target",
      severity: "critical",
      message: "This frame kind must not expose a user target.",
      details: { kind: input.kind },
    });
  }

  const normalizedTarget = kindRequiresNullTarget ? null : target;
  const frameKey = buildDeterministicFrameKey({
    fenBefore: input.fenBefore,
    ply: input.ply,
    kind: input.kind,
    mode: input.mode,
    source: input.source,
    target: normalizedTarget,
  });

  return {
    frameKey,
    kind: input.kind,
    fenBefore: input.fenBefore,
    fenAfterTarget: normalizedTarget ? input.fenAfterTarget : undefined,
    ply: input.ply,
    sideToMove,
    target: normalizedTarget,
    mode: input.mode,
    source: input.source,
    branchComplete: input.branchComplete,
    continuation: input.continuation,
    debug: {
      issues,
      targetSignature: getTargetSignature(normalizedTarget),
      createdAt: input.debug?.createdAt ?? new Date().toISOString(),
    },

    // Compatibility fields
    frameId: frameKey,
    fen: input.fenBefore,
    normalizedFen: normalizeFen(input.fenBefore),
    trainingMode: input.mode === "continuation" ? "continuation" : "restricted",
    trainerPhase:
      input.kind === "terminal"
        ? "terminal"
        : input.kind === "opponent_replying"
          ? "opponent_replying"
          : input.kind === "branch_complete"
            ? "branch_complete"
            : "ready_for_user",
    trainerView: "assisted",
    isUserTurn: !(input.kind === "opponent_replying" || input.kind === "transitioning" || input.kind === "terminal"),
    targetSource: input.source,
    nullReason: normalizedTarget ? null : `kind_${input.kind}`,
    invariantKey: `${normalizeFen(input.fenBefore)}|${input.kind}|${normalizedTarget?.uci ?? "none"}`,
    instructionFrameKey: frameKey,
  };
}

export function isBookLikeInstructionTarget(target: CurrentInstructionTarget | null | undefined): target is CurrentInstructionTarget {
  return Boolean(target && target.kind && BOOK_TARGET_KINDS.has(target.kind as InstructionTargetKind));
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
    pawn: "pawn",
    knight: "knight",
    bishop: "bishop",
    rook: "rook",
    queen: "queen",
    king: "king",
  };

  const pieceName = pieceNameByCode[target.pieceType] ?? String(target.pieceType);

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
  if (isCanonicalBuildInput(input)) {
    return buildCanonicalFrame(input);
  }

  const legacyInput = input as LegacyBuildCurrentInstructionFrameInput;
  const normalizedFen = normalizeFen(legacyInput.fen);
  const sideToMove = normalizeBlundrColorFromChessColor((String(legacyInput.fen).split(" ")[1] as ChessColor) ?? "w");
  const ply = estimatePlyFromFen(legacyInput.fen);

  const frameKeyInputs = {
    fen: legacyInput.fen,
    trainingMode: legacyInput.trainingMode,
    isUserTurn: legacyInput.isUserTurn,
    trainerPhase: legacyInput.trainerPhase,
    source: legacyInput.preferredTargetKind || (legacyInput.trainingMode === "continuation" ? "continuation" : "guided"),
  };
  const instructionFrameKey = computeInstructionFrameKey(frameKeyInputs);

  const baseCompat = {
    frameId: legacyInput.frameId,
    fen: legacyInput.fen,
    normalizedFen,
    trainingMode: legacyInput.trainingMode,
    trainerPhase: legacyInput.trainerPhase,
    trainerView: legacyInput.trainerView,
    isUserTurn: legacyInput.isUserTurn,
    instructionFrameKey,
  };

  if (!legacyInput.isUserTurn) {
    const kind: CurrentInstructionFrameKind = "opponent_replying";
    const issues = buildIssues({ isUserTurn: legacyInput.isUserTurn, trainerPhase: legacyInput.trainerPhase, target: null, nullReason: "opponent_turn", kind });
    return {
      ...baseCompat,
      frameKey: instructionFrameKey,
      kind,
      fenBefore: legacyInput.fen,
      ply,
      sideToMove,
      target: null,
      mode: "blocked",
      source: "none",
      targetSource: "none",
      nullReason: "opponent_turn",
      invariantKey: `${normalizedFen}|opponent_turn|none`,
      debug: {
        issues,
        targetSignature: null,
        createdAt: new Date().toISOString(),
      },
    };
  }

  if (!USER_TURN_PHASES.has(legacyInput.trainerPhase)) {
    const kind: CurrentInstructionFrameKind = legacyInput.trainerPhase === "terminal" ? "terminal" : "transitioning";
    const issues = buildIssues({ isUserTurn: legacyInput.isUserTurn, trainerPhase: legacyInput.trainerPhase, target: null, nullReason: `phase_${legacyInput.trainerPhase}`, kind });
    return {
      ...baseCompat,
      frameKey: instructionFrameKey,
      kind,
      fenBefore: legacyInput.fen,
      ply,
      sideToMove,
      target: null,
      mode: kind === "terminal" ? "terminal" : "blocked",
      source: kind === "terminal" ? "terminal" : "none",
      targetSource: "none",
      nullReason: `phase_${legacyInput.trainerPhase}`,
      invariantKey: `${normalizedFen}|${legacyInput.trainerPhase}|none`,
      debug: {
        issues,
        targetSignature: null,
        createdAt: new Date().toISOString(),
      },
    };
  }

  const preferred =
    legacyInput.preferredTargetKind === "continuation_candidate" || legacyInput.trainingMode === "continuation"
      ? "continuation_candidate"
      : "guided_move";
  const candidates: Array<{ move: InstructionMoveInput | null | undefined; kind: InstructionTargetKind; source: string }> =
    preferred === "continuation_candidate"
      ? [
          { move: legacyInput.continuationCandidate, kind: "continuation_candidate", source: "continuation_candidate" },
          { move: legacyInput.guidedMove, kind: coerceTargetKind(legacyInput.guidedMove?.kind, "guided_move"), source: "guided_move" },
        ]
      : [
          { move: legacyInput.guidedMove, kind: coerceTargetKind(legacyInput.guidedMove?.kind, "guided_move"), source: "guided_move" },
          { move: legacyInput.continuationCandidate, kind: "continuation_candidate", source: "continuation_candidate" },
        ];

  for (const candidate of candidates) {
    if (!candidate.move?.uci) continue;
    const target = buildTargetFromMove(legacyInput.fen, candidate.move, candidate.kind);
    if (target) {
      const kind = target.kind as CurrentInstructionFrameKind;
      const mode = mapMode(legacyInput.trainingMode, true, kind);
      const source = mapSource(target.source ?? candidate.source, candidate.kind);
      const issues = buildIssues({ isUserTurn: legacyInput.isUserTurn, trainerPhase: legacyInput.trainerPhase, target, nullReason: null, kind });
      return {
        ...baseCompat,
        frameKey: instructionFrameKey,
        kind,
        fenBefore: legacyInput.fen,
        fenAfterTarget: target.resultingFen,
        ply,
        sideToMove,
        target,
        mode,
        source,
        targetSource: candidate.source,
        nullReason: null,
        invariantKey: `${normalizedFen}|${target.kind}|${target.uci}`,
        debug: {
          issues,
          targetSignature: getCurrentInstructionTargetSignature(target),
          createdAt: new Date().toISOString(),
        },
      };
    }
  }

  const expectedReason = preferred === "continuation_candidate" ? "missing_or_illegal_continuation_candidate" : "missing_or_illegal_guided_move";
  const kind: CurrentInstructionFrameKind = "blocked";
  const issues = buildIssues({ isUserTurn: legacyInput.isUserTurn, trainerPhase: legacyInput.trainerPhase, target: null, nullReason: expectedReason, kind });
  return {
    ...baseCompat,
    frameKey: instructionFrameKey,
    kind,
    fenBefore: legacyInput.fen,
    ply,
    sideToMove,
    target: null,
    mode: "blocked",
    source: "none",
    targetSource: "none",
    nullReason: expectedReason,
    invariantKey: `${normalizedFen}|${preferred}|none`,
    debug: {
      issues,
      targetSignature: null,
      createdAt: new Date().toISOString(),
    },
  };
}

/**
 * Stable key that uniquely identifies an instructional frame for target locking.
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

export function isUserTurnTeachingFrame(frame: CurrentInstructionFrame): boolean {
  if (!frame.target) return false;
  if (frame.kind === "opponent_replying" || frame.kind === "transitioning" || frame.kind === "branch_complete" || frame.kind === "terminal") {
    return false;
  }
  return Boolean(frame.isUserTurn);
}

export function isGuidedTeachingFrame(frame: CurrentInstructionFrame): boolean {
  if (!isUserTurnTeachingFrame(frame)) return false;
  return frame.mode === "guided" && frame.target?.kind !== "continuation_candidate";
}

export function isContinuationTeachingFrame(frame: CurrentInstructionFrame): boolean {
  if (!isUserTurnTeachingFrame(frame)) return false;
  return frame.mode === "continuation" || frame.target?.kind === "continuation_candidate";
}

export function getInstructionTargetOrNull(frame: CurrentInstructionFrame): CurrentInstructionTarget | null {
  return frame.target ?? null;
}

export function assertLockedInstructionTarget(frame: CurrentInstructionFrame): CurrentInstructionTarget {
  const target = frame.target;
  if (!target) {
    throw new Error("CurrentInstructionFrame has no locked instruction target.");
  }
  if (target.provenance?.confidence !== "locked") {
    throw new Error("CurrentInstructionFrame target is not locked.");
  }
  return target;
}

export function getFrameTargetSignature(frame: CurrentInstructionFrame): string {
  return getTargetSignature(frame.target) ?? "none";
}

export type {
  BlundrColor,
  BlundrPieceType,
  BlundrSquare,
  CurrentInstructionDebugIssue,
  CurrentInstructionFrameKind,
  CurrentInstructionMode,
  CurrentInstructionSource,
  CurrentInstructionTarget,
};
