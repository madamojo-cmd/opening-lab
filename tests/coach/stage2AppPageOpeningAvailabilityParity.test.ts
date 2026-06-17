import assert from "node:assert/strict";

import {
  STAGE2_OPENING_AVAILABILITY_MATRIX,
  getStage2OpeningAvailabilitySummary,
} from "../../lib/blundr/openings/openingAvailability";

export function testStage2AppPageOpeningAvailabilityParity(): void {
  const summary = getStage2OpeningAvailabilitySummary();
  assert.equal(summary.runtimeAvailableCount, 21);
  assert.equal(summary.visibleOpeningCount, 21);
  assert.equal(summary.publicOpeningCount, 0);
  assert.equal(summary.betaOpeningCount, 1);
  assert.equal(summary.devOpeningCount, 20);
  assert.equal(summary.hiddenOpeningCount, 0);
  assert.equal(summary.liveLichessCalled, false);
  assert.equal(summary.openingAvailabilityStatus, "smoke_pass");

  const italianWhite = STAGE2_OPENING_AVAILABILITY_MATRIX.find((entry) => entry.openingId === "italian-white");
  assert.ok(italianWhite, "italian_white_missing");
  assert.equal(italianWhite?.leadingMvpCandidate, true);
  assert.equal(italianWhite?.betaReady, true);
  assert.equal(italianWhite?.publicReady, false);

  for (const opening of STAGE2_OPENING_AVAILABILITY_MATRIX) {
    assert.equal(opening.runtimeAvailable, true, `runtime_not_available:${opening.openingId}`);
    assert.equal(opening.userVisible, true, `selector_visibility_changed:${opening.openingId}`);
    assert.equal(opening.publicReady, false, `public_flip_detected:${opening.openingId}`);
    assert.equal(opening.needsBrowserQA, true, `browser_qa_pending:${opening.openingId}`);
  }
}

testStage2AppPageOpeningAvailabilityParity();
console.log("stage2AppPageOpeningAvailabilityParity ok");
