import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { validateCopyBundle } from "../../lib/blundr/stage2/validation/validateCopyBundle";
import { validateCrawlBundle } from "../../lib/blundr/stage2/validation/validateCrawlBundle";

const REPO_ROOT = path.resolve(__dirname, "..", "..");
const VALIDATION_DIR = path.join(REPO_ROOT, "lib", "blundr", "stage2", "validation");

const FORBIDDEN_IMPORT_SPECIFIERS = [
  "react",
  "next",
  "app/page",
  "maia",
  "stockfish",
  "coachDecisionEngine",
  "liveCoachCopyLibrary",
  "pedagogicalOpportunityEngine",
  "liveCoachIntentSelector",
  "liveCoachCommentRanker",
  "teachingOrchestrator",
  "visualRecipeCompiler",
  "visualRecipeAdapter",
] as const;

const FORBIDDEN_IO_PATTERNS = [
  /fs\./,
  /readFile\(/,
  /readFileSync\(/,
  /writeFile\(/,
  /writeFileSync\(/,
];

function validationFiles(): string[] {
  return [
    "crawlBundleSchema.ts",
    "validateCrawlBundle.ts",
    "copyBundleSchema.ts",
    "validateCopyBundle.ts",
    "index.ts",
  ].map((name) => path.join(VALIDATION_DIR, name));
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

export function testStage2ValidatorsNoRuntimeIntegration(): void {
  for (const filePath of validationFiles()) {
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

  // Purity sanity check: pure functions over provided objects.
  const crawlInput = {
    version: "0.1",
    source: "stage2-lichess-stepdown",
    openingIds: ["o1"],
    nodes: [{ openingId: "o1", nodeKey: "n0", ply: 0 }],
    candidateMoves: [{ openingId: "o1", nodeKey: "n0", moveUci: "e2e4" }],
  };
  const crawlClone = JSON.parse(JSON.stringify(crawlInput));
  const crawlResult = validateCrawlBundle(crawlInput);
  assert.equal(crawlResult.ok, true);
  assert.deepEqual(crawlInput, crawlClone, "validateCrawlBundle must not mutate input");

  const copyInput = {
    version: "0.1",
    locale: "en-US",
    source: "stage2-copy-content-package",
    entries: [{ entryId: "e1", status: "approved", body: "Play e4." }],
  };
  const copyClone = JSON.parse(JSON.stringify(copyInput));
  const copyResult = validateCopyBundle(copyInput);
  assert.equal(copyResult.ok, true);
  assert.deepEqual(copyInput, copyClone, "validateCopyBundle must not mutate input");
}

testStage2ValidatorsNoRuntimeIntegration();
console.log("stage2ValidatorsNoRuntimeIntegration ok");
