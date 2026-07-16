import type { DailyActivityDefinition } from "@/lib/blundr/contracts";
import { registerDailyActivity } from "@/lib/blundr/daily/core/dailyActivityRegistry";
import { buildCandidateSet } from "./candidateSetBuilder";
import { validateCandidateSet } from "./candidateSetValidator";
import { reduceCandidateChoice } from "./candidateChoiceReducer";
export const candidateChoiceActivityDefinition: DailyActivityDefinition = {
  activityId: "daily_candidate_choice",
  version: "candidate-choice-v1",
  schemaVersion: "candidate-choice-schema-v1",
  evidenceVersion: "candidate-choice-evidence-v1",
  generatorVersion: "candidate-choice-generator-v1",
  validatorVersion: "candidate-choice-validator-v1",
  lifecycle: ["eligibility", "build", "validate", "advance", "reveal"],
  build: (input) =>
    buildCandidateSet(input as Parameters<typeof buildCandidateSet>[0]),
  validate: (input) => {
    const value = input as {
      positionFen?: string;
      solution?: Parameters<typeof validateCandidateSet>[1];
    };
    return value.positionFen && value.solution
      ? validateCandidateSet(value.positionFen, value.solution)
      : ["invalid_content"];
  },
  advance: (input) => {
    const value = input as {
      state: Parameters<typeof reduceCandidateChoice>[0];
      event: Parameters<typeof reduceCandidateChoice>[1];
    };
    return reduceCandidateChoice(value.state, value.event);
  },
  reveal: (input) => {
    const value = input as {
      state: Parameters<typeof reduceCandidateChoice>[0];
      now: string;
      solution: Parameters<typeof reduceCandidateChoice>[1] extends infer T
        ? T extends { solution: infer S }
          ? S
          : never
        : never;
    };
    return reduceCandidateChoice(value.state, {
      type: "reveal",
      now: value.now,
      solution: value.solution,
    });
  },
};
export function registerCandidateChoiceActivity(): void {
  registerDailyActivity(candidateChoiceActivityDefinition);
}
