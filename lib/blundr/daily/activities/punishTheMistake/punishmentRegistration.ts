import type { DailyActivityDefinition } from "@/lib/blundr/contracts";
import { registerDailyActivity } from "@/lib/blundr/daily/core/dailyActivityRegistry";
export const punishmentActivityDefinition: DailyActivityDefinition = {
  activityId: "daily_punish_the_mistake",
  version: "punishment-v1",
  schemaVersion: "punishment-schema-v1",
  evidenceVersion: "punishment-evidence-v1",
  generatorVersion: "punishment-generator-v1",
  validatorVersion: "punishment-validator-v1",
  lifecycle: ["eligibility", "build", "validate", "advance", "reveal"],
  build: (input) => input,
  validate: (input) => input,
  advance: (input) => input,
  reveal: (input) => input,
};
export function registerPunishmentActivity(): void {
  registerDailyActivity(punishmentActivityDefinition);
}
