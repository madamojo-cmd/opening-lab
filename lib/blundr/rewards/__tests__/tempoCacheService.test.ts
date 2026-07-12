import assert from "node:assert/strict";

import { createDefaultRewardRoll } from "../../accounts/accountDefaults";
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
  assert.ok(first.rewardPointsAwarded >= 0);
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

  const sharedSyncInitialHistory = createDefaultRewardHistory("user-2", "2026-07-01T00:00:00.000Z");
  const sharedSyncRewardRoll = createDefaultRewardRoll(
    "user-2",
    "weekly_cache",
    "shared-sync-roll-seed",
    "2026-07-06T12:00:00.000Z",
    true,
    {
      id: "shared-sync-fragment",
      rarity: "uncommon",
      rewardType: "opening_fragment",
      amount: 1,
      displayName: "Uncommon Opening Fragment",
      description: "Opening fragment added to inventory.",
    },
    "reward-cache:fragment:user-2:2026-07-06:7",
  );
  const sharedSyncFailed = await evaluateTempoCacheRewards({
    userId: "user-2",
    localDate: "2026-07-06",
    activitySource: "daily_blundr_deck_completed",
    ringClosedThisAction: true,
    allRingsClosedThisAction: true,
    currentStreakDays: 7,
    totalAllRingsClosedDays: 7,
    starterPackId: "classical_attacker",
    rewardHistory: sharedSyncInitialHistory,
    rewardRolls: [],
    now: "2026-07-06T12:00:00.000Z",
    deps: {
      evaluateRewardRoll: () =>
        ({
          roll: sharedSyncRewardRoll,
          reward: sharedSyncRewardRoll.reward,
          grant: {
            id: `${sharedSyncRewardRoll.id}:${sharedSyncRewardRoll.reward?.id}:grant`,
            rewardId: sharedSyncRewardRoll.reward?.id ?? "shared-sync-fragment",
            rewardRollId: sharedSyncRewardRoll.id,
            trigger: sharedSyncRewardRoll.trigger,
            triggerEventId: sharedSyncRewardRoll.id,
            rarity: sharedSyncRewardRoll.reward?.rarity ?? "uncommon",
            rewardType: sharedSyncRewardRoll.reward?.rewardType ?? "opening_fragment",
            amount: sharedSyncRewardRoll.reward?.amount ?? 1,
            displayName: sharedSyncRewardRoll.reward?.displayName ?? "Uncommon Opening Fragment",
            description: sharedSyncRewardRoll.reward?.description ?? "Opening fragment added to inventory.",
            pointsApplied: 0,
            applied: true,
            pendingChoice: false,
            grantMode: "guaranteed_cache",
            createdAt: sharedSyncRewardRoll.rolledAt,
          },
          grantMode: "guaranteed_cache",
          didReward: true,
        }) as never,
      applyRewardGrant: async () =>
        ({
          ok: false,
          code: "shared_sync_failed",
          message: "Shared reward persistence failed.",
        }) as never,
    },
  });

  assert.equal(sharedSyncFailed.sharedSyncFailed, true);
  assert.equal(sharedSyncFailed.sharedSyncFailureCode, "shared_sync_failed");
  assert.match(sharedSyncFailed.sharedSyncFailureMessage ?? "", /Shared reward persistence failed/i);
  assert.equal(sharedSyncFailed.rewardGrants.length, 0);
  assert.equal(sharedSyncFailed.rewardRolls.length, 0);
  assert.equal(sharedSyncFailed.rewardHistory.allRingsDaysSinceRandomReward, sharedSyncInitialHistory.allRingsDaysSinceRandomReward);
  assert.equal(sharedSyncFailed.rewardHistory.lastRandomRewardLocalDate, sharedSyncInitialHistory.lastRandomRewardLocalDate);
  assert.equal(sharedSyncFailed.rewardHistory.lastPityGuaranteeLocalDate, sharedSyncInitialHistory.lastPityGuaranteeLocalDate);

  console.log("tempoCacheService.test.ts passed");
})();
