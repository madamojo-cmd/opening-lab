import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const REPO_ROOT = path.resolve(__dirname, "..", "..");

export function testStage2AppPageNoHeavyClientImports(): void {
  const pageSource = fs.readFileSync(path.join(REPO_ROOT, "app/page.tsx"), "utf8");

  assert.equal(pageSource.includes("from \"@/lib/blundr/openings/runtimeTrainableRepertoires\""), false);
  assert.equal(pageSource.includes("from \"@/lib/blundr/openings/stage2RuntimeTrainableRepertoires.generated\""), false);
  assert.equal(pageSource.includes("from \"@/components/coach/CoachCard\""), false);
  assert.equal(pageSource.includes("from \"@/components/debug/BlundrDiagnosticsPanel\""), false);
}

testStage2AppPageNoHeavyClientImports();
console.log("stage2AppPageNoHeavyClientImports ok");
