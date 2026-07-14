import type { DailyActivityDefinition } from "@/lib/blundr/contracts";
import { registerDailyActivity } from "@/lib/blundr/daily/core/dailyActivityRegistry";
export const candidateChoiceActivityDefinition: DailyActivityDefinition = {
  activityId: "daily_candidate_choice",
  version: "candidate-choice-v1",
  schemaVersion: "candidate-choice-schema-v1",
  evidenceVersion: "candidate-choice-evidence-v1",
  generatorVersion: "candidate-choice-generator-v1",
  validatorVersion: "candidate-choice-validator-v1",
  lifecycle: ["eligibility", "build", "validate", "advance", "reveal"],
  build: (input) => input,
  validate: (input) => input,
  advance: (input) => input,
  reveal: (input) => input,
};
export function registerCandidateChoiceActivity(): void {
  registerDailyActivity(candidateChoiceActivityDefinition);
}
