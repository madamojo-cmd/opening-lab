import "server-only";

import type { CurrentBlundrUser } from "../accounts/accountTypes";
import { createBlundrSupabaseAdminClient } from "../backend/supabaseAdminClient";
import { createBlundrSupabaseServerClient } from "../backend/supabaseServerClient";
import {
  buildOnboardingV11ResetProfilePatch,
  mergeClearedOnboardingPlanIntentUserMetadata,
} from "./onboardingV11ResetContract";
import {
  normalizeOnboardingV11ProfileRow,
  type OnboardingV11State,
} from "./onboardingV11";

type AuthAdminClient = {
  auth: {
    admin: {
      getUserById: (userId: string) => Promise<{
        data: { user: { user_metadata?: unknown } | null };
        error: unknown;
      }>;
      updateUserById: (
        userId: string,
        attributes: { user_metadata: Record<string, unknown> },
      ) => Promise<{ error: unknown }>;
    };
  };
};

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function nowIso(): string {
  return new Date().toISOString();
}

export async function resetOnboardingV11State(input: {
  user: CurrentBlundrUser;
  targetUserId?: string | null;
}): Promise<OnboardingV11State> {
  const targetUserId = normalizeText(input.targetUserId) || input.user.userId;
  const crossUser = targetUserId !== input.user.userId;
  if (crossUser && input.user.mode !== "developer_admin") {
    throw new Error("cross_user_reset_denied");
  }

  const now = nowIso();
  const row = {
    user_id: targetUserId,
    ...buildOnboardingV11ResetProfilePatch(targetUserId, now),
  };
  const client = crossUser
    ? createBlundrSupabaseAdminClient()
    : createBlundrSupabaseServerClient({
        accessToken: input.user.accessToken,
        forUserQueries: true,
      });
  if (!client) throw new Error("onboarding_v11_reset_unavailable");

  const { data, error } = await client
    .from("blundr_user_profiles")
    .upsert(row, { onConflict: "user_id" })
    .select("*")
    .single();
  if (error || !data) throw new Error("onboarding_v11_reset_profile_failed");

  const admin = createBlundrSupabaseAdminClient();
  if (!admin) throw new Error("onboarding_v11_reset_metadata_unavailable");
  const authAdmin = admin as unknown as AuthAdminClient;
  const existing = await authAdmin.auth.admin.getUserById(targetUserId);
  if (existing.error || !existing.data.user) {
    throw new Error("onboarding_v11_reset_metadata_unavailable");
  }
  const clearedMetadata = mergeClearedOnboardingPlanIntentUserMetadata(
    existing.data.user.user_metadata,
  );
  const updated = await authAdmin.auth.admin.updateUserById(targetUserId, {
    user_metadata: clearedMetadata,
  });
  if (updated.error) throw new Error("onboarding_v11_reset_metadata_failed");

  const normalizedUser: CurrentBlundrUser = {
    ...input.user,
    userId: targetUserId,
    launchPlanIntent: null,
  };
  if (!crossUser) input.user.launchPlanIntent = null;
  return normalizeOnboardingV11ProfileRow(data, normalizedUser);
}
