import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const REPO_ROOT = path.resolve(__dirname, "..", "..");

const FORBIDDEN_IMPORTS = [
  "lib/blundr/coach/coachDecisionEngine",
  "lib/blundr/liveCoach/liveCoachCopyLibrary",
  "lib/blundr/liveCoach/pedagogicalOpportunityEngine",
  "lib/blundr/liveCoach/liveCoachIntentSelector",
  "lib/blundr/liveCoach/liveCoachCommentRanker",
  "lib/blundr/coachBrain/coachExplanationPipeline",
  "lib/blundr/teaching/teachingOrchestrator",
  "lib/blundr/visualRecipe/visualRecipeCompiler",
  "lib/blundr/visualRecipe/visualRecipeAdapter",
] as const;

function importedSpecifiers(content: string): string[] {
  const out: string[] = [];
  const re = /\bfrom\s+["']([^"']+)["']/g;
  let match: RegExpExecArray | null = re.exec(content);
  while (match) {
    out.push(match[1]);
    match = re.exec(content);
  }
  return out;
}

function collectGuardedFiles(): string[] {
  const files: string[] = [];

  const testsDir = path.join(REPO_ROOT, "tests", "coach");
  for (const file of fs.readdirSync(testsDir)) {
    if (/^stage2.*\.test\.ts$/.test(file)) files.push(path.join(testsDir, file));
  }

  const stage2Dir = path.join(REPO_ROOT, "lib", "blundr", "stage2");
  if (fs.existsSync(stage2Dir)) {
    const stack = [stage2Dir];
    while (stack.length > 0) {
      const current = stack.pop()!;
      for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
        const full = path.join(current, entry.name);
        if (entry.isDirectory()) stack.push(full);
        else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) files.push(full);
      }
    }
  }

  return files;
}

export function testStage2NoLegacyImportBoundary(): void {
  const appPage = fs.readFileSync(path.join(REPO_ROOT, "app", "page.tsx"), "utf8");

  // This is a documented known risk and should remain visible until later phases.
  for (const legacyImport of FORBIDDEN_IMPORTS) {
    assert.equal(appPage.includes(legacyImport), true, `known_phase_a_risk_expected_in_app_page:${legacyImport}`);
  }

  // Stage2/new-consolidation files must not import legacy runtime feeders directly.
  for (const filePath of collectGuardedFiles()) {
    const content = fs.readFileSync(filePath, "utf8");
    const specs = importedSpecifiers(content);
    for (const legacyImport of FORBIDDEN_IMPORTS) {
      const tail = legacyImport.replace("lib/blundr/", "");
      const hit = specs.some((spec) => spec.includes(tail));
      assert.equal(hit, false, `forbidden_stage2_legacy_import:${legacyImport} in ${path.relative(REPO_ROOT, filePath)}`);
    }
  }
}

testStage2NoLegacyImportBoundary();
console.log("stage2NoLegacyImportBoundary ok");
