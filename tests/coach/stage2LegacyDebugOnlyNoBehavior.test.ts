import assert from "node:assert/strict";

import { buildDebugCopyEverythingPayload } from "../../components/debug/BlundrDiagnosticsPanel";
import { buildLegacyAuditDebugSnapshot } from "./stage2LegacyNoBypassTestHelpers";

export function testStage2LegacyDebugOnlyNoBehavior(): void {
  const snapshot = buildLegacyAuditDebugSnapshot({
    debugEnabled: true,
    eventLog: [],
    coachDecision: {
      shouldShowCoachCard: true,
      title: "Coach title",
      body: "Coach body",
      buttons: [],
      debug: { coachDecisionSource: "live_coach", coachMoveUci: "e2e4", coachPieceType: "p" },
    },
    presentationFrame: {
      visual: { shouldRender: true, source: "approved_recipe" },
      coach: { owner: "intent_first_coach" },
      legacy: {},
    },
  } as any);

  assert.equal((snapshot as any).trainerFrameResolution.acceptedTargetUci, "e2e4");
  assert.equal((snapshot as any).trainerFrameResolution.visual.targetMoveUci, "e2e4");

  const copyEverything = buildDebugCopyEverythingPayload(snapshot as any);
  assert.equal((copyEverything as any).trainerFrameResolution.acceptedTargetUci, "e2e4");
  assert.equal((copyEverything as any).featureTrace.acceptedTargetUci, "e2e4");
  assert.equal((copyEverything as any).runtimeBook.queried, false);
  assert.doesNotThrow(() => buildDebugCopyEverythingPayload(null));
  assert.doesNotThrow(() => buildDebugCopyEverythingPayload(undefined));
}

testStage2LegacyDebugOnlyNoBehavior();
console.log("stage2LegacyDebugOnlyNoBehavior ok");
