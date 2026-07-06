import type { DailyRingActivitySource, DailyRingId } from "./dailyRingTypes";

export type DailyRingDefinition = {
  ringId: DailyRingId;
  label: string;
  description: string;
  source: DailyRingActivitySource;
  defaultGoal: number;
};

export const DAILY_RING_POINT_BONUSES = {
  allRingsClosed: 10,
  streak7: 35,
  streak30: 150,
} as const;

export const DAILY_RING_XP_BONUSES = {
  openingRunCompleted: 10,
  continuationCompleted: 20,
  dailyBlundrDeckCompleted: 50,
  allRingsClosed: 100,
  streak7: 250,
  streak30: 1000,
} as const;

export const DAILY_RING_DEFINITIONS: readonly DailyRingDefinition[] = [
  {
    ringId: "daily_tempo",
    label: "Daily Tempo",
    description: "Train your opening rhythm.",
    source: "opening_run_completed",
    defaultGoal: 10,
  },
  {
    ringId: "daily_battery",
    label: "Daily Battery",
    description: "Play the position after the book ends.",
    source: "continuation_completed",
    defaultGoal: 3,
  },
  {
    ringId: "daily_blundr",
    label: "Daily Blundr",
    description: "Review what needs to stick.",
    source: "daily_blundr_deck_completed",
    defaultGoal: 1,
  },
] as const;

export function getDailyRingDefinition(ringId: DailyRingId): DailyRingDefinition {
  return DAILY_RING_DEFINITIONS.find((definition) => definition.ringId === ringId) ?? DAILY_RING_DEFINITIONS[0];
}

export function getDailyRingDefinitionBySource(source: DailyRingActivitySource): DailyRingDefinition {
  return DAILY_RING_DEFINITIONS.find((definition) => definition.source === source) ?? DAILY_RING_DEFINITIONS[0];
}
