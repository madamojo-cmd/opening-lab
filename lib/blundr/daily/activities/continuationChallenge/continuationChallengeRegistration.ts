import type { DailyActivityDefinition } from "@/lib/blundr/contracts";
import { registerDailyActivity } from "@/lib/blundr/daily/core/dailyActivityRegistry";
export const continuationChallengeActivityDefinition: DailyActivityDefinition =
  {
    activityId: "daily_continuation_challenge",
    version: "continuation-challenge-v1",
    schemaVersion: "continuation-challenge-schema-v1",
    evidenceVersion: "continuation-challenge-evidence-v1",
    generatorVersion: "continuation-challenge-generator-v1",
    validatorVersion: "continuation-challenge-validator-v1",
    lifecycle: ["eligibility", "build", "validate", "advance", "reveal"],
    build: (input) => input,
    validate: (input) => input,
    advance: (input) => input,
    reveal: (input) => input,
  };
export function registerContinuationChallengeActivity(): void {
  registerDailyActivity(continuationChallengeActivityDefinition);
}
