import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { buildLiveVisibleTeachingSurface } from "../../lib/blundr/presentation/buildLiveVisibleTeachingSurface";
import { buildCurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";
import { lockInstructionTarget } from "../../lib/blundr/runtime/instructionFrameLock";

const REPO_ROOT = path.resolve(__dirname, "..", "..");
const FORBIDDEN_STAGE2_IMPORTS = [
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

function collectStage2Files(): string[] {
  const out: string[] = [];
  const testsDir = path.join(REPO_ROOT, "tests", "coach");
  if (fs.existsSync(testsDir)) {
    for (const file of fs.readdirSync(testsDir)) {
      if (/^stage2.*\.test\.ts$/.test(file)) out.push(path.join(testsDir, file));
    }
  }

  const stage2LibDir = path.join(REPO_ROOT, "lib", "blundr", "stage2");
  if (fs.existsSync(stage2LibDir)) {
    const stack = [stage2LibDir];
    while (stack.length > 0) {
      const current = stack.pop()!;
      for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
        const full = path.join(current, entry.name);
        if (entry.isDirectory()) stack.push(full);
        if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) out.push(full);
      }
    }
  }

  return out;
}

function normalizeForScan(filePath: string): string {
  return fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");
}

export function testStage2SurfaceOwnershipLock(): void {
  const frame = buildCurrentInstructionFrame({
    kind: "guided_move",
    fenBefore: "r1bqk1nr/pppp1ppp/2n5/2b1p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 4 3",
    ply: 6,
    sideToMove: "white",
    target: lockInstructionTarget({
      uci: "f1c4",
      san: "Bc4",
      pieceType: "bishop",
      color: "white",
      source: "opening_tree",
      reason: "surface_owner_lock",
    }),
    mode: "guided",
    source: "opening_tree",
  });

  const surface = buildLiveVisibleTeachingSurface({
    frame,
    requestedMode: "assisted",
    showMoreRevealed: false,
    openingKey: "italian_game",
    openingName: "Italian Game",
  });

  assert.equal(surface.provenance.surfaceVersion, "v2.8.0-package9-visible-surface");
  assert.equal(surface.debug.sourceSafeFrame, true);
  assert.equal(surface.provenance.frameKey, frame.frameKey);

  // Known legacy runtime imports in app/page.tsx are documented Phase A risks, not Stage 2 approvals.
  const appPage = normalizeForScan(path.join(REPO_ROOT, "app", "page.tsx"));
  for (const legacyPath of FORBIDDEN_STAGE2_IMPORTS) {
    assert.equal(
      appPage.includes(legacyPath),
      true,
      `audit_contract_expected_known_risk_import_in_app_page_missing:${legacyPath}`,
    );
  }

  const stage2Files = collectStage2Files();
  for (const filePath of stage2Files) {
    const content = normalizeForScan(filePath);
    const specs = importedSpecifiers(content);
    for (const legacyPath of FORBIDDEN_STAGE2_IMPORTS) {
      const tail = legacyPath.replace("lib/blundr/", "");
      const hit = specs.some((spec) => spec.includes(tail));
      assert.equal(hit, false, `stage2_surface_owner_boundary_forbids_legacy_import:${legacyPath} in ${path.relative(REPO_ROOT, filePath)}`);
    }
  }
}

testStage2SurfaceOwnershipLock();
console.log("stage2SurfaceOwnershipLock ok");
