import type { FeatureFlagName } from "@/lib/blundr/contracts";

export const PRODUCTION_DAILY_REQUIRED_FLAGS = [
  "daily_core_v2",
  "daily_production_store",
  "learning_core_v2",
  "learning_core_v2_read",
  "learning_core_v2_write",
  "opening_access_v2",
] as const satisfies readonly FeatureFlagName[];

type ProductionDailyFlags = Pick<
  Readonly<Record<FeatureFlagName, boolean>>,
  (typeof PRODUCTION_DAILY_REQUIRED_FLAGS)[number]
>;

export function isProductionDailyAvailable(
  flags: ProductionDailyFlags,
): boolean {
  return PRODUCTION_DAILY_REQUIRED_FLAGS.every((flag) => flags[flag]);
}
