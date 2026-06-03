import type { ExpectedMoveSource } from "../openings/openingTypes";

export interface ResolveBranchCompleteContractInput {
  trainingMode: "restricted" | "continuation";
  trainerPhase: string;
  isUserTurn: boolean;
  userExplicitlyEnteredContinuation: boolean;
  isTerminal: boolean;
  hasInstructionTarget: boolean;
  hasContinuationCandidate: boolean;
  pendingOpponentRequestExists: boolean;
  expectedMoveSource: ExpectedMoveSource | string;
  expectedMoveReason: string | null | undefined;
  expectedMoveUci: string | null | undefined;
  lineExhaustedByCursor: boolean;
  lineExhaustedByLichess: boolean;
  afterFinalUserMove?: boolean;
}

export interface BranchCompleteContract {
  branchCompleteEligible: boolean;
  reason: string | null;
  blockedReason: string | null;
  shouldCancelPendingOpponent: boolean;
  shouldPreventOpponentScheduling: boolean;
  shouldRenderBranchCompleteSurface: boolean;
  requiredSurfaceActionIds: string[];
  lineExhaustedEvidence: boolean;
  afterFinalUserMove: boolean;
  pendingOpponentRequestConflict: boolean;
}

function bool(v: unknown): boolean {
  return Boolean(v);
}

export function resolveBranchCompleteContract(input: ResolveBranchCompleteContractInput): BranchCompleteContract {
  const expectedReason = String(input.expectedMoveReason ?? "");
  const expectedSource = String(input.expectedMoveSource ?? "none");
  const exhaustedByResolver =
    expectedSource === "guided_branch_needs_continuation" ||
    /repertoire_line_exhausted_needs_continuation|line_exhausted|needs_continuation/i.test(expectedReason);
  const lineExhaustedEvidence = bool(input.lineExhaustedByCursor) || bool(input.lineExhaustedByLichess) || exhaustedByResolver;
  const afterFinalUserMove = bool(input.afterFinalUserMove) || (!input.isUserTurn && lineExhaustedEvidence);

  let blockedReason: string | null = null;
  if (input.trainingMode !== "restricted") blockedReason = "not_restricted_mode";
  else if (input.userExplicitlyEnteredContinuation) blockedReason = "already_in_continuation";
  else if (input.isTerminal) blockedReason = "terminal_position";
  else if (!lineExhaustedEvidence) blockedReason = "line_not_exhausted";
  else if (input.hasContinuationCandidate) blockedReason = "continuation_candidate_exists";
  else if (input.hasInstructionTarget || Boolean(input.expectedMoveUci)) blockedReason = "next_user_target_exists";

  const branchCompleteEligible = blockedReason === null;
  const reason = branchCompleteEligible
    ? (bool(input.lineExhaustedByCursor) ? "curated_line_complete" : bool(input.lineExhaustedByLichess) ? "line_complete" : "repertoire_line_exhausted_needs_continuation")
    : null;
  const pendingOpponentRequestConflict = branchCompleteEligible && input.pendingOpponentRequestExists;

  return {
    branchCompleteEligible,
    reason,
    blockedReason,
    shouldCancelPendingOpponent: pendingOpponentRequestConflict,
    shouldPreventOpponentScheduling: branchCompleteEligible,
    shouldRenderBranchCompleteSurface: branchCompleteEligible,
    requiredSurfaceActionIds: branchCompleteEligible ? ["continue_from_here", "restart_line"] : [],
    lineExhaustedEvidence,
    afterFinalUserMove,
    pendingOpponentRequestConflict,
  };
}
