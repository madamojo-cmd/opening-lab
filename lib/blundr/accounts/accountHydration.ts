import type { UserAccountBootstrap } from "./accountTypes";
import { setLocalAccountCurrentUserId, upsertLocalDailyRetentionProgress, upsertLocalRewardHistory, upsertLocalRewardInventory, upsertLocalStreakRecord, upsertLocalTrainingProfile, upsertLocalUserRepertoire } from "./localAccountStorage";
import { persistRewardHistoryLocally } from "../rewards/rewardHistoryService";
import { getOnboardingAuthSession } from "../onboarding/onboardingAuth";

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

export type AccountBootstrapHydrationResult = {
  ok: boolean;
  shared: boolean;
  userId: string | null;
  message: string;
  error?: string;
};

export async function hydrateSharedAccountBootstrap(): Promise<AccountBootstrapHydrationResult> {
  const session = await getOnboardingAuthSession().catch(() => null);
  if (!session?.accessToken) {
    return {
      ok: true,
      shared: false,
      userId: normalizeText(session?.userId) || null,
      message: "No authenticated session was found.",
    };
  }

  try {
    const response = await fetch("/api/blundr/account/bootstrap", {
      method: "GET",
      headers: {
        authorization: `Bearer ${session.accessToken}`,
      },
      cache: "no-store",
    });
    const payload = (await response.json().catch(() => null)) as { ok?: boolean; data?: UserAccountBootstrap; error?: { message?: string } } | null;
    if (!response.ok || !payload?.ok || !payload.data) {
      return {
        ok: false,
        shared: true,
        userId: normalizeText(session.userId) || null,
        message: payload?.error?.message || "Could not hydrate shared account state.",
        error: payload?.error?.message || "Could not hydrate shared account state.",
      };
    }

    const bootstrap = payload.data;
    setLocalAccountCurrentUserId(bootstrap.user.userId);
    upsertLocalTrainingProfile(bootstrap.profile);
    upsertLocalUserRepertoire(bootstrap.repertoire);
    upsertLocalStreakRecord(bootstrap.streakRecord);
    upsertLocalRewardHistory(bootstrap.rewardHistory);
    upsertLocalRewardInventory(bootstrap.rewardInventory);
    persistRewardHistoryLocally(bootstrap.user.userId, bootstrap.rewardHistory, bootstrap.rewardRolls);
    upsertLocalDailyRetentionProgress(bootstrap.dailyRetentionProgress);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("storage"));
    }

    return {
      ok: true,
      shared: true,
      userId: bootstrap.user.userId,
      message: "Shared account state hydrated.",
    };
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : "Could not hydrate shared account state.";
    return {
      ok: false,
      shared: true,
      userId: normalizeText(session.userId) || null,
      message,
      error: message,
    };
  }
}
