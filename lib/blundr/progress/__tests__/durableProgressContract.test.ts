import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const route = readFileSync(
  resolve(process.cwd(), "app/api/blundr/progress/summary/route.ts"),
  "utf8",
);
const service = readFileSync(
  resolve(
    process.cwd(),
    "lib/blundr/progress/durableProgressSummary.server.ts",
  ),
  "utf8",
);
const dashboard = readFileSync(
  resolve(process.cwd(), "components/progress/ProgressDashboard.tsx"),
  "utf8",
);

test("progress summary is authenticated and fail-closed", () => {
  assert.match(route, /allowLocalFallback:\s*false/);
  assert.match(route, /loadDurableProgressSummary/);
  assert.match(route, /progress_persistence_unavailable/);
  assert.doesNotMatch(route, /loadBlundrProgressSummary/);
});

test("durable progress derives every primary signal from server-owned tables", () => {
  for (const table of [
    "blundr_completion_grants",
    "blundr_daily_retention_progress",
    "blundr_learning_events",
    "blundr_minigame_instances",
    "blundr_streak_records",
    "blundr_user_repertoires",
    "blundr_weakness_projection",
  ]) {
    assert.match(service, new RegExp(`from\\(\\"${table}\\"\\)`));
  }
  assert.match(service, /first_attempt/);
  assert.match(service, /move_correct/);
  assert.match(service, /move_incorrect/);
});

test("the dashboard never falls back to local progress after an API failure", () => {
  assert.match(dashboard, /authenticatedApiFetch/);
  assert.match(dashboard, /durable storage/);
  assert.doesNotMatch(dashboard, /loadBlundrProgressSummary/);
  assert.doesNotMatch(dashboard, /reconcileDailyBlundrRingCompletionForToday/);
});
