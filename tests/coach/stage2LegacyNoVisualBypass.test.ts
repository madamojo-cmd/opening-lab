import assert from "node:assert/strict";

import { buildLegacyAuditFrameResolution } from "./stage2LegacyNoBypassTestHelpers";

export function testStage2LegacyNoVisualBypass(): void {
  const approved = buildLegacyAuditFrameResolution({
    actualVisualSource: "approved_recipe",
    stage2ApprovedPacketVisualSource: "approved_recipe",
    visualRecipe: { visualRecipeId: "approved-visual", targetMoveUci: "e2e4", moveUci: "e2e4", moveSan: "e4" },
    visualRecipeMoveUci: "e2e4",
    visualRecipeMoveSan: "e4",
  } as any);
  assert.equal(approved.acceptedTargetUci, "e2e4");
  assert.equal(approved.visualResult.visualSource, "approved_recipe");
  assert.equal(approved.visual.targetMoveUci, "e2e4");

  const generated = buildLegacyAuditFrameResolution({
    actualVisualSource: "generated_recipe",
    stage2ApprovedPacketVisualSource: "generated_recipe",
    stage2ApprovedPacketKind: "none",
    stage2ApprovedPacketMatched: false,
    visualRecipe: { visualRecipeId: "generated-visual", targetMoveUci: "g1f3", moveUci: "g1f3", moveSan: "Nf3" },
    visualRecipeMoveUci: "g1f3",
    visualRecipeMoveSan: "Nf3",
  } as any);
  assert.equal(generated.acceptedTargetUci, "e2e4");
  assert.equal(generated.visualResult.finalVisualTargetUci, "e2e4");

  const fallback = buildLegacyAuditFrameResolution({
    actualVisualSource: "fallback_current_surface",
    stage2ApprovedPacketVisualSource: "fallback_current_surface",
    stage2ApprovedPacketKind: "safe_fallback",
    stage2ApprovedPacketMatched: false,
    visualRecipe: { visualRecipeId: "fallback-visual", targetMoveUci: "d2d4", moveUci: "d2d4", moveSan: "d4" },
    visualRecipeMoveUci: "d2d4",
    visualRecipeMoveSan: "d4",
  } as any);
  assert.equal(fallback.acceptedTargetUci, "e2e4");
  assert.equal(fallback.visualResult.finalVisualTargetUci, "e2e4");

  const none = buildLegacyAuditFrameResolution({
    actualVisualSource: "none",
    renderedVisualPrimitiveCount: 0,
    surfaceVisualPrimitiveCount: 0,
    stage2ApprovedPacketVisualSource: "none",
    stage2ApprovedPacketKind: "none",
    stage2ApprovedPacketMatched: false,
    visualRecipe: null,
    visualRecipeMoveUci: null,
    visualRecipeMoveSan: null,
  } as any);
  assert.equal(none.acceptedTargetUci, "e2e4");
  assert.equal(none.visualResult.visualSource, "none");
  assert.equal(none.visualResult.rendered, false);
}

testStage2LegacyNoVisualBypass();
console.log("stage2LegacyNoVisualBypass ok");
