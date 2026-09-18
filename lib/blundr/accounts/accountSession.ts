// server-only: do not import into client components.

import { createBlundrSupabaseServerClient } from "../backend/supabaseServerClient";
import {
  isBlundrAllowlistedUser,
  readBlundrBackendEnv,
} from "../backend/backendEnv";
import { resolveBlundrAccountMode } from "../backend/backendMode";
import { createLocalDemoUser } from "./accountDefaults";
import {
  getLocalAccountCurrentUserId,
  setLocalAccountCurrentUserId,
} from "./localAccountStorage";
import type { CurrentBlundrUser } from "./accountTypes";

export type CurrentBlundrUserResolutionInput = {
  request?: Request | null;
  userOverride?: Partial<CurrentBlundrUser> | null;
  allowLocalFallback?: boolean;
};

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function parseBearerToken(request?: Request | null): string | null {
  const header = normalizeText(request?.headers.get("authorization"));
  if (!header.toLowerCase().startsWith("bearer ")) return null;
  return header.slice(7).trim() || null;
}

export function getCurrentBlundrUserIdFallback(): string {
  return setLocalAccountCurrentUserId(getLocalAccountCurrentUserId());
}

export async function getCurrentBlundrUser(
  input: CurrentBlundrUserResolutionInput = {},
): Promise<CurrentBlundrUser | null> {
  if (input.userOverride?.userId) {
    const userId = normalizeText(input.userOverride.userId);
    if (!userId) return null;
    return {
      userId,
      email: input.userOverride.email ?? null,
      mode: input.userOverride.mode ?? "local_demo",
      isAuthenticated: Boolean(input.userOverride.isAuthenticated),
      isAdmin: Boolean(input.userOverride.isAdmin),
      accessToken: input.userOverride.accessToken ?? null,
      provider: input.userOverride.provider ?? null,
      age13Confirmed: Boolean(input.userOverride.age13Confirmed),
      launchPlanIntent: input.userOverride.launchPlanIntent ?? null,
    };
  }

  const env = readBlundrBackendEnv();
  const accessToken = parseBearerToken(input.request);
  // A supplied bearer credential is authoritative. Validate it before
  // considering local-demo fallback so authenticated writes cannot silently
  // land in ephemeral server memory.
  if (accessToken) {
    const client = createBlundrSupabaseServerClient({ accessToken });
    if (!client) return null;
    try {
      const { data, error } = await client.auth.getUser(accessToken);
      if (error || !data?.user) return null;
      const user = data.user;
      const isAdmin = isBlundrAllowlistedUser(
        { userId: user.id, email: user.email },
        env,
      );
      return {
        userId: user.id,
        email: user.email ?? null,
        mode:
          isAdmin && env.devToolsEnabled ? "developer_admin" : "authenticated",
        isAuthenticated: true,
        isAdmin,
        accessToken,
        provider: user.app_metadata?.provider ?? null,
        age13Confirmed:
          user.user_metadata?.age_16_terms_confirmed === true ||
          user.user_metadata?.age_16_confirmed === true ||
          user.user_metadata?.age_13_confirmed === true,
        launchPlanIntent:
          user.user_metadata?.blundr_launch_plan_intent === "free" ||
          user.user_metadata?.blundr_launch_plan_intent === "pro_monthly" ||
          user.user_metadata?.blundr_launch_plan_intent === "pro_annual"
            ? user.user_metadata.blundr_launch_plan_intent
            : null,
      };
    } catch {
      return null;
    }
  }

  const mode = resolveBlundrAccountMode({
    env,
    allowLocalFallback: input.allowLocalFallback ?? true,
  });
  if (mode === "local_demo") {
    const userId = getCurrentBlundrUserIdFallback();
    return {
      ...createLocalDemoUser(),
      userId,
    };
  }

  return null;
}

export function isCurrentBlundrUserLocalDemo(
  user: CurrentBlundrUser | null | undefined,
): boolean {
  return Boolean(user && user.mode === "local_demo");
}
