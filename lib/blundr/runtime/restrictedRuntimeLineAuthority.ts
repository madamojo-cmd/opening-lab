import { Chess } from "chess.js";
import { normalizeVisualFen } from "../visual/normalizeVisualFen";
import { normalizeRuntimeCastlingUci } from "./uciNormalization";

export type RestrictedRuntimeLineAuthorityKind =
  | "inactive"
  | "invalid_line"
  | "diverged"
  | "user_target"
  | "opponent_reply"
  | "complete";

export type RestrictedRuntimeLineMove = {
  uci: string;
  san: string;
  color: "w" | "b";
  resultingFen: string;
  ply: number;
  lineCursor: number;
  lineLength: number;
};

export type RestrictedRuntimeLineProgress = {
  completedLearnerMoves: number;
  totalLearnerMoves: number;
};

export type RestrictedRuntimeLineAuthorityResult =
  | {
      kind: "inactive";
      reason: string;
      selectedLineId: string | null;
      selectedLineKey: string | null;
      sessionId: string | null;
      lineCursor: number;
      lineLength: number;
      progress: RestrictedRuntimeLineProgress;
    }
  | {
      kind: "invalid_line" | "diverged";
      reason: string;
      selectedLineId: string | null;
      selectedLineKey: string | null;
      sessionId: string | null;
      lineCursor: number;
      lineLength: number;
      progress: RestrictedRuntimeLineProgress;
      expectedFen4?: string | null;
      currentFen4?: string | null;
      expectedUci?: string | null;
      actualUci?: string | null;
    }
  | {
      kind: "user_target" | "opponent_reply";
      reason: string;
      selectedLineId: string;
      selectedLineKey: string;
      sessionId: string;
      lineCursor: number;
      lineLength: number;
      move: RestrictedRuntimeLineMove;
      progress: RestrictedRuntimeLineProgress;
    }
  | {
      kind: "complete";
      reason: string;
      selectedLineId: string;
      selectedLineKey: string;
      sessionId: string;
      lineCursor: number;
      lineLength: number;
      finalFen: string;
      progress: RestrictedRuntimeLineProgress;
    };

export type RestrictedRuntimeLineAuthorityInput = {
  trainingMode: "restricted" | "continuation" | string;
  selectedRuntimeLineId?: string | null;
  selectedRuntimeLineKey?: string | null;
  selectedPlaySequenceUci: readonly string[];
  committedUciHistory: readonly string[];
  startingFen: string;
  currentFen: string;
  userColor: "w" | "b";
  sessionId?: string | null;
};

export type RestrictedRuntimeLinePreflightResult =
  | {
      ok: true;
      selectedLineId: string;
      selectedLineKey: string;
      sessionId: string;
      sequence: string[];
      startingFen: string;
      finalFen: string;
      totalLearnerMoves: number;
      lineLength: number;
    }
  | {
      ok: false;
      reason: string;
      selectedLineId: string | null;
      selectedLineKey: string | null;
      sessionId: string | null;
      lineLength: number;
      totalLearnerMoves: number;
    };

export type RestrictedRuntimeLineRequestSnapshot = {
  sessionId: string | null;
  selectedRuntimeLineId: string | null;
  selectedRuntimeLineKey: string | null;
  cursor: number;
  baseFen4: string;
  expectedOpponentUci: string | null;
};

