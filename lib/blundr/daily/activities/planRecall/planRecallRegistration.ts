import type { DailyActivityDefinition } from "@/lib/blundr/contracts";
import { registerDailyActivity } from "@/lib/blundr/daily/core/dailyActivityRegistry";
export const planRecallActivityDefinition: DailyActivityDefinition = {
  activityId: "daily_plan_recall",
  version: "plan-recall-v1",
  schemaVersion: "plan-recall-schema-v1",
  evidenceVersion: "plan-recall-evidence-v1",
  generatorVersion: "plan-recall-generator-v1",
  validatorVersion: "plan-recall-validator-v1",
  lifecycle: ["eligibility", "build", "validate", "advance", "reveal"],
  build: (input) => input,
  validate: (input) => input,
  advance: (input) => input,
  reveal: (input) => input,
};
export function registerPlanRecallActivity(): void {
  registerDailyActivity(planRecallActivityDefinition);
}
