import assert from "node:assert/strict";
import test from "node:test";
import { buildInitialRepertoireFromStarterPack } from "../starterPacks";
import { hasVerifiedStarterOpeningAccess } from "../starterOpeningAccess";
import {
  getEarliestIncompleteOnboardingV11Step,
  getOnboardingV11PaceGoals,
} from "../onboardingV11Contract";
import { shouldInitializeOnboardingV11StarterRepertoire } from "../onboardingV11";

test("v1.1 onboarding resumes the durable next screen rather than inferring completion from defaults", () => {
  const state = {
    step: "level",
    completed: false,
    ratingBandId: "1200-1600",
    priorities: [],
    pace: "standard",
    starterPackId: null,
    trainingMode: null,
    ageConfirmed: false,
    startedAt: null,
    completedAt: null,
  } as const;
  assert.equal(getEarliestIncompleteOnboardingV11Step(state), "level");
});

test("v1.1 onboarding maps only accepted pace contracts", () => {
  assert.deepEqual(getOnboardingV11PaceGoals("light"), {
    tempo: 5,
    battery: 1,
    daily: 1,
  });
  assert.deepEqual(getOnboardingV11PaceGoals("standard"), {
    tempo: 10,
    battery: 3,
    daily: 1,
  });
  assert.deepEqual(getOnboardingV11PaceGoals("focused"), {
    tempo: 20,
    battery: 5,
    daily: 1,
  });
});

test("v1.1 onboarding completion never reinitializes a saved repertoire", () => {
  assert.equal(
    shouldInitializeOnboardingV11StarterRepertoire({
      step: "ready",
      completed: true,
      ratingBandId: "1200-1600",
      priorities: ["remember_openings"],
      pace: "standard",
      starterPackId: "classical_attacker",
      trainingMode: "assisted",
      ageConfirmed: true,
      startedAt: "2026-08-03T00:00:00.000Z",
      completedAt: "2026-08-03T00:05:00.000Z",
    }),
    false,
  );
});

test("v1.1 onboarding verifies starter openings through the product access policy", () => {
  const user = {
    userId: "onboarding-access-user",
    mode: "authenticated" as const,
    isAuthenticated: true,
    isAdmin: false,
  };
  const repertoire = buildInitialRepertoireFromStarterPack({
    userId: user.userId,
    starterPackId: "classical_attacker",
    now: "2026-07-17T00:00:00.000Z",
  });
  const progress = {
    ...repertoire,
    selectedStarterPackId: "classical_attacker" as const,
    availablePoints: 0,
    lifetimePoints: 0,
    spentPoints: 0,
    nextUnlockCost: 0,
    nextUnlockProgressPct: 0,
    pointEvents: [],
    unlockEvents: [],
  };
  assert.equal(
    hasVerifiedStarterOpeningAccess(
      user,
      progress,
      repertoire.unlockedOpeningIds,
    ),
    true,
  );
  assert.equal(
    hasVerifiedStarterOpeningAccess(user, progress, ["queens-gambit-white"]),
    false,
  );
});
