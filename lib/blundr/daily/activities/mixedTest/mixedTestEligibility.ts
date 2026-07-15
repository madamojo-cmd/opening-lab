import type { MixedTestItem } from "./mixedTestTypes";
export function isMixedTestEligible(input: {
  items: readonly MixedTestItem[];
  lastRunAt: string | null;
  now?: number;
}): boolean {
  if (input.items.length < 5) return false;
  if (!input.lastRunAt) return true;
  return (
    (input.now ?? Date.now()) - Date.parse(input.lastRunAt) >= 3 * 86_400_000
  );
}
