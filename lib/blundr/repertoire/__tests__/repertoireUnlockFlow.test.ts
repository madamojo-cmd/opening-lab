import assert from "node:assert/strict";

import { createDefaultUserRepertoire } from "../../accounts/accountDefaults";
import { createDefaultRewardInventory } from "../../rewards/rewardInventoryTypes";
import { getRepertoireUnlockMethodOptions, getRepertoireUnlockMethodTitle } from "../repertoireUnlockFlow";

void (async () => {
  const card = {
    openingId: "test-opening",
    openingName: "Test Opening",
    side: "white" as const,
    status: "locked" as const,
    pointsCost: 12,
    description: "Test opening",
  };
  const progress = {
    ...createDefaultUserRepertoire("test-user"),
    userId: "test-user",
    availablePoints: 15,
    lifetimePoints: 15,
    spentPoints: 0,
    nextUnlockCost: 12,
    nextUnlockProgressPct: 100,
    pointEvents: [],
    unlockEvents: [],
    updatedAt: "2026-07-10T00:00:00.000Z",
  };
  const inventory = {
    ...createDefaultRewardInventory("test-user"),
    userId: "test-user",
    openingFragments: 4,
    choiceTokens: 1,
    appliedEventIds: [],
    events: [],
    updatedAt: "2026-07-10T00:00:00.000Z",
    availableFragmentUnlockCredits: 1,
  };

  const options = getRepertoireUnlockMethodOptions(card, progress, inventory);
  assert.equal(options.length, 3);
  assert.equal(options[0].method, "repertoire_points");
  assert.equal(options[0].available, true);
  assert.equal(options[0].costLabel, "12 Repertoire Points");
  assert.equal(options[1].method, "opening_fragments");
  assert.equal(options[1].available, true);
  assert.equal(options[1].after.fragments, 1);
  assert.equal(options[2].method, "choice_token");
  assert.equal(options[2].available, true);
  assert.equal(options[2].after.tokens, 0);
  assert.equal(getRepertoireUnlockMethodTitle("opening_fragments"), "Opening Fragments");
  assert.equal(getRepertoireUnlockMethodTitle("choice_token"), "Choice Token");
  assert.equal(getRepertoireUnlockMethodTitle("repertoire_points"), "Repertoire Points");

  console.log("repertoireUnlockFlow.test.ts passed");
})();
