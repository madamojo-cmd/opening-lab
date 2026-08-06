import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const card = readFileSync(
  resolve(process.cwd(), "components/daily-rings/DailyRingsCard.tsx"),
  "utf8",
);
const home = readFileSync(
  resolve(
    process.cwd(),
    "components/figma-source/5303-dashboard-daily-review/Figma5303DashboardDailyReview.tsx",
  ),
  "utf8",
);
const syncRoute = readFileSync(
  resolve(process.cwd(), "app/api/blundr/daily-rings/sync/route.ts"),
  "utf8",
);

for (const [label, source] of [
  ["DailyRingsCard", card],
  ["Figma home", home],
] as const) {
  test(`${label} reads authenticated rings from the durable projection`, () => {
    assert.match(source, /authenticatedApiFetch/);
    assert.match(source, /\/api\/blundr\/progress\/summary/);
    assert.match(source, /isNamedLocalDemo/);
    assert.doesNotMatch(source, /reconcileDailyBlundrRingCompletionForToday/);
    assert.doesNotMatch(source, /recordBlundrTaskCompleted/);
    assert.doesNotMatch(source, /completeDailyRingActivity/);
    assert.doesNotMatch(source, /applyRewardCompletion/);
    assert.doesNotMatch(source, /daily-rings\/sync/);
  });
}

test("legacy sync route remains write-disabled", () => {
  assert.match(syncRoute, /export async function POST/);
  assert.match(syncRoute, /client_authored_progress_disabled/);
  assert.match(syncRoute, /status:\s*405/);
  assert.doesNotMatch(syncRoute, /completeDailyRingActivity/);
  assert.doesNotMatch(syncRoute, /recordBlundrTaskCompleted/);
});
