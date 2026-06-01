import assert from "node:assert/strict";
import { decideCoachSurfacePolicy } from "../coachSurfacePolicy";

export function testCoachHideSurface(): void {
  const hidden = decideCoachSurfacePolicy({
    coachShouldShow: false,
    coachSuppressedReason: "hidden_for_frame",
    coachHiddenForFrame: true,
    trainingMode: "restricted",
    viewMode: "assisted",
    hasExpectedMove: true,
    exactMoveAllowed: true,
    moveQualityGateStatus: "verified_top2",
    engineValidationStatus: "ready",
    visualRecipeValid: true,
  });
  assert.equal(hidden.allowLegacyTrainingCard, false);
  assert.equal(hidden.allowLegacyAnswerCard, false);

  const nextFrame = decideCoachSurfacePolicy({
    coachShouldShow: true,
    coachHiddenForFrame: false,
    trainingMode: "restricted",
    viewMode: "assisted",
    hasExpectedMove: true,
    exactMoveAllowed: true,
    moveQualityGateStatus: "verified_top2",
    engineValidationStatus: "ready",
    visualRecipeValid: true,
  });
  assert.equal(nextFrame.owner, "evidence_coach");
}
