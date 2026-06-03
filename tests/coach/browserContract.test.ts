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
  },
};

export function testBrowserContract(): void {
  assert.equal(typeof browserContract.selectors.board, "string");
  assert.equal(typeof browserContract.selectors.coachCard, "string");
  assert.equal(typeof browserContract.selectors.visualArrowByUci("f1c4"), "string");

  const assertionTexts = Object.values(browserContract.assertions);
  assert.equal(assertionTexts.length >= 4, true);
  for (const text of assertionTexts) {
    assert.equal(typeof text, "string");
    assert.equal(text.trim().length > 0, true);
  }
}

testBrowserContract();
console.log("browserContract ok");
