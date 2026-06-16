import assert from "node:assert/strict";

import {
  STAGE2_OPENING_AVAILABILITY_MATRIX,
  STAGE2_RUNTIME_PACKAGE_ID,
  getStage2OpeningAvailabilitySummary,
} from "../../lib/blundr/openings/openingAvailability";

export function testOpeningVisibilityMatrix(): void {
  assert.equal(STAGE2_OPENING_AVAILABILITY_MATRIX.length, 21, "runtime_visible_opening_count_must_be_21");

  const summary = getStage2OpeningAvailabilitySummary();
  assert.equal(summary.runtimeDataSource, "local_crawled_package");
  assert.equal(summary.runtimePackageId, STAGE2_RUNTIME_PACKAGE_ID);
  assert.equal(summary.openingCount, 21);
  assert.equal(summary.visibleOpeningCount, 21);
  assert.equal(summary.liveLichessCalled, false);
  assert.equal(summary.openingAvailabilityStatus, "smoke_pass");

  const openingIds = STAGE2_OPENING_AVAILABILITY_MATRIX.map((entry) => entry.openingId).sort();
  assert.equal(openingIds.length, 21, "opening_id_count_mismatch");
  assert.equal(new Set(openingIds).size, 21, "opening_ids_must_be_unique");
  assert.equal(summary.approvedContentInventoryCount, 21);
  assert.equal(summary.approvedContentMatchedCount, 0);

  for (const opening of STAGE2_OPENING_AVAILABILITY_MATRIX) {
    assert.equal(Boolean(opening.displayName), true, `display_name_missing:${opening.openingId}`);
    assert.equal(opening.learnerPerspective === "white" || opening.learnerPerspective === "black", true, `learner_perspective_invalid:${opening.openingId}`);
    assert.equal(opening.runtimeAvailable, true, `runtime_not_available:${opening.openingId}`);
    assert.equal(opening.runtimePackageId, STAGE2_RUNTIME_PACKAGE_ID, `runtime_package_id_mismatch:${opening.openingId}`);
    assert.equal(opening.runtimeNodeCount > 0, true, `runtime_node_count_missing:${opening.openingId}`);
    assert.equal(opening.runtimeCandidateMoveCount > 0, true, `runtime_candidate_count_missing:${opening.openingId}`);
    assert.equal(opening.userVisible, true, `opening_not_user_visible:${opening.openingId}`);
    const expectedContentStatus =
      opening.openingId === "italian-black" || opening.openingId === "italian-white" || opening.openingId === "ruy-lopez-white"
        ? "sample"
        : "fallback_only";
    assert.equal(opening.contentStatus, expectedContentStatus, `content_status_mismatch:${opening.openingId}`);
    assert.equal(opening.approvedContentAvailable, false, `approved_content_should_not_be_faked:${opening.openingId}`);
    assert.equal(opening.stage, "dev", `stage_mismatch:${opening.openingId}`);
    assert.equal(opening.qaStatus, "smoke_pass", `qa_status_mismatch:${opening.openingId}`);
  }

  assert.equal(STAGE2_OPENING_AVAILABILITY_MATRIX.length > 8, true, "stale_8_opening_gate_detected");
}

testOpeningVisibilityMatrix();
console.log("openingVisibilityMatrix ok");
