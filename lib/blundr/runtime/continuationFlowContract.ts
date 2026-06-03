export type ContinuationSurfaceState =
  | "idle_not_continuation"
  | "branch_complete"
  | "continuation_analyzing"
  | "continuation_candidate_ready"
  | "continuation_user_move_pending"
  | "continuation_opponent_replying"
  | "continuation_terminal"
  | "continuation_error";

export interface ResolveContinuationFlowContractInput {
  trainingMode: "restricted" | "continuation";
  branchComplete: boolean;
  isUserTurn: boolean;
  hasTarget: boolean;
  selectedCandidateUci?: string | null;
  selectedCandidateSan?: string | null;
  selectedCandidateSource?: string | null;
  pendingOpponentRequestExists: boolean;
  candidateAnalysisStatus?: string | null;
  continuationRuntimeStatus?: string | null;
  terminalReason?: string | null;
}

export interface ContinuationFlowContract {
  state: ContinuationSurfaceState;
  reason: string;
  isUserTurn: boolean;
  hasTarget: boolean;
  selectedCandidateUci: string | null;
  selectedCandidateSan: string | null;
  selectedCandidateSource: string | null;
  pendingOpponentRequestExists: boolean;
  candidateAnalysisStatus: string | null;
  continuationRuntimeStatus: string | null;
  terminalReason: string | null;
  shouldRenderTarget: boolean;
  shouldRenderVisuals: boolean;
  shouldRenderActions: boolean;
  shouldRenderOpponentReplying: boolean;
  shouldRenderAnalyzingCopy: boolean;
  shouldRenderNoTarget: boolean;
  criticalIssueIfInvalid: string | null;
}

function toNullableString(value: unknown): string | null {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

export function resolveContinuationFlowContract(input: ResolveContinuationFlowContractInput): ContinuationFlowContract {
  const candidateUci = toNullableString(input.selectedCandidateUci);
  const candidateSan = toNullableString(input.selectedCandidateSan);
  const candidateSource = toNullableString(input.selectedCandidateSource);
  const analysisStatus = toNullableString(input.candidateAnalysisStatus);
  const runtimeStatus = toNullableString(input.continuationRuntimeStatus);
  const terminalReason = toNullableString(input.terminalReason);

  const base: Omit<ContinuationFlowContract, "state" | "reason" | "shouldRenderTarget" | "shouldRenderVisuals" | "shouldRenderActions" | "shouldRenderOpponentReplying" | "shouldRenderAnalyzingCopy" | "shouldRenderNoTarget" | "criticalIssueIfInvalid"> = {
    isUserTurn: Boolean(input.isUserTurn),
    hasTarget: Boolean(input.hasTarget),
    selectedCandidateUci: candidateUci,
    selectedCandidateSan: candidateSan,
    selectedCandidateSource: candidateSource,
    pendingOpponentRequestExists: Boolean(input.pendingOpponentRequestExists),
    candidateAnalysisStatus: analysisStatus,
    continuationRuntimeStatus: runtimeStatus,
    terminalReason,
  };

  if (input.trainingMode !== "continuation") {
    return {
      ...base,
      state: "idle_not_continuation",
      reason: "not_continuation_mode",
      shouldRenderTarget: false,
      shouldRenderVisuals: false,
      shouldRenderActions: false,
      shouldRenderOpponentReplying: false,
      shouldRenderAnalyzingCopy: false,
      shouldRenderNoTarget: false,
      criticalIssueIfInvalid: null,
    };
  }

  if (input.branchComplete) {
    return {
      ...base,
      state: "branch_complete",
      reason: "branch_complete_surface",
      shouldRenderTarget: false,
      shouldRenderVisuals: false,
      shouldRenderActions: true,
      shouldRenderOpponentReplying: false,
      shouldRenderAnalyzingCopy: false,
      shouldRenderNoTarget: false,
      criticalIssueIfInvalid: null,
    };
  }

  if ((runtimeStatus === "terminal" || analysisStatus === "terminal") && !input.hasTarget) {
    return {
      ...base,
      state: "continuation_terminal",
      reason: terminalReason ?? "terminal_position",
      shouldRenderTarget: false,
      shouldRenderVisuals: false,
      shouldRenderActions: true,
      shouldRenderOpponentReplying: false,
      shouldRenderAnalyzingCopy: false,
      shouldRenderNoTarget: false,
      criticalIssueIfInvalid: null,
    };
  }

  if (!input.isUserTurn || input.pendingOpponentRequestExists || runtimeStatus === "opponent_replying" || analysisStatus === "opponent_replying") {
    return {
      ...base,
      state: "continuation_opponent_replying",
      reason: !input.isUserTurn ? "opponent_to_move" : "pending_opponent_reply",
      shouldRenderTarget: false,
      shouldRenderVisuals: false,
      shouldRenderActions: false,
      shouldRenderOpponentReplying: true,
      shouldRenderAnalyzingCopy: false,
      shouldRenderNoTarget: false,
      criticalIssueIfInvalid: null,
    };
  }

  if (input.hasTarget && candidateUci) {
    return {
      ...base,
      state: "continuation_candidate_ready",
      reason: "candidate_locked",
      shouldRenderTarget: true,
      shouldRenderVisuals: true,
      shouldRenderActions: true,
      shouldRenderOpponentReplying: false,
      shouldRenderAnalyzingCopy: false,
      shouldRenderNoTarget: false,
      criticalIssueIfInvalid: null,
    };
  }

  if (analysisStatus === "error" || runtimeStatus === "error") {
    return {
      ...base,
      state: "continuation_error",
      reason: "continuation_analysis_error",
      shouldRenderTarget: false,
      shouldRenderVisuals: false,
      shouldRenderActions: true,
      shouldRenderOpponentReplying: false,
      shouldRenderAnalyzingCopy: true,
      shouldRenderNoTarget: false,
      criticalIssueIfInvalid: null,
    };
  }

  if (analysisStatus === "analyzing" || runtimeStatus === "analyzing" || runtimeStatus === "requested" || analysisStatus === "requested" || runtimeStatus === "idle") {
    return {
      ...base,
      state: "continuation_analyzing",
      reason: "candidate_analysis_pending",
      shouldRenderTarget: false,
      shouldRenderVisuals: false,
      shouldRenderActions: false,
      shouldRenderOpponentReplying: false,
      shouldRenderAnalyzingCopy: true,
      shouldRenderNoTarget: false,
      criticalIssueIfInvalid: null,
    };
  }

  return {
    ...base,
    state: "continuation_user_move_pending",
    reason: "continuation_user_turn_without_candidate",
    shouldRenderTarget: false,
    shouldRenderVisuals: false,
    shouldRenderActions: true,
    shouldRenderOpponentReplying: false,
    shouldRenderAnalyzingCopy: true,
    shouldRenderNoTarget: false,
    criticalIssueIfInvalid: "continuation_user_turn_without_candidate_or_analyzing",
  };
}
