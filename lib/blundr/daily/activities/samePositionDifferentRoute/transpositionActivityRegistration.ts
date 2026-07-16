import type { DailyActivityDefinition } from "@/lib/blundr/contracts";
import { registerDailyActivity } from "@/lib/blundr/daily/core/dailyActivityRegistry";
import { buildTranspositionActivity } from "./transpositionActivityBuilder";
import { validateTranspositionActivity } from "./transpositionActivityValidator";
import { reduceTransposition } from "./transpositionActivityReducer";
export const transpositionActivityDefinition: DailyActivityDefinition = {
  activityId: "daily_same_position_different_route",
  version: "transposition-v1",
  schemaVersion: "transposition-schema-v1",
  evidenceVersion: "transposition-evidence-v1",
  generatorVersion: "transposition-generator-v1",
  validatorVersion: "transposition-validator-v1",
  lifecycle: ["eligibility", "build", "validate", "advance", "reveal"],
  build: (input) =>
    buildTranspositionActivity(
      input as Parameters<typeof buildTranspositionActivity>[0],
    ),
  validate: (input) => {
    const value = input as {
      startFen?: string;
      solution?: Parameters<typeof validateTranspositionActivity>[1];
    };
    return value.startFen && value.solution
      ? validateTranspositionActivity(value.startFen, value.solution)
      : ["invalid_content"];
  },
  advance: (input) => {
    const value = input as {
      state: Parameters<typeof reduceTransposition>[0];
      event: Parameters<typeof reduceTransposition>[1];
    };
    return reduceTransposition(value.state, value.event);
  },
  reveal: (input) => {
    const value = input as {
      state: Parameters<typeof reduceTransposition>[0];
      now: string;
      solution: Extract<
        Parameters<typeof reduceTransposition>[1],
        { type: "reveal" }
      >["solution"];
    };
    return reduceTransposition(value.state, {
      type: "reveal",
      now: value.now,
      solution: value.solution,
    });
  },
};
export function registerTranspositionActivity(): void {
  registerDailyActivity(transpositionActivityDefinition);
}
