import type { ExpectedMoveSource } from "../openings/openingTypes";
import { resolveSelectedLineExhaustion } from "./selectedLineExhaustion";

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
  selectedLineId?: string | null;
  fen4?: string | null;
  lastUserMoveUci?: string | null;
  lastUserMoveSan?: string | null;
  exactNodeHasChildren?: boolean | "unknown";
  hasNextOpponentMove?: boolean | "unknown";
  hasNextUserMove?: boolean | "unknown";
  explicitCuratedTerminalNode?: boolean;
  validBranchCompleteLatch?: boolean;
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
  branchCompleteReason: string | null;
  branchCompleteBlockedReason: string | null;
  selectedLineExhausted: boolean;
  selectedLineExhaustionReason: string | null;
  selectedLineExhaustionBlockedReason: string | null;
  exactNodeHasChildren: boolean | "unknown";
  hasNextOpponentMove: boolean | "unknown";
  hasNextUserMove: boolean | "unknown";
  knownFinalFenMatched: boolean;
  knownFinalMoveMatched: boolean;
  finalGuidedUserMoveCompletedLine: boolean;
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
  const selectedLineResolution = resolveSelectedLineExhaustion({
    trainingMode: input.trainingMode,
    selectedLineId: input.selectedLineId ?? null,
    fen4: String(input.fen4 ?? ""),
    lastUserMoveUci: input.lastUserMoveUci ?? null,
    lastUserMoveSan: input.lastUserMoveSan ?? null,
    userExplicitlyEnteredContinuation: input.userExplicitlyEnteredContinuation,
    afterFinalUserMove: bool(input.afterFinalUserMove),
    explicitCuratedTerminalNode: bool(input.explicitCuratedTerminalNode),
    exactNodeHasChildren: input.exactNodeHasChildren ?? "unknown",
    hasNextOpponentMove: input.hasNextOpponentMove ?? "unknown",
    hasNextUserMove: input.hasNextUserMove ?? "unknown",
    validBranchCompleteLatch: bool(input.validBranchCompleteLatch),
  });
  const finalGuidedUserMoveCompletedLine = selectedLineResolution.reason === "restricted_line_exhausted_after_final_known_move";
  const lineExhaustedEvidence = bool(input.lineExhaustedByCursor) || bool(input.lineExhaustedByLichess) || exhaustedByResolver || selectedLineResolution.exhausted;
  const afterFinalUserMove = bool(input.afterFinalUserMove) || (!input.isUserTurn && lineExhaustedEvidence);

  let blockedReason: string | null = null;
  if (input.trainingMode !== "restricted") blockedReason = "not_restricted_mode";
  else if (input.userExplicitlyEnteredContinuation) blockedReason = "already_in_continuation";
  else if (input.isTerminal) blockedReason = "terminal_position";
  else if (!selectedLineResolution.exhausted && !exhaustedByResolver && !bool(input.lineExhaustedByCursor) && !bool(input.lineExhaustedByLichess)) {
    blockedReason = selectedLineResolution.blockedReason ?? "selected_line_not_exhausted";
  }
  else if (!lineExhaustedEvidence) blockedReason = "line_not_exhausted";
  else if (input.hasInstructionTarget || Boolean(input.expectedMoveUci)) blockedReason = "next_user_target_exists";

  const branchCompleteEligible = blockedReason === null;
  const reason = branchCompleteEligible
    ? (
      finalGuidedUserMoveCompletedLine
        ? "restricted_line_exhausted_after_final_known_move"
        : selectedLineResolution.reason === "selected_line_exhausted"
          ? "selected_line_exhausted"
          : selectedLineResolution.reason === "explicit_curated_terminal_node"
            ? "explicit_curated_terminal_node"
            : selectedLineResolution.reason === "valid_branch_complete_latch"
              ? "valid_branch_complete_latch"
        : bool(input.lineExhaustedByCursor)
          ? "curated_line_complete"
          : bool(input.lineExhaustedByLichess)
            ? "line_complete"
            : "repertoire_line_exhausted_needs_continuation"
    )
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
    branchCompleteReason: reason,
    branchCompleteBlockedReason: blockedReason,
    selectedLineExhausted: selectedLineResolution.exhausted,
    selectedLineExhaustionReason: selectedLineResolution.reason,
    selectedLineExhaustionBlockedReason: selectedLineResolution.blockedReason,
    exactNodeHasChildren: selectedLineResolution.exactNodeHasChildren,
    hasNextOpponentMove: selectedLineResolution.hasNextOpponentMove,
    hasNextUserMove: selectedLineResolution.hasNextUserMove,
    knownFinalFenMatched: selectedLineResolution.knownFinalFenMatched,
    knownFinalMoveMatched: selectedLineResolution.knownFinalMoveMatched,
    finalGuidedUserMoveCompletedLine,
  };
}
