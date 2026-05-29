import type { VisualPrimitive } from "./visualRecipeTypes";

export const TACTICAL_PRIORITY = {
  escape_grid: 1,
  multi_hub_snap: 2,
  ray_tracker: 3,
  danger_glow: 4,
} as const;

export type VisualPriorityPolicyResult = {
  kept: VisualPrimitive[];
  suppressed: Array<{ id: string; reason: string }>;
  suppressedByPriority: string[];
};

function isTransientTactical(primitive: VisualPrimitive): boolean {
  return primitive.lane === "transient_tactical_effect";
}

function isPersistentTacticalStatus(primitive: VisualPrimitive): boolean {
  return primitive.lane === "persistent_tactical_status";
}

export function applyVisualPriorityPolicy(primitives: VisualPrimitive[]): VisualPriorityPolicyResult {
  const teaching = primitives.filter((primitive) => primitive.lane === "persistent_teaching");
  const transient = primitives.filter(isTransientTactical);
  const status = primitives.filter(isPersistentTacticalStatus);

  const suppressed: Array<{ id: string; reason: string }> = [];
  const suppressedByPriority: string[] = [];

  let keptTransient: VisualPrimitive[] = [];
  if (transient.length) {
    const topPriority = Math.min(...transient.map((primitive) => primitive.priority));
    keptTransient = transient.filter((primitive) => primitive.priority === topPriority);
    for (const primitive of transient) {
      if (primitive.priority !== topPriority) {
        suppressed.push({ id: primitive.id, reason: "suppressed_by_priority" });
        suppressedByPriority.push(primitive.id);
      }
    }
    for (const primitive of status) {
      suppressed.push({ id: primitive.id, reason: "suppressed_by_transient_tactical_priority" });
      suppressedByPriority.push(primitive.id);
    }
    return { kept: [...teaching, ...keptTransient], suppressed, suppressedByPriority };
  }

  return { kept: [...teaching, ...status], suppressed, suppressedByPriority };
}
