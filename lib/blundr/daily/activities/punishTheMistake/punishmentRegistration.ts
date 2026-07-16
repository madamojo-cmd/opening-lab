import type { DailyActivityDefinition } from "@/lib/blundr/contracts";
import { registerDailyActivity } from "@/lib/blundr/daily/core/dailyActivityRegistry";
import { buildPunishmentActivity } from "./punishmentBuilder";
import { validateRefutationSequence } from "./refutationValidator";
import { reducePunishment } from "./punishmentReducer";
export const punishmentActivityDefinition: DailyActivityDefinition = {
  activityId: "daily_punish_the_mistake",
  version: "punishment-v1",
  schemaVersion: "punishment-schema-v1",
  evidenceVersion: "punishment-evidence-v1",
  generatorVersion: "punishment-generator-v1",
  validatorVersion: "punishment-validator-v1",
  lifecycle: ["eligibility", "build", "validate", "advance", "reveal"],
  build: (input) =>
    buildPunishmentActivity(
      input as Parameters<typeof buildPunishmentActivity>[0],
    ),
  validate: (input) => {
    const value = input as { fen?: string; sequence?: readonly string[] };
    return value.fen && value.sequence
      ? validateRefutationSequence(value.fen, value.sequence)
      : ["invalid_content"];
  },
  advance: (input) => {
    const value = input as {
      state: Parameters<typeof reducePunishment>[0];
      event: Parameters<typeof reducePunishment>[1];
    };
    return reducePunishment(value.state, value.event);
  },
  reveal: (input) => {
    const value = input as {
      state: Parameters<typeof reducePunishment>[0];
      now: string;
      solution: Extract<
        Parameters<typeof reducePunishment>[1],
        { type: "reveal" }
      >["solution"];
    };
    return reducePunishment(value.state, {
      type: "reveal",
      now: value.now,
      solution: value.solution,
    });
  },
};
export function registerPunishmentActivity(): void {
  registerDailyActivity(punishmentActivityDefinition);
}
