export type GuidedCoverageState =
  | "guided_book_active"
  | "guided_branch_available"
  | "adaptive_branch_available"
  | "guided_depth_limit_reached"
  | "branch_frequency_below_threshold"
  | "branch_complexity_limit_reached"
  | "opening_phase_complete"
  | "explicit_curated_terminal_node"
  | "unmapped_branch_needs_review"
  | "free_play_continuation";

export interface GuidedCoveragePolicyInput {
  currentPly: number;
  fullMoveNumber: number;
  activeOpeningId: string;
  activeLineId: string;
  normalizedFen: string;
  sideToMove: "w" | "b";
  userColor: "w" | "b";
  branchFrequency?: number | null;
  cumulativeBranchCoverage?: number | null;
  nodeContinuationCount: number;
  userContinuationCount: number;
  opponentContinuationCount: number;
  legalMoveCount: number;
  knownBranchAvailable: boolean;
  adaptiveBranchAvailable: boolean;
  continuationCandidateExists: boolean;
  explicitCuratedTerminalNode: boolean;
  depthLimit?: number;
}

export interface GuidedCoveragePolicyThresholds {
  minimumGuidedDepthPly: number;
  targetGuidedDepthPly: number;
  hardGuidedDepthPly: number;
  minBranchFrequency: number;
  targetCumulativeCoverage: number;
  maxBranchesPerNode: number;
}

export interface GuidedCoveragePolicyResult extends GuidedCoveragePolicyThresholds {
  guidedCoverageState: GuidedCoverageState;
  guidedCoverageReason: string;
  branchFrequency: number | null;
  cumulativeBranchCoverage: number | null;
  branchComplexity: number;
  explicitCuratedTerminalNode: boolean;
  guidedCompleteAllowed: boolean;
  guidedCompleteBlockedReason?: string;
  bookCompleteAllowed: boolean;
  bookCompleteBlockedReason?: string;
}

export const DEFAULT_GUIDED_COVERAGE_THRESHOLDS: GuidedCoveragePolicyThresholds = {
  minimumGuidedDepthPly: 8,
  targetGuidedDepthPly: 20,
  hardGuidedDepthPly: 28,
  minBranchFrequency: 0.03,
  targetCumulativeCoverage: 0.85,
  maxBranchesPerNode: 4,
};

export function decideGuidedCoveragePolicy(
  input: GuidedCoveragePolicyInput,
  thresholds: GuidedCoveragePolicyThresholds = DEFAULT_GUIDED_COVERAGE_THRESHOLDS,
): GuidedCoveragePolicyResult {
  const branchComplexity = input.nodeContinuationCount;
  const branchFrequency = input.branchFrequency ?? null;
  const cumulativeBranchCoverage = input.cumulativeBranchCoverage ?? null;
  const base = {
    ...thresholds,
    branchFrequency,
    cumulativeBranchCoverage,
    branchComplexity,
    explicitCuratedTerminalNode: input.explicitCuratedTerminalNode,
  };

  if (input.sideToMove !== input.userColor) {
    return { ...base, guidedCoverageState: "unmapped_branch_needs_review", guidedCoverageReason: "side_to_move_is_opponent", guidedCompleteAllowed: false, guidedCompleteBlockedReason: "side_to_move_is_opponent", bookCompleteAllowed: false, bookCompleteBlockedReason: "side_to_move_is_opponent" };
  }

  if (input.continuationCandidateExists) {
    return { ...base, guidedCoverageState: "free_play_continuation", guidedCoverageReason: "continuation_candidate_exists", guidedCompleteAllowed: false, guidedCompleteBlockedReason: "continuation_candidate_exists", bookCompleteAllowed: false, bookCompleteBlockedReason: "continuation_candidate_exists" };
  }

  if (input.knownBranchAvailable || input.userContinuationCount > 0) {
    return { ...base, guidedCoverageState: "guided_branch_available", guidedCoverageReason: "guided_branch_available", guidedCompleteAllowed: false, guidedCompleteBlockedReason: "guided_branch_available", bookCompleteAllowed: false, bookCompleteBlockedReason: "guided_branch_available" };
  }

  if (input.adaptiveBranchAvailable) {
    return { ...base, guidedCoverageState: "adaptive_branch_available", guidedCoverageReason: "adaptive_branch_available", guidedCompleteAllowed: false, guidedCompleteBlockedReason: "adaptive_branch_available", bookCompleteAllowed: false, bookCompleteBlockedReason: "adaptive_branch_available" };
  }

  if (input.explicitCuratedTerminalNode) {
    return { ...base, guidedCoverageState: "explicit_curated_terminal_node", guidedCoverageReason: "explicit_curated_terminal_node", guidedCompleteAllowed: true, bookCompleteAllowed: true };
  }

  if (input.currentPly < thresholds.minimumGuidedDepthPly) {
    return { ...base, guidedCoverageState: "unmapped_branch_needs_review", guidedCoverageReason: "minimum_guided_depth_not_reached", guidedCompleteAllowed: false, guidedCompleteBlockedReason: "minimum_guided_depth_not_reached", bookCompleteAllowed: false, bookCompleteBlockedReason: "minimum_guided_depth_not_reached" };
  }

  if (input.currentPly >= (input.depthLimit ?? thresholds.hardGuidedDepthPly)) {
    return { ...base, guidedCoverageState: "guided_depth_limit_reached", guidedCoverageReason: "guided_depth_limit_reached", guidedCompleteAllowed: true, bookCompleteAllowed: true };
  }

  if (branchFrequency !== null && branchFrequency < thresholds.minBranchFrequency) {
    return { ...base, guidedCoverageState: "branch_frequency_below_threshold", guidedCoverageReason: "branch_frequency_below_threshold", guidedCompleteAllowed: true, bookCompleteAllowed: true };
  }

  if (cumulativeBranchCoverage !== null && cumulativeBranchCoverage >= thresholds.targetCumulativeCoverage && branchComplexity > thresholds.maxBranchesPerNode) {
    return { ...base, guidedCoverageState: "branch_complexity_limit_reached", guidedCoverageReason: "branch_complexity_limit_reached", guidedCompleteAllowed: true, bookCompleteAllowed: true };
  }

  if (input.currentPly >= thresholds.targetGuidedDepthPly && input.legalMoveCount > 0 && input.nodeContinuationCount === 0) {
    return { ...base, guidedCoverageState: "opening_phase_complete", guidedCoverageReason: "opening_phase_complete", guidedCompleteAllowed: true, bookCompleteAllowed: true };
  }

  return { ...base, guidedCoverageState: "unmapped_branch_needs_review", guidedCoverageReason: "no_guided_completion_policy_matched", guidedCompleteAllowed: false, guidedCompleteBlockedReason: "no_guided_completion_policy_matched", bookCompleteAllowed: false, bookCompleteBlockedReason: "no_guided_completion_policy_matched" };
}
