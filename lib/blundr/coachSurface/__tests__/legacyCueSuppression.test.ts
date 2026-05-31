import assert from "node:assert/strict";
import { decideCoachSurfacePolicy } from "../coachSurfacePolicy";

export function testLegacyCueSuppression(): void {
  const blocked = decideCoachSurfacePolicy({
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
  assert.equal(blocked.allowLegacyTrainingCard, false);
  assert.equal(blocked.allowNextMoveText, false);
}
