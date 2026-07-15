import type { ActivityAttemptState } from "@/lib/blundr/daily/core/dailyActivityConformance";
export type MixedTestItem = {
  itemId: string;
  activityId: string;
  openingId: string;
  positionKey: string;
  prompt: string;
};
export type MixedTestState = ActivityAttemptState & {
  items: readonly MixedTestItem[];
  currentIndex: number;
  outcomes: readonly ("correct" | "incorrect" | "reveal")[];
  score: number;
  firstAttemptOutcomes: readonly ("correct" | "incorrect" | "reveal")[];
};
export type MixedTestBuild =
  | { ok: true; items: readonly MixedTestItem[] }
  | {
      ok: false;
      reason:
        | "insufficient_eligible_content"
        | "duplicate_position"
        | "locked_access";
    };
