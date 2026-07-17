/**
 * Narrow rollback switch for the replacement onboarding flow. Production is
 * opt-in; branch/staging deployments enable it explicitly. Keeping this
 * decision isolated lets rollback restore the legacy entry point without
 * deleting any persisted account choices.
 */
export function isOnboardingV11Enabled(): boolean {
  return process.env.NEXT_PUBLIC_BLUNDR_ONBOARDING_V11 === "true";
}
