import assert from "node:assert/strict";
import { presentMoveImpact } from "../moveImpactPresenter";

export function testMoveImpactPresenter(): void {
  const safe = presentMoveImpact({ exactMoveAllowed: true, engineStatus: "ready", isSafeMove: true });
  assert.equal(safe.label, "Safe");

  const study = presentMoveImpact({ exactMoveAllowed: true, isStudyLineMove: true });
  assert.equal(study.label, "Study-line move");

  const checking = presentMoveImpact({ exactMoveAllowed: false, engineStatus: "pending" });
  assert.equal(checking.label, "Checking");

  const noEvidence = presentMoveImpact({ exactMoveAllowed: true, engineStatus: "unavailable" });
  assert.equal(noEvidence.label, "Not enough evidence");

  const noRecommend = presentMoveImpact({ exactMoveAllowed: false, engineStatus: "ready", isSafeMove: true });
  assert.equal(noRecommend.show, false);
}
