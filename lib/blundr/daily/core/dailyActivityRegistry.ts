import type { DailyActivityDefinition } from "@/lib/blundr/contracts";
import type { DailyRegistry } from "./dailyActivityTypes";

const registry = new Map<string, DailyActivityDefinition>();
export function registerDailyActivity(
  definition: DailyActivityDefinition,
): void {
  if (registry.has(definition.activityId))
    throw new Error(`duplicate_daily_activity:${definition.activityId}`);
  registry.set(definition.activityId, definition);
}
export function getDailyActivity(
  activityId: string,
): DailyActivityDefinition | null {
  return registry.get(activityId) ?? null;
}
export function getDailyActivityRegistry(): DailyRegistry {
  return new Map(registry);
}
