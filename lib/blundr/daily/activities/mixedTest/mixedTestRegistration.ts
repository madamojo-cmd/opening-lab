import type { DailyActivityDefinition } from "@/lib/blundr/contracts";
import { selectMixedTestItems } from "./mixedTestSelector";
import { createMixedTestState, reduceMixedTest } from "./mixedTestReducer";
export const mixedTestActivityDefinition: DailyActivityDefinition = {
  activityId: "daily_mixed_test",
  version: "mixed-test-v1",
  schemaVersion: "mixed-test-schema-v1",
  evidenceVersion: "mixed-test-evidence-v1",
  generatorVersion: "mixed-test-generator-v1",
  validatorVersion: "mixed-test-validator-v1",
  lifecycle: ["eligibility", "build", "validate", "advance", "reveal"],
  build: (input) =>
    selectMixedTestItems(input as Parameters<typeof selectMixedTestItems>[0]),
  validate: (input) => {
    const value = input as {
      items?: Parameters<typeof createMixedTestState>[0];
    };
    return value.items && value.items.length === 5 ? [] : ["invalid_content"];
  },
  advance: (input) => {
    const value = input as {
      state: Parameters<typeof reduceMixedTest>[0];
      event: Parameters<typeof reduceMixedTest>[1];
    };
    return reduceMixedTest(value.state, value.event);
  },
  reveal: (input) => {
    const value = input as {
      state: Parameters<typeof reduceMixedTest>[0];
      now: string;
    };
    return reduceMixedTest(value.state, { type: "reveal", now: value.now });
  },
};
