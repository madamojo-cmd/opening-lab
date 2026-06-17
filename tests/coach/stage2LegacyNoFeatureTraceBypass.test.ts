import assert from "node:assert/strict";

import { buildLegacyAuditFeatureTrace } from "./stage2LegacyNoBypassTestHelpers";

export function testStage2LegacyNoFeatureTraceBypass(): void {
  const traceBundle = buildLegacyAuditFeatureTrace({
    trainerView: "plain",
    visibleTeachingSurface: {
      owner: "v28_visible_surface",
      mode: "plain_before_show_more",
      coach: { shouldRender: true, title: "Plain title", body: "Plain body", buttons: [] },
      safety: { blocked: false },
      visual: { lines: [{ id: "line-1" }, { id: "line-2" }] },
      actions: [],
    },
    actualVisualSource: "fallback_current_surface",
    stage2ApprovedPacketVisualSource: "fallback_current_surface",
    stage2ApprovedPacketKind: "safe_fallback",
    stage2ApprovedPacketMatched: false,
    stage2ApprovedPacketMissReason: "approved_packet_exact_match_not_found",
    stage2ApprovedPacketFallbackReason: "safe_fallback_used",
    stage2CoachingPacketKind: "safe_fallback",
    stage2CoachingSafetyStatus: "safe",
    stage2CoachingSurface: "plain_hint",
    showMoreShown: false,
  } as any);

  const trace = traceBundle.featureTrace as any;
  assert.equal(trace.acceptedTargetUci, "e2e4");
  assert.equal(trace.coachCardResult.finalRendered.title, trace.finalRenderedTitle);
  assert.equal(trace.coachCardResult.finalRendered.body, trace.finalRenderedBody);
  assert.equal(trace.visualResult.finalVisualTargetUci, trace.acceptedTargetUci);
  assert.equal(trace.visualRecipeResult.moveUci, trace.visualTargetUci);
  assert.equal(trace.reviewCandidateEventEligible === false || trace.reviewCandidateEventEligible === true, true);
  assert.equal(trace.traceStatus === "complete" || trace.traceStatus === "partial" || trace.traceStatus === "missing", true);
}

testStage2LegacyNoFeatureTraceBypass();
console.log("stage2LegacyNoFeatureTraceBypass ok");

