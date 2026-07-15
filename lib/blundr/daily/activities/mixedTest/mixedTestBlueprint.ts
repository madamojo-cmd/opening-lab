import type { MixedTestItem } from "./mixedTestTypes";
export const MIXED_TEST_BLUEPRINT = [
  "daily_recall",
  "daily_recall",
  "daily_plan_recall",
  "daily_candidate_choice",
  "daily_continuation_challenge",
] as const;
export function buildMixedTestItems(
  items: readonly MixedTestItem[],
): MixedTestItem[] | null {
  const selected: MixedTestItem[] = [];
  const used = new Set<string>();
  for (const activityId of MIXED_TEST_BLUEPRINT) {
    const item = items.find(
      (candidate) =>
        candidate.activityId === activityId && !used.has(candidate.positionKey),
    );
    if (!item) return null;
    selected.push(item);
    used.add(item.positionKey);
  }
  return selected;
}
