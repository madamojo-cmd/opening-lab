import type { DailyActivityDefinition } from "@/lib/blundr/contracts";
export const mixedTestActivityDefinition: DailyActivityDefinition = {
  activityId: "daily_mixed_test",
  version: "mixed-test-v1",
  schemaVersion: "mixed-test-schema-v1",
  evidenceVersion: "mixed-test-evidence-v1",
  generatorVersion: "mixed-test-generator-v1",
  validatorVersion: "mixed-test-validator-v1",
  lifecycle: ["eligibility", "build", "validate", "advance", "reveal"],
  build: (input) => input,
  validate: (input) => input,
  advance: (input) => input,
  reveal: (input) => input,
};
