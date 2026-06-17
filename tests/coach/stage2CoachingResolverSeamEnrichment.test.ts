import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  applyStage2CoachCopyEnrichment,
  buildStage2CoachContext,
  mapVisibleSurfaceModeToStage2CoachingSurface,
  resolveStage2CoachingPacket,
  type Stage2CoachingPacketResolution,
} from "../../lib/blundr/stage2Coaching";

const REPO_ROOT = path.resolve(__dirname, "..", "..");

function approvedPacket(overrides: Record<string, unknown> = {}): Stage2CoachingPacketResolution {
  return {
    kind: "approved_packet",
    packet: {
      openingId: "london-white",
      playKey: "d2d4,d7d5,c1f4",
      moveUci: "g1f3",
      moveSan: "Nf3",
      surface: "assisted",
      status: "approved",
      title: "Stage 2 approved title",
      body: "Stage 2 approved body",
      hint: "Stage 2 safe hint",
      showMore: "Stage 2 deeper explanation",
      visualRecipeRefs: [],
      evidenceIds: ["evidence-1"],
      sourceFile: "stage2://approved",
      sourceSection: "assistant",
      runtimeReconciliation: { status: "matched", openingId: "london-white", playKey: "d2d4,d7d5,c1f4", moveUci: "g1f3" },
      safetyStatus: "safe",
      ...overrides,
    } as any,
  };
}

function baseCopy() {
  return {
    title: "Base title",
    body: "Base body",
    bullets: ["b1"],
  };
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

export function testStage2CoachingResolverSeamEnrichment(): void {
  const assistedApplied = applyStage2CoachCopyEnrichment({
    currentMode: "assisted",
    targetUci: "g1f3",
    targetSan: "Nf3",
    baseCopy: baseCopy(),
    resolution: approvedPacket(),
  });
  assert.equal(assistedApplied.applied, true, "approved+safe+matched assisted packet should apply");
  assert.equal(assistedApplied.copy.title, "Stage 2 approved title");
  assert.equal(assistedApplied.copy.body, "Stage 2 approved body");

  const nonePreserved = applyStage2CoachCopyEnrichment({
    currentMode: "assisted",
    targetUci: "g1f3",
    targetSan: "Nf3",
    baseCopy: baseCopy(),
    resolution: { kind: "none", reason: "no_bundle" },
  });
  assert.equal(nonePreserved.applied, false);
  assert.equal(nonePreserved.copy.title, "Base title");

  const draftPreserved = applyStage2CoachCopyEnrichment({
    currentMode: "assisted",
    targetUci: "g1f3",
    targetSan: "Nf3",
    baseCopy: baseCopy(),
    resolution: approvedPacket({ status: "draft" }),
  });
  assert.equal(draftPreserved.applied, false);

  const blockedPreserved = applyStage2CoachCopyEnrichment({
    currentMode: "assisted",
    targetUci: "g1f3",
    targetSan: "Nf3",
    baseCopy: baseCopy(),
    resolution: approvedPacket({ status: "blocked" }),
  });
  assert.equal(blockedPreserved.applied, false);

  const unmatchedPreserved = applyStage2CoachCopyEnrichment({
    currentMode: "assisted",
    targetUci: "g1f3",
    targetSan: "Nf3",
    baseCopy: baseCopy(),
    resolution: approvedPacket({ runtimeReconciliation: { status: "unmatched", reason: "not_found" } }),
  });
  assert.equal(unmatchedPreserved.applied, false);

  const unsafePreserved = applyStage2CoachCopyEnrichment({
    currentMode: "assisted",
    targetUci: "g1f3",
    targetSan: "Nf3",
    baseCopy: baseCopy(),
    resolution: approvedPacket({ safetyStatus: "needs_review" }),
  });
  assert.equal(unsafePreserved.applied, false);

  const plainPreLeakBlocked = applyStage2CoachCopyEnrichment({
    currentMode: "plain_before_show_more",
    targetUci: "g1f3",
    targetSan: "Nf3",
    baseCopy: baseCopy(),
    resolution: approvedPacket({ surface: "plain_hint", hint: "Play Nf3 now." }),
  });
  assert.equal(plainPreLeakBlocked.applied, false, "plain pre-show-more must block leaking target SAN/UCI");

  const plainShowMoreApplied = applyStage2CoachCopyEnrichment({
    currentMode: "plain_after_show_more",
    targetUci: "g1f3",
    targetSan: "Nf3",
    baseCopy: baseCopy(),
    resolution: approvedPacket({ surface: "plain_show_more", showMore: "Approved show more body." }),
  });
  assert.equal(plainShowMoreApplied.applied, true, "plain show-more may apply approved packet");
  assert.equal(plainShowMoreApplied.copy.body, "Approved show more body.");

  const assistedAppliedAgain = applyStage2CoachCopyEnrichment({
    currentMode: "assisted",
    targetUci: "g1f3",
    targetSan: "Nf3",
    baseCopy: baseCopy(),
    resolution: approvedPacket({ surface: "assisted", body: "Approved assisted body." }),
  });
  assert.equal(assistedAppliedAgain.applied, true, "assisted may apply approved packet");
  assert.equal(assistedAppliedAgain.copy.body, "Approved assisted body.");

  const preservedTargetUci = "g1f3";
  const resolved = resolveStage2CoachingPacket(
    buildStage2CoachContext({
      openingId: "london-white",
      playKeyBefore: "d2d4,d7d5,c1f4",
      learnerSide: "white",
      sideToMove: "white",
      targetUci: preservedTargetUci,
      targetSan: "Nf3",
      targetPieceType: "n",
      surface: "assisted",
    }),
  );
  assert.equal(preservedTargetUci, "g1f3");
  assert.equal(resolved.kind, "approved_packet", "resolver should use approved content for exact matches");

  const fallback = resolveStage2CoachingPacket(
    buildStage2CoachContext({
      openingId: "london-white",
      playKeyBefore: "d2d4,d7d5,c1f4",
      learnerSide: "white",
      sideToMove: "white",
      targetUci: "a1a2",
      targetSan: "Ra2",
      targetPieceType: "r",
      surface: "assisted",
    }),
  );
  assert.equal(fallback.kind, "safe_fallback", "resolver should preserve fallback when no approved packet matches");

  assert.equal(mapVisibleSurfaceModeToStage2CoachingSurface("plain_before_show_more"), "plain_hint");
  assert.equal(mapVisibleSurfaceModeToStage2CoachingSurface("plain_after_show_more"), "plain_show_more");
  assert.equal(mapVisibleSurfaceModeToStage2CoachingSurface("assisted"), "assisted");

  const stage2Dir = path.join(REPO_ROOT, "lib", "blundr", "stage2Coaching");
  for (const file of fs.readdirSync(stage2Dir)) {
    if (!/\.(ts|tsx)$/.test(file)) continue;
    const full = path.join(stage2Dir, file);
    const content = fs.readFileSync(full, "utf8");
    const specs = importSpecifiers(content).map((item) => item.toLowerCase());
    assert.equal(specs.some((item) => item.includes("docs/content/stage2")), false, `forbidden_stage2_content_import:${file}`);
    assert.equal(specs.some((item) => item.includes("imports/stage2-sample")), false, `forbidden_sample_import:${file}`);
    assert.equal(specs.some((item) => item.endsWith(".md")), false, `forbidden_markdown_import:${file}`);
    assert.equal(/docs\/content\/stage2|imports\/stage2-sample/i.test(content), false, `forbidden_stage2_runtime_reference:${file}`);
  }
}

testStage2CoachingResolverSeamEnrichment();
console.log("stage2CoachingResolverSeamEnrichment ok");
