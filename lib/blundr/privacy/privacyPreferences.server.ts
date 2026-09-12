import "server-only";

import { createBlundrSupabaseAdminClient } from "@/lib/blundr/backend/supabaseAdminClient";
import {
  normalizeOptionalAnalyticsConsent,
  type BlundrPrivacyPreferences,
} from "./privacyPreferences";

type PrivacyPreferenceRow = {
  optional_analytics_consent: boolean | null;
  analytics_consent_updated_at: string | null;
};

function rowToPreferences(
  row: PrivacyPreferenceRow | null | undefined,
): BlundrPrivacyPreferences {
  return {
    optionalAnalyticsConsent: row?.optional_analytics_consent === true,
    analyticsConsentUpdatedAt: row?.analytics_consent_updated_at ?? null,
  };
}

export async function readPrivacyPreferences(input: {
  userId: string;
}): Promise<BlundrPrivacyPreferences> {
  const admin = createBlundrSupabaseAdminClient();
  if (!admin) throw new Error("privacy_preferences_unavailable");
  const result = await admin
    .from("blundr_user_privacy_preferences")
    .select("optional_analytics_consent,analytics_consent_updated_at")
    .eq("user_id", input.userId)
    .maybeSingle();
  if (result.error) throw new Error("privacy_preferences_lookup_failed");
  return rowToPreferences(result.data as PrivacyPreferenceRow | null);
}

export async function updatePrivacyPreferences(input: {
  userId: string;
  optionalAnalyticsConsent: unknown;
}): Promise<BlundrPrivacyPreferences> {
  const admin = createBlundrSupabaseAdminClient();
  if (!admin) throw new Error("privacy_preferences_unavailable");
  const now = new Date().toISOString();
  const result = await admin
    .from("blundr_user_privacy_preferences")
    .upsert(
      {
        user_id: input.userId,
        optional_analytics_consent: normalizeOptionalAnalyticsConsent(
          input.optionalAnalyticsConsent,
        ),
        analytics_consent_updated_at: now,
        updated_at: now,
      },
      { onConflict: "user_id" },
    )
    .select("optional_analytics_consent,analytics_consent_updated_at")
    .maybeSingle();
  if (result.error || !result.data) {
    throw new Error("privacy_preferences_update_failed");
  }
  return rowToPreferences(result.data as PrivacyPreferenceRow);
}
