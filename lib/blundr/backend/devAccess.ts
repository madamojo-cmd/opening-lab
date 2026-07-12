// server-only: do not import into client components.

import type { CurrentBlundrUser } from "../accounts/accountTypes";
import { resolveCurrentBlundrUser, type CurrentBlundrUserResolutionResult } from "../accounts/accountSession";
import { isBlundrAllowlistedUser, isBlundrDevToolsEnabled, readBlundrBackendEnv, type BlundrBackendEnv } from "./backendEnv";

export type BlundrDeveloperAccessReasonCode =
  | "resolved"
  | "local_demo"
  | "missing_bearer_token"
  | "missing_supabase_config"
  | "token_validation_failed"
  | "missing_user"
  | "not_allowlisted"
  | "dev_tools_disabled";

export type BlundrDeveloperAccess = {
  allowed: boolean;
  reason: string;
  reasonCode: BlundrDeveloperAccessReasonCode;
  env: BlundrBackendEnv;
  user: CurrentBlundrUser | null;
  diagnostics?: CurrentBlundrUserResolutionResult["diagnostics"];
};

function reasonFromResolutionCode(reasonCode: CurrentBlundrUserResolutionResult["reasonCode"]): string {
  switch (reasonCode) {
    case "missing_bearer_token":
      return "No browser auth token was provided.";
    case "missing_supabase_config":
      return "Supabase auth is not configured.";
    case "token_validation_failed":
      return "The browser auth token could not be validated.";
    case "missing_user":
      return "The browser auth token did not resolve to a user.";
    case "local_demo":
      return "Local demo session active.";
    case "resolved":
    default:
      return "Developer access granted.";
  }
}

export function resolveBlundrDeveloperAccessFromResolution(input: {
  env: BlundrBackendEnv;
  resolution: CurrentBlundrUserResolutionResult;
}): BlundrDeveloperAccess {
  const env = input.env;
  if (!isBlundrDevToolsEnabled(env)) {
    return {
      allowed: false,
      reason: "Developer tools are disabled.",
      reasonCode: "dev_tools_disabled",
      env,
      user: null,
    };
  }

  const { resolution } = input;
  const user = resolution.user;
  if (!user) {
    return {
      allowed: false,
      reason: reasonFromResolutionCode(resolution.reasonCode),
      reasonCode: resolution.reasonCode === "resolved" || resolution.reasonCode === "local_demo" ? "missing_user" : resolution.reasonCode,
      env,
      user: null,
      diagnostics: resolution.diagnostics,
    };
  }

  const allowed = isBlundrAllowlistedUser({ userId: user.userId, email: user.email }, env);
  return {
    allowed,
    reason: allowed ? "Developer access granted." : "Signed-in user is not allowlisted for Blundr developer tools.",
    reasonCode: allowed ? resolution.reasonCode : "not_allowlisted",
    env,
    user,
    diagnostics: resolution.diagnostics,
  };
}

export function resolveBlundrDeveloperAccessFromUser(input: {
  env: BlundrBackendEnv;
  user: CurrentBlundrUser | null;
}): BlundrDeveloperAccess {
  return resolveBlundrDeveloperAccessFromResolution({
    env: input.env,
    resolution: {
      user: input.user,
      reasonCode: input.user ? "resolved" : "missing_user",
      reason: input.user ? "Signed-in browser auth token resolved to a user." : "The browser auth token did not resolve to a user.",
      diagnostics: {
        hasAuthorizationHeader: false,
        bearerTokenPresent: false,
        supabaseUrlPresent: false,
        supabaseAnonKeyPresent: false,
        validationMethod: null,
        validationStatus: input.user ? "resolved" : "missing_user",
        authErrorMessage: null,
      },
    },
  });
}

export async function resolveBlundrDeveloperAccess(request?: Request | null): Promise<BlundrDeveloperAccess> {
  const env = readBlundrBackendEnv();
  if (!isBlundrDevToolsEnabled(env)) {
    return {
      allowed: false,
      reason: "Developer tools are disabled.",
      reasonCode: "dev_tools_disabled",
      env,
      user: null,
    };
  }

  const allowLocalFallback = env.storageModeSetting === "local_demo";
  const resolution = await resolveCurrentBlundrUser({ request: request ?? null, allowLocalFallback });
  return resolveBlundrDeveloperAccessFromResolution({ env, resolution });
}
