import assert from "node:assert/strict";

import { createDefaultUserRepertoire } from "../../accounts/accountDefaults";
import { resetOnboardingAuthClientFactoryForTesting, setOnboardingAuthClientFactoryForTesting } from "../../accounts/accountSession";
import { resetLocalAccountState, upsertLocalUserRepertoire } from "../../accounts/localAccountStorage";
import { getEligibleRepertoireOpeningIds } from "../../repertoire/repertoireOpeningPool";
import { loadRepertoireProgress } from "../../repertoire/repertoireProgressService";
import {
  getEligibleLockedOpeningsForFragmentUnlock,
  getRewardInventory,
  grantChoiceTokens,
  grantOpeningFragments,
  spendChoiceTokenOnOpening,
  spendOpeningFragmentsOnOpening,
} from "../rewardInventoryService";

function seedUnlockedRepertoire(userId: string): string[] {
  const allOpeningIds = getEligibleRepertoireOpeningIds();
  upsertLocalUserRepertoire({
    ...createDefaultUserRepertoire(userId),
    userId,
    unlockedOpeningIds: [...allOpeningIds],
    lockedOpeningIds: [],
    openingUnlockPoints: 0,
    updatedAt: "2026-07-06T12:00:00.000Z",
  });
  loadRepertoireProgress({ userId, now: "2026-07-06T12:00:00.000Z" });
  return allOpeningIds;
}

