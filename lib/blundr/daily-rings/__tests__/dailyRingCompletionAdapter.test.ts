import assert from "node:assert/strict";

import {
  createDailyRingCompletionActivity,
  normalizeDailyRingCompletionSource,
  resolveDailyRingIdForCompletionSource,
} from "../dailyRingCompletionAdapter";

assert.equal(normalizeDailyRingCompletionSource("opening_run_completed"), "opening_run_completed");
assert.equal(normalizeDailyRingCompletionSource("continuation_completed"), "continuation_completed");
assert.equal(normalizeDailyRingCompletionSource("book_end_completed"), "continuation_completed");
assert.equal(normalizeDailyRingCompletionSource("checkmate_game_completed"), "continuation_completed");
assert.equal(normalizeDailyRingCompletionSource("review_card_completed"), "daily_blundr_deck_completed");
assert.equal(resolveDailyRingIdForCompletionSource("opening_run_completed"), "daily_tempo");
assert.equal(resolveDailyRingIdForCompletionSource("continuation_completed"), "daily_battery");
assert.equal(resolveDailyRingIdForCompletionSource("book_end_completed"), "daily_battery");
assert.equal(resolveDailyRingIdForCompletionSource("review_card_completed"), "daily_blundr");

const activity = createDailyRingCompletionActivity({
  userId: "user-1",
  source: "review_card_completed",
  completionId: "review-1",
  createdAt: "2026-07-06T12:00:00.000Z",
});

assert.equal(activity?.source, "daily_blundr_deck_completed");
assert.equal(activity?.completionId, "review-1");
assert.equal(createDailyRingCompletionActivity({
  userId: "user-1",
  source: "not-a-real-source",
  completionId: "x",
}), null);

console.log("dailyRingCompletionAdapter.test.ts passed");
