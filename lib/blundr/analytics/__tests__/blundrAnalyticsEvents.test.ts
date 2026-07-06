import assert from "node:assert/strict";

import { BLUNDR_ANALYTICS_EVENT_NAMES, BLUNDR_ANALYTICS_EVENTS } from "../blundrAnalyticsEvents";
import { trackBlundrAnalyticsEvent } from "../blundrAnalyticsService";

const requiredEvents = [
  "ONBOARDING_STARTED",
  "ACCOUNT_SAVE_PROGRESS_SELECTED",
  "ELO_SELECTED",
  "STARTER_PACK_SELECTED",
  "DAILY_GOALS_SELECTED",
  "ONBOARDING_COMPLETED",
  "OPENING_RUN_COMPLETED",
  "CONTINUATION_COMPLETED",
  "DAILY_BLUNDR_DECK_COMPLETED",
  "DAILY_TEMPO_RING_CLOSED",
  "DAILY_BATTERY_RING_CLOSED",
  "DAILY_BLUNDR_RING_CLOSED",
  "ALL_DAILY_RINGS_CLOSED",
  "STREAK_INCREMENTED",
  "OPENING_UNLOCK_PROGRESS_EARNED",
  "OPENING_UNLOCKED",
  "REWARD_ROLL_TRIGGERED",
  "REWARD_ROLL_MISSED",
  "REWARD_GRANTED",
  "REWARD_APPLIED",
  "TEMPO_CACHE_OPENED",
  "TEMPO_CACHE_DISMISSED",
  "PITY_REWARD_TRIGGERED",
] as const;

for (const eventName of requiredEvents) {
  assert.equal(BLUNDR_ANALYTICS_EVENTS[eventName], eventName);
  assert.ok(BLUNDR_ANALYTICS_EVENT_NAMES.includes(eventName));
}

assert.doesNotThrow(() => {
  trackBlundrAnalyticsEvent(BLUNDR_ANALYTICS_EVENTS.REWARD_GRANTED, {
    userId: "user-1",
    localDate: "2026-07-06",
    trigger: "all_rings_closed",
  });
});

console.log("blundrAnalyticsEvents.test.ts passed");
