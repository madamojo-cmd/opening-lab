import assert from "node:assert/strict";

import { buildDebugCopyEverythingPayload } from "../../components/debug/BlundrDiagnosticsPanel";
import { buildTrainerDebugSnapshot } from "../../lib/blundr/debug/trainerDebugSnapshot";

export function testStage2CopyEverythingReportsCanonicalOpeningIdentity(): void {
  const snapshot = buildTrainerDebugSnapshot({
    debugEnabled: true,
    trainerFrameId: 52,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: false,
    fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2",
    selectedOpeningId: "ruy-white",
    selectedLineId: "ruy-white",
    runtimeBookQueried: true,
    runtimeBookOpeningId: "ruy-lopez-white",
    runtimeBookPlayKeyBefore: "e2e4,e7e5,g1f3,b8c6,f1c4",
    runtimeBookStatus: "ready",
    runtimeBookCandidateCount: 0,
    runtimeBookBookExhausted: true,
    runtimeBookFallbackUsed: false,
    runtimeBookFallbackAuthority: null,
    selectedOpeningRuntimeAvailable: false,
    selectedOpeningContentStatus: "none",
    selectedOpeningApprovedContentAvailable: false,
    candidateSource: "curated_repertoire",
    stage2ApprovedContentEnabled: false,
    stage2CoachingResolverEnabled: false,
    stage2SafeFallbackEnabled: true,
    visibleTeachingSurface: {
      owner: "v28_visible_surface",
      mode: "branch_complete",
      coach: { shouldRender: true, title: "Line complete", body: "You finished this training line.", buttons: ["continue_from_here", "restart_line"] },
      visual: { lines: [] },
      actions: ["continue_from_here", "restart_line"],
      safety: { blocked: false, criticalIssues: [] },
      debug: { visibleCoachOwner: "visible_surface_v28", visibleVisualOwner: "visible_surface_v28", visibleActionOwner: "visible_surface_v28" },
    },
    presentationFrame: {
      visual: { shouldRender: false, source: "none" },
      coach: { shouldRender: true, owner: "branch_transition_surface", title: "Line complete", body: "You finished this training line.", buttons: ["continue_from_here", "restart_line"] },
      legacy: {},
    },
    eventLog: [],
  } as any);

  const payload = buildDebugCopyEverythingPayload(snapshot);
  assert.equal(payload.runtime.selectedOpeningId, "ruy-white");
  assert.equal(payload.runtime.canonicalSelectedOpeningId, "ruy-lopez-white");
  assert.equal(payload.runtime.resolvedSelectedOpeningId, "ruy-lopez-white");
  assert.equal(payload.runtime.selectedOpeningRuntimeAvailable, true);
  assert.equal(payload.runtime.openingIdentityMatched, true);
}

testStage2CopyEverythingReportsCanonicalOpeningIdentity();
console.log("stage2CopyEverythingReportsCanonicalOpeningIdentity ok");
