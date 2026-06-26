import { normalizeRuntimeCastlingUci } from "./uciNormalization";

export type BlackOpeningInitialOpponentHandoffResolution =
  | {
      kind: "ready";
      reason: "selected_runtime_line_initial_opponent_move_ready";
      handoffKey: string;
      opponentMoveUci: string;
      opponentReplyAuthoritySource: "selected_runtime_line";
      maiaAllowed: false;
      continuationEntered: false;
    }
  | {
      kind: "blocked";
      reason: string;
      handoffKey: string | null;
      opponentMoveUci: string | null;
      opponentReplyAuthoritySource: "blocked";
      maiaAllowed: false;
      continuationEntered: false;
    };

function normalizeOpeningId(value: unknown): string | null {
  const text = String(value ?? "").trim().toLowerCase();
  return text.length ? text : null;
}

function blocked(
  reason: string,
  handoffKey: string | null = null,
  opponentMoveUci: string | null = null,
): BlackOpeningInitialOpponentHandoffResolution {
  return {
    kind: "blocked",
    reason,
    handoffKey,
    opponentMoveUci,
    opponentReplyAuthoritySource: "blocked",
    maiaAllowed: false,
    continuationEntered: false,
  };
}

export function buildBlackOpeningInitialOpponentHandoffKey(input: {
  openingId: string;
  selectedRuntimeLineKey: string;
  runtimeTrainingSessionId: string;
  ratingBandId?: string | null;
  fen4: string;
  opponentMoveUci: string;
}): string {
  return [
    "black_initial_restricted_opponent_handoff",
    input.openingId,
    input.selectedRuntimeLineKey,
    input.runtimeTrainingSessionId,
    input.ratingBandId ?? "unknown_rating",
    input.fen4,
    input.opponentMoveUci,
  ].join("::");
}

export function resolveBlackOpeningInitialOpponentHandoff(input: {
  activeTab: string;
  trainingMode: "restricted" | "continuation";
  userExplicitlyEnteredContinuation: boolean;
  userColor: "w" | "b";
  opponentColor: "w" | "b";
  turn: "w" | "b";
  gameOver: boolean;
  selectedOpeningRuntimeAvailable: boolean;
  selectedRuntimeLineLoaded: boolean;
  selectedOpeningId: string | null;
  selectedRuntimeLineOpeningId: string | null;
  selectedRuntimeLineKey: string | null;
  selectedRuntimeLinePlaySequenceUci: readonly string[];
  runtimeTrainingSessionId: string;
  ratingBandId?: string | null;
  fen4: string;
  moveHistoryLength: number;
  lastMoveUci: string | null;
  pendingOpponentRequestExists: boolean;
  handledHandoffKey: string | null;
  legalMoveUcis: readonly string[];
}): BlackOpeningInitialOpponentHandoffResolution {
  if (input.activeTab !== "train") return blocked("train_tab_required");
  if (input.trainingMode !== "restricted") return blocked("restricted_mode_required");
  if (input.userExplicitlyEnteredContinuation) return blocked("continuation_not_allowed");
  if (input.userColor !== "b") return blocked("black_user_required");
  if (input.opponentColor !== "w") return blocked("white_opponent_required");
  if (input.turn !== input.opponentColor) return blocked("opponent_turn_required");
  if (input.gameOver) return blocked("game_over");
  if (!input.selectedOpeningRuntimeAvailable) return blocked("runtime_opening_required");
  if (!input.selectedRuntimeLineLoaded) return blocked("selected_runtime_line_not_loaded");
  if (input.pendingOpponentRequestExists) return blocked("opponent_request_already_pending");
  if (input.moveHistoryLength !== 0 || input.lastMoveUci) return blocked("initial_position_required");

  const selectedOpeningId = normalizeOpeningId(input.selectedOpeningId);
  const selectedLineOpeningId = normalizeOpeningId(input.selectedRuntimeLineOpeningId);
  if (!selectedOpeningId || !selectedLineOpeningId || selectedOpeningId !== selectedLineOpeningId) {
    return blocked("selected_runtime_line_opening_mismatch");
  }

  const selectedRuntimeLineKey = String(input.selectedRuntimeLineKey ?? "").trim();
  if (!selectedRuntimeLineKey) return blocked("selected_runtime_line_key_required");

  const opponentMoveUci = normalizeRuntimeCastlingUci(input.selectedRuntimeLinePlaySequenceUci[0]);
  if (!opponentMoveUci) return blocked("selected_runtime_line_first_move_missing");

  const legalMoveUcis = new Set(
    input.legalMoveUcis
      .map((uci) => normalizeRuntimeCastlingUci(uci))
      .filter((uci): uci is string => Boolean(uci)),
  );
  if (!legalMoveUcis.has(opponentMoveUci)) {
    return blocked("selected_runtime_line_first_move_illegal", null, opponentMoveUci);
  }

  const handoffKey = buildBlackOpeningInitialOpponentHandoffKey({
    openingId: selectedOpeningId,
    selectedRuntimeLineKey,
    runtimeTrainingSessionId: input.runtimeTrainingSessionId,
    ratingBandId: input.ratingBandId,
    fen4: input.fen4,
    opponentMoveUci,
  });

  if (input.handledHandoffKey === handoffKey) {
    return blocked("opponent_handoff_already_handled", handoffKey, opponentMoveUci);
  }

  return {
    kind: "ready",
    reason: "selected_runtime_line_initial_opponent_move_ready",
    handoffKey,
    opponentMoveUci,
    opponentReplyAuthoritySource: "selected_runtime_line",
    maiaAllowed: false,
    continuationEntered: false,
  };
}
