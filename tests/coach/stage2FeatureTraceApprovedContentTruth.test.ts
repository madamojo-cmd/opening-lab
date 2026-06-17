import assert from "node:assert/strict";

import { buildApprovedDebugSnapshot, buildApprovedFeatureTrace, loadApprovedTracePacket } from "./stage2FeatureTraceTestHelpers";
import { buildDebugCopyEverythingPayload } from "../../components/debug/BlundrDiagnosticsPanel";

export function testStage2FeatureTraceApprovedContentTruth(): void {
  const packet = loadApprovedTracePacket((entry) => entry.openingId === "london-white" && entry.moveUci === "d2d4" && entry.status === "approved");
  const traceBundle = buildApprovedFeatureTrace(packet, {
    trainerFrameId: 620,
    selectedOpeningId: packet.openingId,
    selectedLineId: packet.lineId,
    visibleSurfaceMode: "assisted",
    visualRecipe: packet.visualRecipe,
    visualRecipeMoveUci: packet.moveUci,
    visualRecipeMoveSan: packet.moveSan,
  });
  const trace = traceBundle.featureTrace as any;
  assert.equal(trace.approvedContentMatched, true);
  assert.equal(trace.approvedPacketKind, "approved_packet");
  assert.equal(trace.approvedPacketId, packet.packetId);
  assert.equal(trace.approvedPacketSourceBundle, packet.sourceCandidatePackages?.[0] ?? packet.sourceCandidatePackage ?? null);
  assert.equal(trace.coachCardResult.fallbackUsed, false);
  assert.equal(trace.coachCardResult.fallbackReason, null);
  assert.equal(trace.coachCardSource, "approved");

  const snapshot = buildApprovedDebugSnapshot(packet, {
    trainerFrameId: 621,
    selectedOpeningId: packet.openingId,
    selectedLineId: packet.lineId,
    visibleSurfaceMode: "assisted",
    visualRecipe: packet.visualRecipe,
  });
  const copyEverything = buildDebugCopyEverythingPayload(snapshot as any);
  assert.equal((copyEverything as any).featureTrace.approvedContentMatched, true);
  assert.equal((copyEverything as any).featureTrace.approvedPacketId, packet.packetId);
  assert.equal((copyEverything as any).featureTrace.approvedPacketKind, "approved_packet");
}

testStage2FeatureTraceApprovedContentTruth();
console.log("stage2FeatureTraceApprovedContentTruth ok");
