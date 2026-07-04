import assert from "node:assert/strict";

import type { UserRepertoire, UserTrainingProfile } from "../../accounts/accountTypes";
import { buildInitialRepertoireFromStarterPack } from "../starterPacks";
import { getFirstStarterPackTrainingTarget, getPostOnboardingDestination, shouldShowOnboarding } from "../onboardingRouting";

const incompleteProfile = { onboardingCompleted: false } as Pick<UserTrainingProfile, "onboardingCompleted">;
const completeProfile = { onboardingCompleted: true } as Pick<UserTrainingProfile, "onboardingCompleted">;
const repertoire = buildInitialRepertoireFromStarterPack({
  userId: "user-1",
  starterPackId: "classical_attacker",
});

assert.equal(shouldShowOnboarding(null), true);
assert.equal(shouldShowOnboarding(incompleteProfile), true);
assert.equal(shouldShowOnboarding(completeProfile), false);
assert.equal(getFirstStarterPackTrainingTarget(repertoire), "italian-white");
assert.equal(getPostOnboardingDestination(incompleteProfile, repertoire), "/onboarding");
assert.equal(getPostOnboardingDestination(completeProfile, repertoire), "/#italian-white");
assert.equal(getPostOnboardingDestination(completeProfile, { unlockedOpeningIds: [] } as Pick<UserRepertoire, "unlockedOpeningIds">), "/");

console.log("onboardingRouting.test.ts passed");
