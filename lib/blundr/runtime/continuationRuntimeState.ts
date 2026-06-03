import { Chess } from "chess.js";
import type { CurrentInstructionDebugIssue } from "./currentInstructionTarget";
import type { CurrentInstructionFrame } from "./currentInstructionFrame";

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

export interface ContinuationRuntimeAuthorityState {
  frameKey: string;
  targetUci: string | null;
  mode: "guided" | "continuation" | "terminal" | "blocked";
  source:
    | "opening_tree"
    | "lichess_branch"
    | "adaptive_branch"
    | "continuation_policy"
    | "terminal"
    | "none";
  targetLocked: boolean;
}

export type ContinuationRuntimePhase =
  | "not_applicable"
  | "branch_complete_waiting_for_continue"
  | "candidate_locked"
  | "terminal"
  | "blocked";

export interface ContinuationRuntimeStateV2 {
  phase: ContinuationRuntimePhase;
  continueFromHereAvailable: boolean;
  selectedContinuationCandidate: {
    uci: string;
    san?: string;
    locked: boolean;
    source: "continuation_policy";
  } | null;
  debugIssues: CurrentInstructionDebugIssue[];
}

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

export function buildContinuationRuntimeAuthorityState(frame: CurrentInstructionFrame): ContinuationRuntimeAuthorityState {
  return {
    frameKey: frame.frameKey,
    targetUci: frame.target?.uci ?? null,
    mode: frame.mode,
    source:
      frame.source === "opening_tree" ||
      frame.source === "lichess_branch" ||
      frame.source === "adaptive_branch" ||
      frame.source === "continuation_policy" ||
      frame.source === "terminal" ||
      frame.source === "none"
        ? frame.source
        : "none",
    targetLocked: Boolean(frame.target && frame.target.provenance?.confidence === "locked"),
  };
}

export function buildContinuationRuntimeState(input: {
  branchComplete: boolean;
  continueClicked: boolean;
  candidateUci?: string | null;
  candidateSan?: string;
  candidateSource?: string;
}): ContinuationRuntimeStateV2 {
  const issues: CurrentInstructionDebugIssue[] = [];
  const hasCandidate = Boolean(input.candidateUci);

  if (!input.branchComplete) {
    return {
      phase: "not_applicable",
      continueFromHereAvailable: false,
      selectedContinuationCandidate: null,
      debugIssues: issues,
    };
  }

  if (input.branchComplete && !input.continueClicked) {
    return {
      phase: "branch_complete_waiting_for_continue",
      continueFromHereAvailable: true,
      selectedContinuationCandidate: null,
      debugIssues: issues,
    };
  }

  if (input.continueClicked && !hasCandidate) {
    issues.push({
      code: "missing_instruction_target",
      severity: "critical",
      message: "Continue clicked but no continuation candidate available.",
    });
    return {
      phase: "blocked",
      continueFromHereAvailable: true,
      selectedContinuationCandidate: null,
      debugIssues: issues,
    };
  }

  const uci = String(input.candidateUci ?? "").toLowerCase();
  if (!/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(uci)) {
    issues.push({
      code: "illegal_instruction_target",
      severity: "critical",
      message: "Continuation candidate UCI is structurally invalid.",
      details: { candidateUci: input.candidateUci },
    });
    return {
      phase: "blocked",
      continueFromHereAvailable: true,
      selectedContinuationCandidate: null,
      debugIssues: issues,
    };
  }

  if (input.candidateSource && input.candidateSource !== "continuation_policy") {
    issues.push({
      code: "target_source_ambiguous",
      severity: "critical",
      message: "Only continuation_policy may lock continuation candidate target.",
      details: { candidateSource: input.candidateSource },
    });
    return {
      phase: "blocked",
      continueFromHereAvailable: true,
      selectedContinuationCandidate: null,
      debugIssues: issues,
    };
  }

  return {
    phase: "candidate_locked",
    continueFromHereAvailable: true,
    selectedContinuationCandidate: {
      uci,
      san: input.candidateSan,
      locked: true,
      source: "continuation_policy",
    },
    debugIssues: issues,
  };
}