function normalizeLineId(value: unknown): string | null {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function normalizeSequence(sequence: readonly string[]): string[] {
  return sequence
    .map((uci) => normalizeRuntimeCastlingUci(uci))
    .filter((uci): uci is string => Boolean(uci));
}

function emptyProgress(): RestrictedRuntimeLineProgress {
  return { completedLearnerMoves: 0, totalLearnerMoves: 0 };
}

function moveToUci(move: { from: string; to: string; promotion?: string }): string {
  return `${move.from}${move.to}${move.promotion ?? ""}`.toLowerCase();
}

function applyUci(game: Chess, uci: string) {
  const from = uci.slice(0, 2);
  const to = uci.slice(2, 4);
  const promotion = uci.length > 4 ? uci.slice(4, 5) : undefined;
  try {
    return game.move({ from, to, promotion });
  } catch {
    return null;
  }
}

function countLearnerMoves(sequence: readonly string[], startingFen: string, userColor: "w" | "b"): number | null {
  try {
    const game = new Chess(startingFen);
    let count = 0;
    for (const uci of sequence) {
      if (game.turn() === userColor) count += 1;
      const move = applyUci(game, uci);
      if (!move) return null;
    }
    return count;
  } catch {
    return null;
  }
}

function countCompletedLearnerMoves(input: {
  sequence: readonly string[];
  committedUciHistory: readonly string[];
  startingFen: string;
  userColor: "w" | "b";
}): number | null {
  try {
    const game = new Chess(input.startingFen);
    let count = 0;
    for (let i = 0; i < input.committedUciHistory.length; i += 1) {
      if (game.turn() === input.userColor) count += 1;
      const move = applyUci(game, input.sequence[i]);
      if (!move) return null;
    }
    return count;
  } catch {
    return null;
  }
}

export function validateRestrictedRuntimeLineSession(input: {
  selectedRuntimeLineId?: string | null;
  selectedRuntimeLineKey?: string | null;
  selectedPlaySequenceUci: readonly string[];
  startingFen: string;
  userColor: "w" | "b";
  sessionId?: string | null;
  requiredLineLength?: number;
  requiredLearnerMoves?: number;
}): RestrictedRuntimeLinePreflightResult {
  const selectedLineId = normalizeLineId(input.selectedRuntimeLineId);
  const selectedLineKey = normalizeLineId(input.selectedRuntimeLineKey);
  const sessionId = normalizeLineId(input.sessionId);
  const sequence = normalizeSequence(input.selectedPlaySequenceUci);
  const requiredLineLength = input.requiredLineLength ?? 12;
  const requiredLearnerMoves = input.requiredLearnerMoves ?? 6;

  if (!selectedLineId) {
    return { ok: false, reason: "selected_runtime_line_id_required", selectedLineId, selectedLineKey, sessionId, lineLength: sequence.length, totalLearnerMoves: 0 };
  }
  if (!selectedLineKey) {
    return { ok: false, reason: "selected_runtime_line_key_required", selectedLineId, selectedLineKey, sessionId, lineLength: sequence.length, totalLearnerMoves: 0 };
  }
  if (!sessionId) {
    return { ok: false, reason: "runtime_training_session_id_required", selectedLineId, selectedLineKey, sessionId, lineLength: sequence.length, totalLearnerMoves: 0 };
  }
  if (sequence.length !== input.selectedPlaySequenceUci.length) {
    return { ok: false, reason: "selected_runtime_line_contains_invalid_uci", selectedLineId, selectedLineKey, sessionId, lineLength: sequence.length, totalLearnerMoves: 0 };
  }
  if (sequence.length !== requiredLineLength) {
    const totalLearnerMoves = countLearnerMoves(sequence, input.startingFen, input.userColor) ?? 0;
    return { ok: false, reason: "selected_runtime_line_wrong_length", selectedLineId, selectedLineKey, sessionId, lineLength: sequence.length, totalLearnerMoves };
  }

  try {
    const game = new Chess(input.startingFen);
    let totalLearnerMoves = 0;
    for (const uci of sequence) {
      if (game.turn() === input.userColor) totalLearnerMoves += 1;
      const move = applyUci(game, uci);
      if (!move || moveToUci(move) !== uci) {
        return { ok: false, reason: "selected_runtime_line_illegal_move", selectedLineId, selectedLineKey, sessionId, lineLength: sequence.length, totalLearnerMoves };
      }
    }
    if (totalLearnerMoves !== requiredLearnerMoves) {
      return { ok: false, reason: "selected_runtime_line_wrong_learner_move_count", selectedLineId, selectedLineKey, sessionId, lineLength: sequence.length, totalLearnerMoves };
    }
    return {
      ok: true,
      selectedLineId,
      selectedLineKey,
      sessionId,
      sequence,
      startingFen: input.startingFen,
      finalFen: game.fen(),
      totalLearnerMoves,
      lineLength: sequence.length,
    };
  } catch {
    return { ok: false, reason: "selected_runtime_line_starting_fen_invalid", selectedLineId, selectedLineKey, sessionId, lineLength: sequence.length, totalLearnerMoves: 0 };
  }
}

export function resolveRestrictedRuntimeLineAuthority(
  input: RestrictedRuntimeLineAuthorityInput,
): RestrictedRuntimeLineAuthorityResult {
  const selectedLineId = normalizeLineId(input.selectedRuntimeLineId);
  const selectedLineKey = normalizeLineId(input.selectedRuntimeLineKey);
  const sessionId = normalizeLineId(input.sessionId);
  const sequence = normalizeSequence(input.selectedPlaySequenceUci);
  const committedUciHistory = normalizeSequence(input.committedUciHistory);
  const lineLength = sequence.length;

  if (input.trainingMode !== "restricted") {
    return { kind: "inactive", reason: "restricted_mode_required", selectedLineId, selectedLineKey, sessionId, lineCursor: committedUciHistory.length, lineLength, progress: emptyProgress() };
  }
  if (!selectedLineId || !selectedLineKey || !sessionId) {
    return { kind: "invalid_line", reason: "selected_runtime_line_identity_required", selectedLineId, selectedLineKey, sessionId, lineCursor: committedUciHistory.length, lineLength, progress: emptyProgress() };
  }
  if (sequence.length === 0 || sequence.length !== input.selectedPlaySequenceUci.length) {
    return { kind: "invalid_line", reason: "selected_runtime_line_sequence_invalid", selectedLineId, selectedLineKey, sessionId, lineCursor: committedUciHistory.length, lineLength, progress: emptyProgress() };
  }
  if (committedUciHistory.length !== input.committedUciHistory.length) {
    return { kind: "diverged", reason: "committed_uci_history_invalid", selectedLineId, selectedLineKey, sessionId, lineCursor: committedUciHistory.length, lineLength, progress: emptyProgress() };
  }
  if (committedUciHistory.length > sequence.length) {
    return { kind: "diverged", reason: "committed_uci_history_longer_than_selected_line", selectedLineId, selectedLineKey, sessionId, lineCursor: committedUciHistory.length, lineLength, progress: emptyProgress() };
  }
  for (let i = 0; i < committedUciHistory.length; i += 1) {
    if (committedUciHistory[i] !== sequence[i]) {
      return {
        kind: "diverged",
        reason: "committed_uci_history_not_selected_line_prefix",
        selectedLineId,
        selectedLineKey,
        sessionId,
        lineCursor: committedUciHistory.length,
        lineLength,
        progress: emptyProgress(),
        expectedUci: sequence[i] ?? null,
        actualUci: committedUciHistory[i] ?? null,
      };
    }
  }

  try {
    const game = new Chess(input.startingFen);
    for (const uci of committedUciHistory) {
      const move = applyUci(game, uci);
      if (!move || moveToUci(move) !== uci) {
        return { kind: "diverged", reason: "committed_uci_history_cannot_replay", selectedLineId, selectedLineKey, sessionId, lineCursor: committedUciHistory.length, lineLength, progress: emptyProgress(), expectedUci: uci };
      }
    }

    const expectedFen4 = normalizeVisualFen(game.fen());
    const currentFen4 = normalizeVisualFen(input.currentFen);
    const totalLearnerMoves = countLearnerMoves(sequence, input.startingFen, input.userColor) ?? 0;
    const completedLearnerMoves = countCompletedLearnerMoves({
      sequence,
      committedUciHistory,
      startingFen: input.startingFen,
      userColor: input.userColor,
    }) ?? 0;
    const progress = { completedLearnerMoves, totalLearnerMoves };

    if (expectedFen4 !== currentFen4) {
      return { kind: "diverged", reason: "current_fen_does_not_match_selected_line_prefix", selectedLineId, selectedLineKey, sessionId, lineCursor: committedUciHistory.length, lineLength, progress, expectedFen4, currentFen4 };
    }

    if (committedUciHistory.length === sequence.length) {
      return { kind: "complete", reason: "selected_runtime_line_complete", selectedLineId, selectedLineKey, sessionId, lineCursor: sequence.length, lineLength, finalFen: game.fen(), progress };
    }

    const nextUci = sequence[committedUciHistory.length];
    const move = applyUci(game, nextUci);
    if (!move || moveToUci(move) !== nextUci) {
      return { kind: "invalid_line", reason: "selected_runtime_line_next_move_illegal", selectedLineId, selectedLineKey, sessionId, lineCursor: committedUciHistory.length, lineLength, progress, expectedUci: nextUci };
    }

    const nextMove: RestrictedRuntimeLineMove = {
      uci: nextUci,
      san: move.san || nextUci,
      color: move.color as "w" | "b",
      resultingFen: game.fen(),
      ply: committedUciHistory.length,
      lineCursor: committedUciHistory.length,
      lineLength,
    };

    return {
      kind: nextMove.color === input.userColor ? "user_target" : "opponent_reply",
      reason: nextMove.color === input.userColor ? "selected_runtime_line_user_target" : "selected_runtime_line_opponent_reply",
      selectedLineId,
      selectedLineKey,
      sessionId,
      lineCursor: committedUciHistory.length,
      lineLength,
      move: nextMove,
      progress,
    };
  } catch {
    return { kind: "invalid_line", reason: "selected_runtime_line_fen_invalid", selectedLineId, selectedLineKey, sessionId, lineCursor: committedUciHistory.length, lineLength, progress: emptyProgress() };
  }
}

export function buildRestrictedRuntimeLineRequestSnapshot(input: {
  authority: RestrictedRuntimeLineAuthorityResult;
  baseFen: string;
}): RestrictedRuntimeLineRequestSnapshot | null {
  if (input.authority.kind !== "opponent_reply") return null;
  return {
    sessionId: input.authority.sessionId,
    selectedRuntimeLineId: input.authority.selectedLineId,
    selectedRuntimeLineKey: input.authority.selectedLineKey,
    cursor: input.authority.lineCursor,
    baseFen4: normalizeVisualFen(input.baseFen),
    expectedOpponentUci: input.authority.move.uci,
  };
}

export function isStaleRestrictedRuntimeLineRequest(input: {
  request: RestrictedRuntimeLineRequestSnapshot | null | undefined;
  current: RestrictedRuntimeLineRequestSnapshot | null | undefined;
}): boolean {
  const request = input.request;
  const current = input.current;
  if (!request || !current) return true;
  return (
    request.sessionId !== current.sessionId ||
    request.selectedRuntimeLineId !== current.selectedRuntimeLineId ||
    request.selectedRuntimeLineKey !== current.selectedRuntimeLineKey ||
    request.cursor !== current.cursor ||
    request.baseFen4 !== current.baseFen4 ||
    request.expectedOpponentUci !== current.expectedOpponentUci
  );
}
