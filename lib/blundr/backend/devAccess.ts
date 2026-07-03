// server-only: do not import into client components.

import type { CurrentBlundrUser } from "../accounts/accountTypes";
import { getCurrentBlundrUser } from "../accounts/accountSession";
import { isBlundrAllowlistedUser, isBlundrDevToolsEnabled, readBlundrBackendEnv, type BlundrBackendEnv } from "./backendEnv";

export type BlundrDeveloperAccess = {
  allowed: boolean;
  reason: string;
  env: BlundrBackendEnv;
  user: CurrentBlundrUser | null;
};

export async function resolveBlundrDeveloperAccess(request?: Request | null): Promise<BlundrDeveloperAccess> {
  const env = readBlundrBackendEnv();
  if (!isBlundrDevToolsEnabled(env)) {
    return {
      allowed: false,
      reason: "Developer tools are disabled.",
      env,
      user: null,
    };
  }

  const user = await getCurrentBlundrUser({ request: request ?? null, allowLocalFallback: true });
  if (!user) {
    return {
      allowed: false,
      reason: "No active user session was found.",
      env,
      user: null,
    };
  }

  const allowed = isBlundrAllowlistedUser({ userId: user.userId, email: user.email }, env);
  return {
    allowed,
    reason: allowed ? "Developer access granted." : "User is not allowlisted for developer tools.",
    env,
    user,
  };
}
