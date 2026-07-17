import assert from "node:assert/strict";
import test from "node:test";
import { getEarliestIncompleteOnboardingV11Step, getOnboardingV11PaceGoals } from "../onboardingV11Contract";

test("v1.1 onboarding resumes the durable next screen rather than inferring completion from defaults", () => {
  const state = { step: "level", completed: false, ratingBandId: "1200-1600", priorities: [], pace: "standard", starterPackId: null, trainingMode: null, ageConfirmed: false, startedAt: null, completedAt: null } as const;
  assert.equal(getEarliestIncompleteOnboardingV11Step(state), "level");
});

test("v1.1 onboarding maps only accepted pace contracts", () => {
  assert.deepEqual(getOnboardingV11PaceGoals("light"), { tempo: 5, battery: 1, daily: 1 });
  assert.deepEqual(getOnboardingV11PaceGoals("standard"), { tempo: 10, battery: 3, daily: 1 });
  assert.deepEqual(getOnboardingV11PaceGoals("focused"), { tempo: 20, battery: 5, daily: 1 });
});