void (async () => {
  const now = "2026-07-06T12:00:00.000Z";
  process.env.NEXT_PUBLIC_BLUNDR_STORAGE_MODE = "local_demo";

  const fragmentUser = "reward-inventory-fragment-user";
  resetLocalAccountState(fragmentUser);
  const initialLockedOpenings = getEligibleLockedOpeningsForFragmentUnlock({ userId: fragmentUser });
  assert.ok(initialLockedOpenings.length > 0);

  const firstFragmentGrant = await grantOpeningFragments({
    userId: fragmentUser,
    amount: 1,
    sourceEventId: "fragment-grant-1",
    now,
  });
  assert.equal(firstFragmentGrant.ok, true);
  assert.equal(firstFragmentGrant.applied, true);
  assert.equal(getRewardInventory(fragmentUser).openingFragments, 1);
  assert.equal(getRewardInventory(fragmentUser).availableFragmentUnlockCredits, 0);

  const duplicateFragmentGrant = await grantOpeningFragments({
    userId: fragmentUser,
    amount: 1,
    sourceEventId: "fragment-grant-1",
    now,
  });
  assert.equal(duplicateFragmentGrant.ok, true);
  assert.equal(duplicateFragmentGrant.applied, false);
  assert.equal(duplicateFragmentGrant.code, "duplicate");
  assert.equal(getRewardInventory(fragmentUser).openingFragments, 1);

  const secondFragmentGrant = await grantOpeningFragments({
    userId: fragmentUser,
    amount: 3,
    sourceEventId: "fragment-grant-2",
    now,
  });
  assert.equal(secondFragmentGrant.ok, true);
  assert.equal(getRewardInventory(fragmentUser).openingFragments, 4);
  assert.equal(getRewardInventory(fragmentUser).availableFragmentUnlockCredits, 1);
  assert.equal(getEligibleLockedOpeningsForFragmentUnlock({ userId: fragmentUser }).length, initialLockedOpenings.length);

  const fragmentSpend = await spendOpeningFragmentsOnOpening({
    userId: fragmentUser,
    openingId: initialLockedOpenings[0] ?? "",
    sourceEventId: "fragment-spend-1",
    now,
  });
  assert.equal(fragmentSpend.ok, true);
  assert.equal(fragmentSpend.applied, true);
  assert.equal(fragmentSpend.unlockedOpeningId, initialLockedOpenings[0]);
  assert.equal(getRewardInventory(fragmentUser).openingFragments, 1);
  assert.equal(getRewardInventory(fragmentUser).availableFragmentUnlockCredits, 0);
  assert.equal(loadRepertoireProgress({ userId: fragmentUser, now }).unlockedOpeningIds.includes(initialLockedOpenings[0] ?? ""), true);

  const duplicateFragmentSpend = await spendOpeningFragmentsOnOpening({
    userId: fragmentUser,
    openingId: initialLockedOpenings[0] ?? "",
    sourceEventId: "fragment-spend-1",
    now,
  });
  assert.equal(duplicateFragmentSpend.ok, true);
  assert.equal(duplicateFragmentSpend.applied, false);
  assert.equal(duplicateFragmentSpend.code, "duplicate");
  assert.equal(getRewardInventory(fragmentUser).openingFragments, 1);

  const multiFragmentUser = "reward-inventory-multi-fragment-user";
  resetLocalAccountState(multiFragmentUser);
  const multiLockedOpenings = getEligibleLockedOpeningsForFragmentUnlock({ userId: multiFragmentUser });
  assert.ok(multiLockedOpenings.length >= 2);

  const multiGrant = await grantOpeningFragments({
    userId: multiFragmentUser,
    amount: 6,
    sourceEventId: "fragment-grant-6",
    now,
  });
  assert.equal(multiGrant.ok, true);
  assert.equal(getRewardInventory(multiFragmentUser).openingFragments, 6);
  assert.equal(getRewardInventory(multiFragmentUser).availableFragmentUnlockCredits, 2);

  const firstMultiSpend = await spendOpeningFragmentsOnOpening({
    userId: multiFragmentUser,
    openingId: multiLockedOpenings[0] ?? "",
    sourceEventId: "fragment-spend-2",
    now,
  });
  assert.equal(firstMultiSpend.ok, true);
  assert.equal(firstMultiSpend.applied, true);
  assert.equal(getRewardInventory(multiFragmentUser).openingFragments, 3);
  assert.equal(getRewardInventory(multiFragmentUser).availableFragmentUnlockCredits, 1);

  const secondMultiSpend = await spendOpeningFragmentsOnOpening({
    userId: multiFragmentUser,
    openingId: multiLockedOpenings[1] ?? "",
    sourceEventId: "fragment-spend-3",
    now,
  });
  assert.equal(secondMultiSpend.ok, true);
  assert.equal(secondMultiSpend.applied, true);
  assert.equal(getRewardInventory(multiFragmentUser).openingFragments, 0);
  assert.equal(getRewardInventory(multiFragmentUser).availableFragmentUnlockCredits, 0);

  const exhaustedUser = "reward-inventory-exhausted-user";
  resetLocalAccountState(exhaustedUser);
  const allOpeningIds = seedUnlockedRepertoire(exhaustedUser);
  const noLockedGrant = await grantOpeningFragments({
    userId: exhaustedUser,
    amount: 3,
    sourceEventId: "fragment-grant-no-locked",
    now,
  });
  assert.equal(noLockedGrant.ok, true);
  const noLockedSpend = await spendOpeningFragmentsOnOpening({
    userId: exhaustedUser,
    openingId: allOpeningIds[0] ?? "",
    sourceEventId: "fragment-spend-no-locked",
    now,
  });
  assert.equal(noLockedSpend.applied, false);
  assert.equal(noLockedSpend.code, "no_locked_openings");
  assert.equal(getRewardInventory(exhaustedUser).openingFragments, 3);

  const tokenUser = "reward-inventory-token-user";
  resetLocalAccountState(tokenUser);
  const tokenLockedOpening = getEligibleLockedOpeningsForFragmentUnlock({ userId: tokenUser })[0] ?? "";
  const tokenGrant = await grantChoiceTokens({
    userId: tokenUser,
    amount: 1,
    sourceEventId: "choice-token-grant-1",
    now,
  });
  assert.equal(tokenGrant.ok, true);
  assert.equal(getRewardInventory(tokenUser).choiceTokens, 1);

  const duplicateTokenGrant = await grantChoiceTokens({
    userId: tokenUser,
    amount: 1,
    sourceEventId: "choice-token-grant-1",
    now,
  });
  assert.equal(duplicateTokenGrant.applied, false);
  assert.equal(duplicateTokenGrant.code, "duplicate");
  assert.equal(getRewardInventory(tokenUser).choiceTokens, 1);

  const tokenSpend = await spendChoiceTokenOnOpening({
    userId: tokenUser,
    openingId: tokenLockedOpening,
    sourceEventId: "choice-token-spend-1",
    now,
  });
  assert.equal(tokenSpend.ok, true);
  assert.equal(tokenSpend.applied, true);
  assert.equal(getRewardInventory(tokenUser).choiceTokens, 0);
  assert.equal(loadRepertoireProgress({ userId: tokenUser, now }).unlockedOpeningIds.includes(tokenLockedOpening), true);

  const duplicateTokenSpend = await spendChoiceTokenOnOpening({
    userId: tokenUser,
    openingId: tokenLockedOpening,
    sourceEventId: "choice-token-spend-1",
    now,
  });
  assert.equal(duplicateTokenSpend.applied, false);
  assert.equal(duplicateTokenSpend.code, "duplicate");
  assert.equal(getRewardInventory(tokenUser).choiceTokens, 0);

  const unlockedChoiceUser = "reward-inventory-unlocked-choice-user";
  resetLocalAccountState(unlockedChoiceUser);
  const unlockedChoiceOpening = loadRepertoireProgress({ userId: unlockedChoiceUser, now }).unlockedOpeningIds[0] ?? "";
  await grantChoiceTokens({
    userId: unlockedChoiceUser,
    amount: 1,
    sourceEventId: "choice-token-grant-2",
    now,
  });
  const unlockedChoiceSpend = await spendChoiceTokenOnOpening({
    userId: unlockedChoiceUser,
    openingId: unlockedChoiceOpening,
    sourceEventId: "choice-token-spend-2",
    now,
  });
  assert.equal(unlockedChoiceSpend.applied, false);
  assert.equal(unlockedChoiceSpend.code, "opening_not_locked");
  assert.equal(getRewardInventory(unlockedChoiceUser).choiceTokens, 1);

  const noTokenUser = "reward-inventory-no-token-user";
  resetLocalAccountState(noTokenUser);
  const noTokenOpening = getEligibleLockedOpeningsForFragmentUnlock({ userId: noTokenUser })[0] ?? "";
  const noTokenSpend = await spendChoiceTokenOnOpening({
    userId: noTokenUser,
    openingId: noTokenOpening,
    sourceEventId: "choice-token-spend-3",
    now,
  });
  assert.equal(noTokenSpend.applied, false);
  assert.equal(noTokenSpend.code, "insufficient_choice_tokens");
  assert.equal(getRewardInventory(noTokenUser).choiceTokens, 0);

  process.env.NEXT_PUBLIC_BLUNDR_STORAGE_MODE = "authenticated";
  setOnboardingAuthClientFactoryForTesting(() => ({
    auth: {
      getSession: async () => ({
        data: { session: null },
        error: null,
      }),
      getUser: async () => ({
        data: { user: null },
        error: null,
      }),
    },
  }) as never);

  const authFragmentGrant = await grantOpeningFragments({
    userId: "auth-guard-user",
    amount: 1,
    sourceEventId: "auth-fragment-grant",
    now,
  });
  assert.equal(authFragmentGrant.ok, false);
  if (!authFragmentGrant.ok) {
    assert.equal(authFragmentGrant.code, "auth_required");
  }
  assert.equal(getRewardInventory("auth-guard-user").openingFragments, 0);

  const authTokenGrant = await grantChoiceTokens({
    userId: "auth-guard-user",
    amount: 1,
    sourceEventId: "auth-token-grant",
    now,
  });
  assert.equal(authTokenGrant.ok, false);
  if (!authTokenGrant.ok) {
    assert.equal(authTokenGrant.code, "auth_required");
  }
  assert.equal(getRewardInventory("auth-guard-user").choiceTokens, 0);

  resetLocalAccountState("auth-guard-user");
  process.env.NEXT_PUBLIC_BLUNDR_STORAGE_MODE = "local_demo";
  const seededFragments = await grantOpeningFragments({
    userId: "auth-guard-user",
    amount: 3,
    sourceEventId: "auth-guard-seed",
    now,
    syncRemote: false,
  });
  assert.equal(seededFragments.ok, true);
  process.env.NEXT_PUBLIC_BLUNDR_STORAGE_MODE = "authenticated";
  const authLockedOpening = getEligibleLockedOpeningsForFragmentUnlock({ userId: "auth-guard-user" })[0] ?? "";
  assert.ok(authLockedOpening);
  const authFragmentSpend = await spendOpeningFragmentsOnOpening({
    userId: "auth-guard-user",
    openingId: authLockedOpening,
    sourceEventId: "auth-fragment-spend",
    now,
  });
  assert.equal(authFragmentSpend.ok, false);
  if (!authFragmentSpend.ok) {
    assert.equal(authFragmentSpend.code, "auth_required");
  }
  assert.equal(getRewardInventory("auth-guard-user").openingFragments, 3);

  const authTokenSpend = await spendChoiceTokenOnOpening({
    userId: "auth-guard-user",
    openingId: authLockedOpening,
    sourceEventId: "auth-token-spend",
    now,
  });
  assert.equal(authTokenSpend.ok, false);
  if (!authTokenSpend.ok) {
    assert.equal(authTokenSpend.code, "auth_required");
  }
  assert.equal(getRewardInventory("auth-guard-user").choiceTokens, 0);

  resetOnboardingAuthClientFactoryForTesting();

  console.log("rewardInventoryService.test.ts passed");
})();
