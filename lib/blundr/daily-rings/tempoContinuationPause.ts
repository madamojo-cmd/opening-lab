import { buildTempoContinuationPauseCompletionId } from "./dailyRingGameplayEvents";

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

export type TempoContinuationPauseInput = {
  activeTab?: string | null;
  trainingMode?: string | null;
  isUserTurn?: boolean;
  isGameOver?: boolean;
  legalMoveCount?: number | null;
  userExplicitlyEnteredContinuation?: boolean;
  continueFromHereClicked?: boolean;
  branchTransitionSurfaceRendered?: boolean;
  branchCompleteEligibleNow?: boolean;
  terminalProofProven?: boolean;
  selectedLineCompleteConfirmed?: boolean;
  currentInstructionFrameKind?: string | null;
  canonicalOpeningId?: string | null;
  runSessionId?: string | null;
  lineId?: string | null;
  terminalFen?: string | null;
  completionIndex?: number | null;
  pauseOccurrenceIndex?: number | null;
  dateKey?: string | null;
  previousAtContinuationPause?: boolean;
  recordedCompletionIds?: ReadonlySet<string>;
};

export type TempoContinuationPauseDecision = {
  atContinuationPause: boolean;
  previousAtContinuationPause: boolean;
  shouldRecord: boolean;
  completionKey: string | null;
  blockedReason: string | null;
};

export function resolveTempoContinuationPauseCompletion(input: TempoContinuationPauseInput): TempoContinuationPauseDecision {
  const previousAtContinuationPause = Boolean(input.previousAtContinuationPause);
  const canonicalOpeningId = normalizeText(input.canonicalOpeningId);
  const runSessionId = normalizeText(input.runSessionId);
  const lineId = normalizeText(input.lineId);
  const terminalFen = normalizeText(input.terminalFen);
  const completionIndex = Math.max(0, Math.floor(Number(input.completionIndex) || 0));
  const legalMoveCount = Math.max(0, Math.floor(Number(input.legalMoveCount) || 0));
  const lineCompletionProof = Boolean(input.branchCompleteEligibleNow && input.terminalProofProven);
  const atContinuationPause = Boolean(
    input.activeTab === "train" &&
      input.trainingMode === "restricted" &&
      input.isUserTurn &&
      !input.isGameOver &&
      legalMoveCount > 0 &&
      !input.userExplicitlyEnteredContinuation &&
      !input.continueFromHereClicked &&
      input.branchTransitionSurfaceRendered &&
      input.currentInstructionFrameKind === "branch_complete" &&
      lineCompletionProof,
  );

  if (!atContinuationPause) {
    return {
      atContinuationPause,
      previousAtContinuationPause,
      shouldRecord: false,
      completionKey: null,
      blockedReason: lineCompletionProof ? "not_at_continuation_pause" : "line_completion_not_proven",
    };
  }

  if (previousAtContinuationPause) {
    return {
      atContinuationPause,
      previousAtContinuationPause,
      shouldRecord: false,
      completionKey: null,
      blockedReason: "same_pause_still_rendering",
    };
  }

  if (!canonicalOpeningId) {
    return {
      atContinuationPause,
      previousAtContinuationPause,
      shouldRecord: false,
      completionKey: null,
      blockedReason: "missing_canonical_opening_id",
    };
  }

  if (!runSessionId) {
    return {
      atContinuationPause,
      previousAtContinuationPause,
      shouldRecord: false,
      completionKey: null,
      blockedReason: "missing_run_session_id",
    };
  }

  if (!terminalFen) {
    return {
      atContinuationPause,
      previousAtContinuationPause,
      shouldRecord: false,
      completionKey: null,
      blockedReason: "missing_terminal_fen",
    };
  }

  const completionKey = buildTempoContinuationPauseCompletionId({
    dateKey: input.dateKey,
    openingId: canonicalOpeningId,
    runSessionId,
    lineId,
    terminalFen,
    completionIndex,
    pauseOccurrenceIndex: input.pauseOccurrenceIndex,
  });

  if (input.recordedCompletionIds?.has(completionKey)) {
    return {
      atContinuationPause,
      previousAtContinuationPause,
      shouldRecord: false,
      completionKey,
      blockedReason: "already_recorded_in_session",
    };
  }

  return {
    atContinuationPause,
    previousAtContinuationPause,
    shouldRecord: true,
    completionKey,
    blockedReason: null,
  };
}
