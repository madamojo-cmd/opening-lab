import assert from "node:assert/strict";
import { decideCoachSurfacePolicy } from "../coachSurfacePolicy";

export function testCoachSurfacePolicy(): void {
  const active = decideCoachSurfacePolicy({
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
  assert.equal(active.owner, "evidence_coach");
  assert.equal(active.allowLegacyTrainingCard, false);

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
  assert.equal(hidden.owner, "none");
  assert.equal(hidden.allowLegacyTrainingCard, false);

  const continuationBlocked = decideCoachSurfacePolicy({
    coachShouldShow: false,
    coachHiddenForFrame: false,
    trainingMode: "continuation",
    viewMode: "assisted",
    hasExpectedMove: false,
    exactMoveAllowed: false,
    moveQualityGateStatus: "idle",
    engineValidationStatus: "unavailable",
    visualRecipeValid: true,
  });
  assert.equal(continuationBlocked.allowNextMoveText, false);

  const idleNoStrong = decideCoachSurfacePolicy({
    coachShouldShow: false,
    coachHiddenForFrame: false,
    trainingMode: "restricted",
    viewMode: "assisted",
    hasExpectedMove: true,
    exactMoveAllowed: false,
    moveQualityGateStatus: "idle",
    engineValidationStatus: "idle",
    visualRecipeValid: true,
  });
  assert.equal(idleNoStrong.allowMoveImpactCard, false);

  const restrictedFallback = decideCoachSurfacePolicy({
    coachShouldShow: false,
    coachHiddenForFrame: false,
    trainingMode: "restricted",
    viewMode: "assisted",
    hasExpectedMove: true,
    exactMoveAllowed: true,
    moveQualityGateStatus: "verified_top2",
    engineValidationStatus: "ready",
    visualRecipeValid: true,
  });
  assert.equal(restrictedFallback.allowLegacyTrainingCard, true);
}
