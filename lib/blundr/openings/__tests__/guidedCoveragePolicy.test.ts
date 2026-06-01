import assert from "node:assert/strict";

import { decideGuidedCoveragePolicy } from "../guidedCoveragePolicy";

const base = {
  currentPly: 10,
  fullMoveNumber: 6,
  activeOpeningId: "fixture",
  activeLineId: "fixture:0",
  normalizedFen: "8/8/8/8/8/8/8/4K3 w - -",
  sideToMove: "w" as const,
  userColor: "w" as const,
  branchFrequency: null,
  cumulativeBranchCoverage: null,
  nodeContinuationCount: 0,
  userContinuationCount: 0,
  opponentContinuationCount: 0,
  legalMoveCount: 12,
  knownBranchAvailable: false,
  adaptiveBranchAvailable: false,
  continuationCandidateExists: false,
  explicitCuratedTerminalNode: false,
};

export function testGuidedCoveragePolicy(): void {
  const missingExpectedMoveEarly = decideGuidedCoveragePolicy({ ...base, currentPly: 5 });
  assert.equal(missingExpectedMoveEarly.guidedCompleteAllowed, false);
  assert.equal(missingExpectedMoveEarly.guidedCompleteBlockedReason, "minimum_guided_depth_not_reached");

  const opponentTurn = decideGuidedCoveragePolicy({ ...base, sideToMove: "b" });
  assert.equal(opponentTurn.guidedCompleteAllowed, false);
  assert.equal(opponentTurn.guidedCompleteBlockedReason, "side_to_move_is_opponent");

  const continuationCandidate = decideGuidedCoveragePolicy({ ...base, continuationCandidateExists: true });
  assert.equal(continuationCandidate.guidedCompleteAllowed, false);
  assert.equal(continuationCandidate.guidedCompleteBlockedReason, "continuation_candidate_exists");

  const curatedTerminal = decideGuidedCoveragePolicy({ ...base, currentPly: 3, explicitCuratedTerminalNode: true });
  assert.equal(curatedTerminal.guidedCompleteAllowed, true);
  assert.equal(curatedTerminal.guidedCoverageState, "explicit_curated_terminal_node");

  const depthLimit = decideGuidedCoveragePolicy({ ...base, currentPly: 28 });
  assert.equal(depthLimit.guidedCompleteAllowed, true);
  assert.equal(depthLimit.guidedCoverageState, "guided_depth_limit_reached");

  const rareBranch = decideGuidedCoveragePolicy({ ...base, branchFrequency: 0.01 });
  assert.equal(rareBranch.guidedCompleteAllowed, true);
  assert.equal(rareBranch.guidedCoverageState, "branch_frequency_below_threshold");
}
