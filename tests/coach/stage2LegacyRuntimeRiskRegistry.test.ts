import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const REPO_ROOT = path.resolve(__dirname, "..", "..");

const LEGACY_RUNTIME_DIRECT_FEEDERS = [
  "lib/blundr/coach/coachDecisionEngine",
  "lib/blundr/liveCoach/pedagogicalOpportunityEngine",
  "lib/blundr/liveCoach/liveCoachCopyLibrary",
  "lib/blundr/liveCoach/liveCoachIntentSelector",
  "lib/blundr/liveCoach/liveCoachCommentRanker",
  "lib/blundr/coachBrain/coachExplanationPipeline",
  "lib/blundr/teaching/teachingOrchestrator",
  "lib/blundr/visualRecipe/visualRecipeCompiler",
  "lib/blundr/visualRecipe/visualRecipeAdapter",
] as const;

function stage2Files(): string[] {
  const out: string[] = [];
  const stage2Dir = path.join(REPO_ROOT, "lib", "blundr", "stage2");
  if (!fs.existsSync(stage2Dir)) return out;

  const stack = [stage2Dir];
  while (stack.length > 0) {
    const current = stack.pop()!;
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) out.push(full);
    }
  }
  return out;
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

export function testStage2LegacyRuntimeRiskRegistry(): void {
  const appPageContent = fs.readFileSync(path.join(REPO_ROOT, "app", "page.tsx"), "utf8");

  // These are intentionally documented known risks and should remain visible in B.4.
  for (const feeder of LEGACY_RUNTIME_DIRECT_FEEDERS) {
    assert.equal(appPageContent.includes(feeder), true, `known_legacy_runtime_direct_feeder_missing_from_app_page:${feeder}`);
  }

  const planContent = fs.readFileSync(
    path.join(REPO_ROOT, "docs", "2026-06-11", "STAGE_2_LEGACY_RUNTIME_ISOLATION_PLAN.md"),
    "utf8",
  );

  for (const feeder of LEGACY_RUNTIME_DIRECT_FEEDERS) {
    assert.equal(planContent.includes(feeder), true, `legacy_feeder_not_documented_in_isolation_plan:${feeder}`);
  }

  // Stage2 modules should not newly import these legacy direct feeders.
  for (const filePath of stage2Files()) {
    const specs = importSpecifiers(fs.readFileSync(filePath, "utf8")).map((s) => s.toLowerCase());
    for (const feeder of LEGACY_RUNTIME_DIRECT_FEEDERS) {
      const tail = feeder.replace("lib/blundr/", "").toLowerCase();
      const hit = specs.some((spec) => spec.includes(tail));
      assert.equal(hit, false, `stage2_file_imports_legacy_runtime_direct_feeder:${path.relative(REPO_ROOT, filePath)} -> ${feeder}`);
    }
  }
}

testStage2LegacyRuntimeRiskRegistry();
console.log("stage2LegacyRuntimeRiskRegistry ok");
