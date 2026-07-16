import type { DailyActivityDefinition } from "@/lib/blundr/contracts";
import { registerDailyActivity } from "@/lib/blundr/daily/core/dailyActivityRegistry";
import { buildPlanRecall } from "./planQuestionBuilder";
import { validatePlanQuestion } from "./planQuestionValidator";
import { reducePlanRecall } from "./planRecallReducer";
export const planRecallActivityDefinition: DailyActivityDefinition = {
  activityId: "daily_plan_recall",
  version: "plan-recall-v1",
  schemaVersion: "plan-recall-schema-v1",
  evidenceVersion: "plan-recall-evidence-v1",
  generatorVersion: "plan-recall-generator-v1",
  validatorVersion: "plan-recall-validator-v1",
  lifecycle: ["eligibility", "build", "validate", "advance", "reveal"],
  build: (input) =>
    buildPlanRecall(input as Parameters<typeof buildPlanRecall>[0]),
  validate: (input) =>
    validatePlanQuestion(input as Parameters<typeof validatePlanQuestion>[0]),
  advance: (input) => {
    const value = input as {
      state: Parameters<typeof reducePlanRecall>[0];
      event: Parameters<typeof reducePlanRecall>[1];
    };
    return reducePlanRecall(value.state, value.event);
  },
  reveal: (input) => {
    const value = input as {
      state: Parameters<typeof reducePlanRecall>[0];
      now: string;
      solution: Extract<
        Parameters<typeof reducePlanRecall>[1],
        { type: "reveal" }
      >["solution"];
    };
    return reducePlanRecall(value.state, {
      type: "reveal",
      now: value.now,
      solution: value.solution,
    });
  },
};
export function registerPlanRecallActivity(): void {
  registerDailyActivity(planRecallActivityDefinition);
}
