import {
  registerDailyActivity,
  getDailyActivityRegistry,
} from "@/lib/blundr/daily/core/dailyActivityRegistry";
import { candidateChoiceActivityDefinition } from "./candidateChoice/candidateChoiceRegistration";
import { planRecallActivityDefinition } from "./planRecall/planRecallRegistration";
import { transpositionActivityDefinition } from "./samePositionDifferentRoute/transpositionActivityRegistration";
import { continuationChallengeActivityDefinition } from "./continuationChallenge/continuationChallengeRegistration";
import { punishmentActivityDefinition } from "./punishTheMistake/punishmentRegistration";
import { mixedTestActivityDefinition } from "./mixedTest/mixedTestRegistration";
import type { FeatureFlagName } from "@/lib/blundr/contracts";
import { FEATURE_FLAGS } from "@/lib/blundr/contracts";
const definitions = [
  candidateChoiceActivityDefinition,
  planRecallActivityDefinition,
  transpositionActivityDefinition,
  continuationChallengeActivityDefinition,
  punishmentActivityDefinition,
  mixedTestActivityDefinition,
] as const;
const flags: Record<string, FeatureFlagName> = {
  daily_candidate_choice: "daily_candidate_choice",
  daily_plan_recall: "daily_plan_recall",
  daily_same_position_different_route: "daily_same_position_different_route",
  daily_continuation_challenge: "daily_continuation_challenge",
  daily_punish_the_mistake: "daily_punish_the_mistake",
  daily_mixed_test: "daily_mixed_test",
};
export function registerStep3Activities(
  enabled: Readonly<Record<string, boolean>> = {},
): string[] {
  const registered: string[] = [];
  for (const definition of definitions) {
    if (!enabled[flags[definition.activityId]]) continue;
    if (getDailyActivityRegistry().has(definition.activityId)) continue;
    registerDailyActivity(definition);
    registered.push(definition.activityId);
  }
  return registered;
}
export function registerStep3ActivitiesFromFeatureFlags(): string[] {
  return registerStep3Activities(FEATURE_FLAGS);
}
