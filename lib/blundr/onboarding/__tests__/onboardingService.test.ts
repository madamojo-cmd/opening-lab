import assert from "node:assert/strict";

import { createBlundrLocalPersistenceAdapter } from "../../persistence/localPersistenceAdapter";
import { getLocalTrainingProfile, getLocalUserRepertoire, resetLocalAccountState } from "../../accounts/localAccountStorage";
import { completeOnboarding, createDefaultOnboardingState } from "../onboardingService";
import { selectDailyGoalPreset, selectOnboardingRatingBand, selectStarterPack } from "../onboardingState";

resetLocalAccountState("user-1");

void (async () => {
  const state = selectDailyGoalPreset(
    selectStarterPack(
      selectOnboardingRatingBand(createDefaultOnboardingState("2026-07-04T12:00:00.000Z"), "1600-2000"),
      "dynamic_fighter",
    ),
    "serious",
  );

  const adapter = createBlundrLocalPersistenceAdapter("local_demo");
  const result = await completeOnboarding(state, "user-1", adapter);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.data.profile.userId, "user-1");
    assert.equal(result.data.profile.onboardingCompleted, true);
    assert.equal(result.data.profile.selectedStarterPackId, "dynamic_fighter");
    assert.equal(result.data.repertoire.selectedStarterPackId, "dynamic_fighter");
    assert.equal(result.data.repertoire.unlockedOpeningIds.length, 2);
  }

  assert.equal(getLocalTrainingProfile("user-1")?.onboardingCompleted, true);
  assert.equal(getLocalUserRepertoire("user-1")?.selectedStarterPackId, "dynamic_fighter");

  console.log("onboardingService.test.ts passed");
})();
