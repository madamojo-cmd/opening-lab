import assert from "node:assert/strict";

import { createDefaultRewardHistory } from "../../accounts/accountDefaults";
import { resetLocalAccountState } from "../../accounts/localAccountStorage";
import { evaluateTempoCacheRewards } from "../tempoCacheService";

resetLocalAccountState("user-1");

void (async () => {
  const initialHistory = createDefaultRewardHistory("user-1", "2026-07-01T00:00:00.000Z");
  initialHistory.allRingsDaysSinceRandomReward = 14;
  initialHistory.lastRandomRewardLocalDate = "2026-06-20";
  initialHistory.lastPityGuaranteeLocalDate = "2026-07-01";

  const first = await evaluateTempoCacheRewards({
    userId: "user-1",
    localDate: "2026-07-06",
    activitySource: "daily_blundr_deck_completed",
    ringClosedThisAction: true,
    allRingsClosedThisAction: true,
    currentStreakDays: 7,
    totalAllRingsClosedDays: 7,
    starterPackId: "classical_attacker",
    rewardHistory: initialHistory,
    rewardRolls: [],
    now: "2026-07-06T12:00:00.000Z",
  });

  assert.equal(first.state, "applied");
  assert.equal(first.pityTriggered, true);
  assert.equal(first.guaranteedCacheGranted, true);
  assert.ok(first.rewardGrants.length > 0);
  assert.ok(first.rewardPointsAwarded > 0);
  assert.equal(first.rewardHistory.lastPityGuaranteeLocalDate, "2026-07-06");

  const second = await evaluateTempoCacheRewards({
    userId: "user-1",
    localDate: "2026-07-06",
    activitySource: "daily_blundr_deck_completed",
    ringClosedThisAction: true,
    allRingsClosedThisAction: true,
    currentStreakDays: 7,
    totalAllRingsClosedDays: 7,
    starterPackId: "classical_attacker",
    rewardHistory: first.rewardHistory,
    rewardRolls: first.rewardRolls,
    now: "2026-07-06T12:00:00.000Z",
  });

  assert.equal(second.state, "applied");
  assert.ok(second.rewardGrants.length > 0);
  assert.equal(second.rewardPointsAwarded, 0);
  assert.equal(second.rewardHistory.allRingsDaysSinceRandomReward, 0);

  console.log("tempoCacheService.test.ts passed");
})();

