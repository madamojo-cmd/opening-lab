import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

export function testFallbackCopyGuard(): void {
  const root = path.resolve(__dirname, "../../../..");
  const appPage = fs.readFileSync(path.join(root, "app/page.tsx"), "utf8");
  const coachCopy = fs.readFileSync(path.join(root, "lib/blundr/liveCoach/liveCoachCopyLibrary.ts"), "utf8");
  assert.equal(appPage.includes("immediate center tension"), false);
  assert.equal(coachCopy.includes("immediate center tension"), false);
}
