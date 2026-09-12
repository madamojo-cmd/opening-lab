export type BlundrPrivacyPreferences = {
  optionalAnalyticsConsent: boolean;
  analyticsConsentUpdatedAt: string | null;
};

export const BLUNDR_OPTIONAL_ANALYTICS_CONSENT_STORAGE_KEY =
  "blundr_optional_analytics_consent";

export function normalizeOptionalAnalyticsConsent(value: unknown): boolean {
  return value === true || value === "true";
}
