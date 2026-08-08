import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const dailyWorkflow = readFileSync(
  resolve(
    process.cwd(),
    ".github/workflows/blundr-daily-v3-disposable-gate.yml",
  ),
  "utf8",
);
const releaseWorkflow = readFileSync(
  resolve(process.cwd(), ".github/workflows/blundr-release-candidate.yml"),
  "utf8",
);

test("fresh disposable mutation workflows share the same static concurrency group", () => {
  assert.match(dailyWorkflow, /group:\s*blundr-disposable-rls-fresh/);
  assert.match(
    releaseWorkflow,
    /supabase-rls-fresh:[\s\S]*?group:\s*blundr-disposable-rls-fresh/,
  );
  assert.match(
    releaseWorkflow,
    /supabase-rls-upgrade:[\s\S]*?group:\s*blundr-disposable-rls-upgrade/,
  );
  assert.doesNotMatch(dailyWorkflow, /github\.ref/);
});

console.log("workflowConcurrency.test.ts passed");
