import assert from "node:assert/strict";

export const browserContract = {
  selectors: {
    board: '[data-testid="board"]',
    coachCard: '[data-testid="coach-card"]',
    plainHint: '[data-testid="plain-hint"]',
    showMoreButton: '[data-testid="show-more-button"]',
    continueButton: '[data-testid="continue-from-here-button"]',
    revealButton: '[data-testid="reveal-move-button"]',
    visualArrowByUci: (uci: string) => `[data-testid="visual-arrow-${uci}"]`,
  },
  assertions: {
    plainPreShowMoreNoAnswerLeak: "Plain hint must not expose SAN/UCI/from/to/piece before Show More.",
    showMoreRevealsSameTarget: "After Show More, revealed visual target must equal CurrentInstructionFrame.target.",
    continueBeforeCandidate: "Before Continue from Here, continuation candidate target is null and action is visible.",
    providerFailureSafeFallback: "Engine/Maia/opening failures must degrade claims without crashing UI.",
    safetyGateBlocksMismatches: "SafetyGate must block target/reveal/visual mismatches before UI rendering.",
    visibleSurfaceSafeFrameOnly: "VisibleTeachingSurface must be built from SafetyGateOutput.safeFrame only.",
    uiConsumesVisibleSurface: "When v2.8 flag is enabled, UI consumes coach/actions/visuals from VisibleTeachingSurface adapters.",
    debugParityWithCoachCard: "Debug visibleTitle/visibleBody must match the actual CoachCard title/body for the same frame.",
    validTargetNoRawSafetyFallback: "Valid teaching target frames must not render raw Safety Fallback generic copy.",
    recoverableClaimValidationNotBlocked: "claim_validation_failed with aligned target/piece/visual state must recover to safe teaching copy, not blocked surface.",
    branchCompleteNoSafetyFallback: "Valid branch_complete must render line-complete copy and must not render Safety Fallback.",
    branchCompleteDiagnosticPass: "Valid branch_complete diagnostics treat no_recipe and expected_move_missing as pass/not_applicable.",
    lineExhaustedRendersContinue: "When line is exhausted, branch_complete renders Continue from Here and restart actions.",
    opponentPendingHoldsContinue: "While opponent reply is pending, Continue from Here does not render.",
    opponentResolutionTransitionsToBranchComplete: "After opponent resolution on exhausted line, UI transitions to branch_complete instead of stuck ready_for_user opponent-turn.",
    continuationAnalyzingNotOpponentReplying: "After Continue on user turn, continuation analyzing must not render Opponent is replying.",
    continuationNoTargetCardSuppressed: "No Target must not appear in normal continuation analyzing/candidate flow.",
    continuationTerminalHasRestart: "Continuation terminal/checkmate must expose restart/train action on terminal surface.",
  },
};

export function testBrowserContract(): void {
  assert.equal(typeof browserContract.selectors.board, "string");
  assert.equal(typeof browserContract.selectors.coachCard, "string");
  assert.equal(typeof browserContract.selectors.visualArrowByUci("f1c4"), "string");

  const assertionTexts = Object.values(browserContract.assertions);
  assert.equal(assertionTexts.length >= 9, true);
  for (const text of assertionTexts) {
    assert.equal(typeof text, "string");
    assert.equal(text.trim().length > 0, true);
  }
}

testBrowserContract();
console.log("browserContract ok");
