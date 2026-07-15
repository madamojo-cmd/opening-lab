import "server-only";
import { FEATURE_FLAGS, type FeatureFlagName } from "./index";

const ENV_PREFIX = "BLUNDR_FEATURE_";

function envName(flag: FeatureFlagName): string {
  return `${ENV_PREFIX}${flag.toUpperCase()}`;
}

function isEnabled(value: string | undefined): boolean {
  return ["1", "true", "yes", "on"].includes((value ?? "").toLowerCase());
}

/**
 * Server-only feature resolution. An absent environment value is always off;
 * the shared registry remains the deterministic default used by tests/builds.
 */
export function getServerFeatureFlags(): Readonly<
  Record<FeatureFlagName, boolean>
> {
  return Object.fromEntries(
    (Object.keys(FEATURE_FLAGS) as FeatureFlagName[]).map((flag) => [
      flag,
      isEnabled(process.env[envName(flag)]),
    ]),
  ) as Record<FeatureFlagName, boolean>;
}

export function isServerFeatureEnabled(flag: FeatureFlagName): boolean {
  return getServerFeatureFlags()[flag];
}
