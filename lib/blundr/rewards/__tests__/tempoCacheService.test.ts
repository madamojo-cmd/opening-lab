import assert from "node:assert/strict";

import { createDefaultRewardHistory } from "../../accounts/accountDefaults";
import { resetLocalAccountState } from "../../accounts/localAccountStorage";
import { loadRepertoireProgress } from "../../repertoire/repertoireProgressService";
import { evaluateTempoCacheRewards } from "../tempoCacheService";

resetLocalAccountState("user-1");

void (async () => {
  const initialHistory = createDefaultRewardHistory(
    "user-1",
    "2026-07-01T00:00:00.000Z",
  );
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

  assert.equal(first.state, "closed");
  assert.equal(first.pityTriggered, false);
  assert.equal(first.guaranteedCacheGranted, false);
  assert.equal(first.rewardGrants.length, 0);
  assert.equal(first.rewardPointsAwarded, 0);
  assert.ok(first.rewardRolls.length > 0);
  assert.equal(first.rewardHistory.allRingsDaysSinceRandomReward, 15);
  assert.equal(first.rewardHistory.lastRandomRewardLocalDate, "2026-06-20");
  assert.equal(first.rewardHistory.lastPityGuaranteeLocalDate, "2026-07-01");
  assert.equal(
    loadRepertoireProgress({
      userId: "user-1",
      now: "2026-07-06T12:00:00.000Z",
    }).availablePoints,
    0,
  );

  console.log("tempoCacheService.test.ts passed");
})();
