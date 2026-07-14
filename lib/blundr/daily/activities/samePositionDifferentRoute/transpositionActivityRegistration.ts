import type { DailyActivityDefinition } from "@/lib/blundr/contracts";
import { registerDailyActivity } from "@/lib/blundr/daily/core/dailyActivityRegistry";
export const transpositionActivityDefinition: DailyActivityDefinition = {
  activityId: "daily_same_position_different_route",
  version: "transposition-v1",
  schemaVersion: "transposition-schema-v1",
  evidenceVersion: "transposition-evidence-v1",
  generatorVersion: "transposition-generator-v1",
  validatorVersion: "transposition-validator-v1",
  lifecycle: ["eligibility", "build", "validate", "advance", "reveal"],
  build: (input) => input,
  validate: (input) => input,
  advance: (input) => input,
  reveal: (input) => input,
};
export function registerTranspositionActivity(): void {
  registerDailyActivity(transpositionActivityDefinition);
}
