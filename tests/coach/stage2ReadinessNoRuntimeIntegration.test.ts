import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { evaluateStage2Readiness } from "../../lib/blundr/stage2/readiness/evaluateStage2Readiness";

const REPO_ROOT = path.resolve(__dirname, "..", "..");
const READINESS_DIR = path.join(REPO_ROOT, "lib", "blundr", "stage2", "readiness");

const FORBIDDEN_IMPORT_SPECIFIERS = [
  "react",
  "next",
  "app/page",
  "maia",
  "stockfish",
  "provider",
  "coachDecisionEngine",
  "liveCoachCopyLibrary",
  "pedagogicalOpportunityEngine",
  "liveCoachIntentSelector",
  "liveCoachCommentRanker",
  "teachingOrchestrator",
  "visualRecipeCompiler",
  "visualRecipeAdapter",
  "crawl",
  "copy",
] as const;

const FORBIDDEN_IO_PATTERNS = [
  /fs\./,
  /readFile\(/,
  /readFileSync\(/,
  /writeFile\(/,
  /writeFileSync\(/,
] as const;

function readinessFiles(): string[] {
  return [
    "stage2ReadinessTypes.ts",
    "evaluateStage2Readiness.ts",
    "index.ts",
  ].map((name) => path.join(READINESS_DIR, name));
}

function importSpecifiers(content: string): string[] {
  const out: string[] = [];
  const re = /\bfrom\s+["']([^"']+)["']/g;
  let match: RegExpExecArray | null = re.exec(content);
  while (match) {
    out.push(match[1]);
    match = re.exec(content);
  }
  return out;
}

export function testStage2ReadinessNoRuntimeIntegration(): void {
  for (const filePath of readinessFiles()) {
    const content = fs.readFileSync(filePath, "utf8");
    const specs = importSpecifiers(content).map((s) => s.toLowerCase());

    for (const forbidden of FORBIDDEN_IMPORT_SPECIFIERS) {
      const hit = specs.some((spec) => spec.includes(forbidden.toLowerCase()));
      assert.equal(hit, false, `forbidden_runtime_import_in_${path.basename(filePath)}:${forbidden}`);
    }

    for (const pattern of FORBIDDEN_IO_PATTERNS) {
      assert.equal(pattern.test(content), false, `forbidden_filesystem_usage_in_${path.basename(filePath)}:${String(pattern)}`);
    }
  }

  // Purity: evaluator reads only provided input and does not mutate it.
  const input = {
    stage2Requested: true,
    crawlBundleValidation: { ok: true, errors: [], warnings: [] },
    copyBundleValidation: { ok: true, errors: [], warnings: [] },
    ownershipGuardrailsPassed: true,
    boardTruthBoundaryPassed: true,
    runtimeIntegrationApproved: true,
  };
  const clone = JSON.parse(JSON.stringify(input));
  const status = evaluateStage2Readiness(input);

  assert.deepEqual(input, clone, "evaluateStage2Readiness must not mutate input");
  assert.equal(status.stage2Enabled, false, "stage2 stays disabled by default in Phase B.3");
  assert.equal(status.summary.readyForRuntimeIntegration, true);

  const autoEnableCheck = evaluateStage2Readiness({ stage2Requested: true });
  assert.equal(autoEnableCheck.stage2Enabled, false);
  assert.equal(autoEnableCheck.summary.readyForRuntimeIntegration, false);
}

testStage2ReadinessNoRuntimeIntegration();
console.log("stage2ReadinessNoRuntimeIntegration ok");
