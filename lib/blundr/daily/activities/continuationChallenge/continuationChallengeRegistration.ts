import type { DailyActivityDefinition } from "@/lib/blundr/contracts";
import { registerDailyActivity } from "@/lib/blundr/daily/core/dailyActivityRegistry";
import { buildContinuationChallenge } from "./continuationChallengeBuilder";
import { validateContinuationChallenge } from "./continuationChallengeValidator";
import { reduceContinuation } from "./continuationChallengeReducer";
export const continuationChallengeActivityDefinition: DailyActivityDefinition =
  {
    activityId: "daily_continuation_challenge",
    version: "continuation-challenge-v1",
    schemaVersion: "continuation-challenge-schema-v1",
    evidenceVersion: "continuation-challenge-evidence-v1",
    generatorVersion: "continuation-challenge-generator-v1",
    validatorVersion: "continuation-challenge-validator-v1",
    lifecycle: ["eligibility", "build", "validate", "advance", "reveal"],
    build: (input) =>
      buildContinuationChallenge(
        input as Parameters<typeof buildContinuationChallenge>[0],
      ),
    validate: (input) =>
      validateContinuationChallenge(
        input as Parameters<typeof validateContinuationChallenge>[0],
      ),
    advance: (input) => {
      const value = input as {
        state: Parameters<typeof reduceContinuation>[0];
        event: Parameters<typeof reduceContinuation>[1];
      };
      return reduceContinuation(value.state, value.event);
    },
    reveal: (input) => {
      const value = input as {
        state: Parameters<typeof reduceContinuation>[0];
        now: string;
        solution: Extract<
          Parameters<typeof reduceContinuation>[1],
          { type: "reveal" }
        >["solution"];
      };
      return reduceContinuation(value.state, {
        type: "reveal",
        now: value.now,
        solution: value.solution,
      });
    },
  };
export function registerContinuationChallengeActivity(): void {
  registerDailyActivity(continuationChallengeActivityDefinition);
}
