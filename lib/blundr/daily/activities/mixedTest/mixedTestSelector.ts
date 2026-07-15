import { buildMixedTestItems } from "./mixedTestBlueprint";
import type { MixedTestBuild, MixedTestItem } from "./mixedTestTypes";
export function selectMixedTestItems(
  items: readonly MixedTestItem[],
): MixedTestBuild {
  const selected = buildMixedTestItems(items);
  return selected
    ? { ok: true, items: selected }
    : { ok: false, reason: "insufficient_eligible_content" };
}
