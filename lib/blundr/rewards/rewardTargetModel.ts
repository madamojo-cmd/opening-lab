import type { CurrentBlundrUser } from "../accounts/accountTypes";
import { hasSupabaseCredentials, type BlundrBackendEnv, type BlundrStorageModeSetting } from "../backend/backendEnv";

export type RewardsPersistenceTargetMode = "localOnly" | "authenticatedShared";

export type RewardsPersistenceTarget = {
  storageModeSetting: BlundrStorageModeSetting;
  backendMode: BlundrStorageModeSetting;
  currentUserId: string;
  currentUserEmail: string | null;
  targetMode: RewardsPersistenceTargetMode;
  remoteSyncEnabled: boolean;
  isAuthenticatedShared: boolean;
  isLocalOnly: boolean;
  warning: string;
  confirmation: string;
};

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

export function resolveRewardsPersistenceTarget(input: {
  env: BlundrBackendEnv;
  user?: CurrentBlundrUser | null;
}): RewardsPersistenceTarget {
  const storageModeSetting = input.env.storageModeSetting;
  const currentUserId = normalizeText(input.user?.userId);
  const currentUserEmail = normalizeText(input.user?.email).toLowerCase() || null;
  const remoteSyncEnabled = Boolean(hasSupabaseCredentials(input.env) && Boolean(input.user?.accessToken) && (input.user?.isAuthenticated || input.user?.mode === "developer_admin" || input.user?.mode === "authenticated"));
  const isAuthenticatedShared = storageModeSetting !== "local_demo" && remoteSyncEnabled;
  const targetMode: RewardsPersistenceTargetMode = isAuthenticatedShared ? "authenticatedShared" : "localOnly";

  return {
    storageModeSetting,
    backendMode: storageModeSetting,
    currentUserId,
    currentUserEmail,
    targetMode,
    remoteSyncEnabled,
    isAuthenticatedShared,
    isLocalOnly: targetMode === "localOnly",
    warning: storageModeSetting === "local_demo"
      ? "Local demo mode only affects this browser. Use authenticated mode to test across browsers/devices."
      : isAuthenticatedShared
        ? ""
        : "Authenticated mode is active, but shared persistence is unavailable. Check Supabase auth and preview/staging configuration.",
    confirmation: isAuthenticatedShared
      ? "Rewards apply to this authenticated test account through shared persistence."
      : "Rewards remain local-only until authenticated shared persistence is active.",
  };
}
