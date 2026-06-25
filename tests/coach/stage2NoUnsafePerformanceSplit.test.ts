import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const REPO_ROOT = path.resolve(__dirname, "..", "..");

export function testStage2NoUnsafePerformanceSplit(): void {
  const pageSource = fs.readFileSync(path.join(REPO_ROOT, "app", "page.tsx"), "utf8");

  assert.equal(
    /from\s+["']@\/lib\/blundr\/openings\/runtimeTrainableRepertoires["']/.test(pageSource),
    true,
    "app_page_missing_static_runtime_trainable_import",
  );
  assert.equal(
    /import\(\s*["']@\/lib\/blundr\/openings\/runtimeTrainableRepertoires["']\s*\)/.test(pageSource),
    false,
    "app_page_unsafe_runtime_trainable_dynamic_import",
  );
  assert.equal(
    /import\(\s*["']@\/lib\/blundr\/openings\/adaptiveOpeningIdentity["']\s*\)/.test(pageSource),
    false,
    "app_page_unsafe_adaptive_opening_identity_dynamic_import",
  );
  assert.equal(
    /runtimeOpeningSelection\s*=\s*useMemo\(/.test(pageSource),
    true,
    "app_page_missing_runtime_opening_selection_usememo",
  );
  assert.equal(
    /buildRuntimeTrainingLineSelection\(runtimeOpeningSelection\.selectedOpeningId,\s*\[\],\s*runtimeTrainingSessionId\)/.test(pageSource),
    true,
    "app_page_missing_initial_runtime_training_line_selection",
  );
}

testStage2NoUnsafePerformanceSplit();
console.log("stage2NoUnsafePerformanceSplit ok");
