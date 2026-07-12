import assert from "node:assert/strict";

import { createDefaultRewardRoll } from "../../accounts/accountDefaults";
import { resetLocalAccountState } from "../../accounts/localAccountStorage";
import { resetOnboardingAuthClientFactoryForTesting, setOnboardingAuthClientFactoryForTesting } from "../../accounts/accountSession";
import { loadRepertoireProgress } from "../../repertoire/repertoireProgressService";
import { getRewardInventory } from "../rewardInventoryService";
import { applyRewardGrant } from "../rewardGrantService";
import { evaluateRewardRoll, buildRewardTriggerEventId } from "../rewardRollService";

resetLocalAccountState("user-1");

void (async () => {
  const triggerEventId = buildRewardTriggerEventId({
    userId: "user-1",
    localDate: "2026-07-06",
    trigger: "weekly_cache",
    streakDays: 7,
  });
  const outcome = evaluateRewardRoll({
    userId: "user-1",
    localDate: "2026-07-06",
    trigger: "weekly_cache",
    triggerEventId,
    streakDays: 7,
    now: "2026-07-06T12:00:00.000Z",
  });

  assert.equal(outcome.didReward, true);
  assert.ok(outcome.reward);

  const result = await applyRewardGrant({
    userId: "user-1",
    roll: outcome.roll,
    grantMode: outcome.grantMode ?? "guaranteed_cache",
    now: "2026-07-06T12:00:00.000Z",
    starterPackId: "classical_attacker",
  });

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.applied, true);
    assert.equal(result.code, "applied");
    assert.equal(result.grant.applied, true);
    if (outcome.reward?.rewardType === "opening_fragment" || outcome.reward?.rewardType === "choice_token") {
      assert.equal(result.inventoryResult?.ok, true);
      assert.equal(result.pointResult, undefined);
    } else {
      assert.equal(result.pointResult?.ok, true);
      assert.equal(result.inventoryResult, undefined);
    }
  }

  const progress = loadRepertoireProgress({ userId: "user-1", now: "2026-07-06T12:00:00.000Z" });
  if (outcome.reward?.rewardType === "opening_fragment" || outcome.reward?.rewardType === "choice_token") {
    assert.equal(progress.availablePoints, 0);
  } else {
    assert.ok(progress.availablePoints > 0);
    assert.equal(progress.availablePoints, outcome.reward?.amount ?? 0);
  }

  const fragmentUserId = "user-2";
  resetLocalAccountState(fragmentUserId);
  const fragmentRoll = createDefaultRewardRoll(
    fragmentUserId,
    "weekly_cache",
    "fragment-seed",
    "2026-07-06T12:00:00.000Z",
    true,
    {
      id: "fragment-reward",
      rarity: "uncommon",
      rewardType: "opening_fragment",
      amount: 1,
      displayName: "Uncommon Opening Fragment",
      description: "Opening fragment added to inventory.",
    },
    "reward-cache:fragment:user-2:2026-07-06:7",
  );
  const fragmentResult = await applyRewardGrant({
    userId: fragmentUserId,
    roll: fragmentRoll,
    grantMode: "guaranteed_cache",
    now: "2026-07-06T12:00:00.000Z",
    starterPackId: "classical_attacker",
    syncRemote: false,
  });
  assert.equal(fragmentResult.ok, true);
  if (fragmentResult.ok) {
    assert.equal(fragmentResult.applied, true);
    assert.equal(fragmentResult.code, "applied");
    assert.equal(fragmentResult.pointResult, undefined);
    assert.equal(fragmentResult.inventoryResult?.ok, true);
    assert.equal(getRewardInventory(fragmentUserId).openingFragments, 1);
  }

  const duplicateFragmentResult = await applyRewardGrant({
    userId: fragmentUserId,
    roll: fragmentRoll,
    grantMode: "guaranteed_cache",
    now: "2026-07-06T12:00:00.000Z",
    starterPackId: "classical_attacker",
    syncRemote: false,
  });
  assert.equal(duplicateFragmentResult.ok, true);
  if (duplicateFragmentResult.ok) {
    assert.equal(duplicateFragmentResult.applied, false);
    assert.equal(duplicateFragmentResult.code, "duplicate");
    assert.equal(duplicateFragmentResult.grant.applied, false);
    assert.equal(getRewardInventory(fragmentUserId).openingFragments, 1);
  }

  const tokenUserId = "user-3";
  resetLocalAccountState(tokenUserId);
  const tokenRoll = createDefaultRewardRoll(
    tokenUserId,
    "weekly_cache",
    "token-seed",
    "2026-07-06T12:00:00.000Z",
    true,
    {
      id: "token-reward",
      rarity: "rare",
      rewardType: "choice_token",
      amount: 1,
      displayName: "Rare Choice Token",
      description: "Choice token added to inventory.",
    },
    "reward-cache:token:user-3:2026-07-06:7",
  );
  const tokenResult = await applyRewardGrant({
    userId: tokenUserId,
    roll: tokenRoll,
    grantMode: "guaranteed_cache",
    now: "2026-07-06T12:00:00.000Z",
    starterPackId: "classical_attacker",
    syncRemote: false,
  });
  assert.equal(tokenResult.ok, true);
  if (tokenResult.ok) {
    assert.equal(tokenResult.applied, true);
    assert.equal(tokenResult.code, "applied");
    assert.equal(tokenResult.pointResult, undefined);
    assert.equal(tokenResult.inventoryResult?.ok, true);
    assert.equal(getRewardInventory(tokenUserId).choiceTokens, 1);
  }

  const duplicateTokenResult = await applyRewardGrant({
    userId: tokenUserId,
    roll: tokenRoll,
    grantMode: "guaranteed_cache",
    now: "2026-07-06T12:00:00.000Z",
    starterPackId: "classical_attacker",
    syncRemote: false,
  });
  assert.equal(duplicateTokenResult.ok, true);
  if (duplicateTokenResult.ok) {
    assert.equal(duplicateTokenResult.applied, false);
    assert.equal(duplicateTokenResult.code, "duplicate");
    assert.equal(duplicateTokenResult.grant.applied, false);
    assert.equal(getRewardInventory(tokenUserId).choiceTokens, 1);
  }

  const epicUserId = "user-4";
  resetLocalAccountState(epicUserId);
  const epicRoll = createDefaultRewardRoll(
    epicUserId,
    "weekly_cache",
    "epic-seed",
    "2026-07-06T12:00:00.000Z",
    true,
    {
      id: "epic-reward",
      rarity: "epic",
      rewardType: "unlock_points",
      amount: 100,
      displayName: "Epic Bonus",
      description: "Epic bonus applied as repertoire points.",
    },
    "reward-cache:epic:user-4:2026-07-06:7",
  );
  const epicResult = await applyRewardGrant({
    userId: epicUserId,
    roll: epicRoll,
    grantMode: "guaranteed_cache",
    now: "2026-07-06T12:00:00.000Z",
    starterPackId: "classical_attacker",
    syncRemote: false,
  });
  assert.equal(epicResult.ok, true);
  if (epicResult.ok) {
    assert.equal(epicResult.applied, true);
    assert.equal(epicResult.code, "applied");
    assert.equal(epicResult.inventoryResult, undefined);
    assert.equal(epicResult.pointResult?.ok, true);
    assert.equal(loadRepertoireProgress({ userId: epicUserId, now: "2026-07-06T12:00:00.000Z" }).availablePoints, 100);
  }

  process.env.NEXT_PUBLIC_BLUNDR_STORAGE_MODE = "authenticated";
  setOnboardingAuthClientFactoryForTesting(() => ({
    auth: {
      getSession: async () => ({
        data: {
          session: {
            access_token: "auth-token",
            expires_at: Math.floor(Date.now() / 1000) + 3600,
            user: {
              id: "auth-user-id",
              email: "tester@example.com",
            },
          },
        },
        error: null,
      }),
      getUser: async () => ({
        data: {
          user: {
            id: "auth-user-id",
            email: "tester@example.com",
            app_metadata: { provider: "email" },
          },
        },
        error: null,
      }),
    },
  }) as never);

  const sharedSyncFragmentRoll = createDefaultRewardRoll(
    "auth-user-id",
    "weekly_cache",
    "shared-sync-fragment-seed",
    "2026-07-06T12:00:00.000Z",
    true,
    {
      id: "shared-sync-fragment-reward",
      rarity: "uncommon",
      rewardType: "opening_fragment",
      amount: 1,
      displayName: "Uncommon Opening Fragment",
      description: "Opening fragment added to inventory.",
    },
    "reward-cache:fragment:auth-user-id:2026-07-06:7",
  );
  const sharedSyncFragmentResult = await applyRewardGrant({
    userId: "stale-user-id",
    roll: sharedSyncFragmentRoll,
    grantMode: "guaranteed_cache",
    now: "2026-07-06T12:00:00.000Z",
    starterPackId: "classical_attacker",
  });
  assert.equal(sharedSyncFragmentResult.ok, false);
  if (!sharedSyncFragmentResult.ok) {
    assert.equal(sharedSyncFragmentResult.code, "shared_sync_failed");
    assert.match(sharedSyncFragmentResult.message, /Shared reward persistence failed/i);
    assert.equal(getRewardInventory("auth-user-id").openingFragments, 0);
  }

  const sharedSyncTokenRoll = createDefaultRewardRoll(
    "auth-user-id",
    "weekly_cache",
    "shared-sync-token-seed",
    "2026-07-06T12:00:00.000Z",
    true,
    {
      id: "shared-sync-token-reward",
      rarity: "rare",
      rewardType: "choice_token",
      amount: 1,
      displayName: "Rare Choice Token",
      description: "Choice token added to inventory.",
    },
    "reward-cache:token:auth-user-id:2026-07-06:7",
  );
  const sharedSyncTokenResult = await applyRewardGrant({
    userId: "stale-user-id",
    roll: sharedSyncTokenRoll,
    grantMode: "guaranteed_cache",
    now: "2026-07-06T12:00:00.000Z",
    starterPackId: "classical_attacker",
  });
  assert.equal(sharedSyncTokenResult.ok, false);
  if (!sharedSyncTokenResult.ok) {
    assert.equal(sharedSyncTokenResult.code, "shared_sync_failed");
    assert.match(sharedSyncTokenResult.message, /Shared reward persistence failed/i);
    assert.equal(getRewardInventory("auth-user-id").choiceTokens, 0);
  }

  console.log("rewardGrantService.test.ts passed");
})();
