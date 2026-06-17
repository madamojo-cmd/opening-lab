import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const REPO_ROOT = path.resolve(__dirname, "..", "..");

export function testStage2AppPageClientBoundary(): void {
  const pageSource = fs.readFileSync(path.join(REPO_ROOT, "app/page.tsx"), "utf8");
  const openingAvailabilitySource = fs.readFileSync(path.join(REPO_ROOT, "lib/blundr/openings/openingAvailability.ts"), "utf8");
  const stage2CoachingIndexSource = fs.readFileSync(path.join(REPO_ROOT, "lib/blundr/stage2Coaching/index.ts"), "utf8");

  assert.equal(pageSource.includes("node:fs"), false);
  assert.equal(pageSource.includes("stage2ApprovedContentInventory"), false);
  assert.equal(pageSource.includes("openingAvailability"), true);

  assert.equal(openingAvailabilitySource.includes("stage2ApprovedContentInventory.generated"), true);
  assert.equal(openingAvailabilitySource.includes("stage2ApprovedContentInventory"), true);
  assert.equal(openingAvailabilitySource.includes("node:fs"), false);

  assert.equal(stage2CoachingIndexSource.includes("stage2ApprovedContentInventory.generated"), true);
  assert.equal(stage2CoachingIndexSource.includes("stage2ApprovedContentInventory.ts"), false);
}

testStage2AppPageClientBoundary();
console.log("stage2AppPageClientBoundary ok");
