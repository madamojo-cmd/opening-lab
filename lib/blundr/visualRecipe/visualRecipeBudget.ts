import type { VisualPrimitive, VisualRecipeBudget } from "./visualRecipeTypes";

export const DEFAULT_VISUAL_RECIPE_BUDGET: VisualRecipeBudget = {
  maxPrimaryPrimitives: 1,
  maxSupportingPrimitives: 2,
  maxLines: 1,
  maxTargets: 1,
  maxGhosts: 1,
  maxTotalPrimitives: 4,
};

export type VisualRecipeBudgetResult = {
  kept: VisualPrimitive[];
  suppressed: Array<{ id: string; reason: string }>;
};

function budgetOrder(primitive: VisualPrimitive): number {
  if (primitive.lane === "persistent_teaching") {
    if (primitive.emphasis === "primary") return 0;
    return 1;
  }
  if (primitive.lane === "transient_tactical_effect") return 2 + primitive.priority;
  return 20 + primitive.priority;
}

export function enforceVisualRecipeBudget(
  primitives: VisualPrimitive[],
  budget: VisualRecipeBudget = DEFAULT_VISUAL_RECIPE_BUDGET,
): VisualRecipeBudgetResult {
  const candidates = [...primitives].sort((a, b) => budgetOrder(a) - budgetOrder(b));
  const kept: VisualPrimitive[] = [];
  const suppressed: Array<{ id: string; reason: string }> = [];
  let primaryCount = 0;
  let supportingCount = 0;
  let lineCount = 0;
  let targetCount = 0;
  let ghostCount = 0;

  for (const primitive of candidates) {
    if (kept.length >= budget.maxTotalPrimitives) {
      suppressed.push({ id: primitive.id, reason: "max_total_primitives" });
      continue;
    }

    const isPrimary = primitive.emphasis === "primary";
    if (isPrimary) {
      if (primaryCount >= budget.maxPrimaryPrimitives) {
        suppressed.push({ id: primitive.id, reason: "max_primary_primitives" });
        continue;
      }
    } else if (supportingCount >= budget.maxSupportingPrimitives) {
      suppressed.push({ id: primitive.id, reason: "max_supporting_primitives" });
      continue;
    }

    if (primitive.type === "pressure_line" && lineCount >= budget.maxLines) {
      suppressed.push({ id: primitive.id, reason: "max_lines" });
      continue;
    }

    if (primitive.type === "target_ring" && targetCount >= budget.maxTargets) {
      suppressed.push({ id: primitive.id, reason: "max_targets" });
      continue;
    }

    if (primitive.type === "ghost_piece" && ghostCount >= budget.maxGhosts) {
      suppressed.push({ id: primitive.id, reason: "max_ghosts" });
      continue;
    }

    kept.push(primitive);
    if (isPrimary) primaryCount += 1;
    else supportingCount += 1;
    if (primitive.type === "pressure_line") lineCount += 1;
    if (primitive.type === "target_ring") targetCount += 1;
    if (primitive.type === "ghost_piece") ghostCount += 1;
  }

  return { kept, suppressed };
}
