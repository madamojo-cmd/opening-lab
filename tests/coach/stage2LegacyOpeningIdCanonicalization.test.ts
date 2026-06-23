import assert from "node:assert/strict";

import { buildTrainerFrameResolution } from "../../lib/blundr/debug/buildTrainerFrameResolution";
import { resolveStage2CanonicalOpeningId } from "../../lib/blundr/openings/openingIdentity";
import { getStage2OpeningAvailability } from "../../lib/blundr/openings/openingAvailability";

export function testStage2LegacyOpeningIdCanonicalization(): void {
  assert.equal(resolveStage2CanonicalOpeningId("ruy-white"), "ruy-lopez-white");
  assert.equal(resolveStage2CanonicalOpeningId("caro-black"), "caro-kann-black");
  assert.equal(resolveStage2CanonicalOpeningId("not-a-real-opening"), null);

  const availability = getStage2OpeningAvailability("ruy-white");
  assert.equal(availability.openingId, "ruy-lopez-white");
  assert.equal(availability.runtimeAvailable, true);

  const resolution = buildTrainerFrameResolution({
    trainerFrameId: 12,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: true,
    selectedOpeningId: "ruy-white",
    selectedLineId: "ruy-white",
    runtimeBookOpeningId: "ruy-lopez-white",
    selectedOpeningRuntimeAvailable: true,
    selectedLineCompleteConfirmed: false,
    exactNodeHasChildren: "unknown",
    hasNextOpponentMove: "unknown",
    hasNextUserMove: "unknown",
    validBranchCompleteLatch: false,
    bookCompleteAllowed: true,
    guidedCompleteAllowed: true,
    runtimeBookBookExhausted: false,
    runtimeBookCandidateCount: 2,
    runtimeBookStatus: "ready",
  } as any);

  assert.equal(resolution.openingIdentity?.selectedOpeningId, "ruy-white");
  assert.equal(resolution.openingIdentity?.canonicalSelectedOpeningId, "ruy-lopez-white");
  assert.equal(resolution.openingIdentity?.runtimeOpeningId, "ruy-lopez-white");
}

testStage2LegacyOpeningIdCanonicalization();
console.log("stage2LegacyOpeningIdCanonicalization ok");
