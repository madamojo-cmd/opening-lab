import type { BlundrAccountMode } from "../accounts/accountTypes";
import type { BackendUserIdentity } from "./backendTypes";
import { hasSupabaseCredentials, isBlundrAllowlistedUser, readBlundrBackendEnv, type BlundrBackendEnv, type BlundrStorageModeSetting } from "./backendEnv";

export type BlundrRuntimeModeSelectionInput = {
  env?: BlundrBackendEnv;
  user?: Pick<BackendUserIdentity, "userId" | "email" | "isAuthenticated" | "isAdmin"> | null;
  allowLocalFallback?: boolean;
};

function hasUserIdentity(user: BlundrRuntimeModeSelectionInput["user"]): boolean {
  return Boolean(user && String(user.userId ?? "").trim());
}

export function resolveBlundrAccountMode(input: BlundrRuntimeModeSelectionInput = {}): BlundrAccountMode {
  const env = input.env ?? readBlundrBackendEnv();
  const allowLocalFallback = input.allowLocalFallback ?? true;
  const storageMode = env.storageModeSetting;
  const user = input.user ?? null;

  if (storageMode === "local_demo") return "local_demo";
  if (storageMode === "developer_admin") {
    if (hasUserIdentity(user) && Boolean(user?.isAdmin) && env.devToolsEnabled) return "developer_admin";
    return allowLocalFallback ? "local_demo" : "developer_admin";
  }
  if (storageMode === "authenticated") {
    if (hasUserIdentity(user) && Boolean(user?.isAuthenticated)) return "authenticated";
    return allowLocalFallback ? "local_demo" : "authenticated";
  }
  if (!hasSupabaseCredentials(env)) return "local_demo";
  if (hasUserIdentity(user) && Boolean(user?.isAdmin) && env.devToolsEnabled && isBlundrAllowlistedUser(user, env)) return "developer_admin";
  if (hasUserIdentity(user) && Boolean(user?.isAuthenticated)) return "authenticated";
  return allowLocalFallback ? "local_demo" : "authenticated";
}

export function getRuntimeStorageModeSetting(env: BlundrBackendEnv = readBlundrBackendEnv()): BlundrStorageModeSetting {
  return env.storageModeSetting;
}

export function isBlundrDeveloperAdmin(input: BlundrRuntimeModeSelectionInput & { env?: BlundrBackendEnv } = {}): boolean {
  const env = input.env ?? readBlundrBackendEnv();
  const user = input.user ?? null;
  return Boolean(env.devToolsEnabled && hasUserIdentity(user) && user?.isAdmin && isBlundrAllowlistedUser(user, env));
}

export function shouldPreferSupabasePersistence(input: BlundrRuntimeModeSelectionInput = {}): boolean {
  const env = input.env ?? readBlundrBackendEnv();
  const mode = resolveBlundrAccountMode(input);
  return hasSupabaseCredentials(env) && (mode === "authenticated" || mode === "developer_admin");
}

