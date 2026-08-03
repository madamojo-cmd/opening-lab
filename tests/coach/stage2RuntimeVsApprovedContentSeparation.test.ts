import assert from "node:assert/strict";

import { buildDebugCopyEverythingPayload } from "../../components/debug/BlundrDiagnosticsPanel";
import { buildTrainerDebugSnapshot } from "../../lib/blundr/debug/trainerDebugSnapshot";

export function testStage2RuntimeVsApprovedContentSeparation(): void {
  const snapshot = buildTrainerDebugSnapshot({
    debugEnabled: true,
    trainerFrameId: 811,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: true,
    fen: "rnbqkb1r/pppppppp/5n2/8/8/5N2/PPPPPPPP/RNBQKB1R w KQkq - 2 2",
    selectedOpeningId: "caro-kann-black",
    selectedRepertoireId: "caro-kann-black",
    candidateSource: "local_runtime_package",
    runtimeBookQueried: true,
    runtimeBookOpeningId: "caro-kann-black",
    runtimeBookPlayKeyBefore: "e2e4,c7c6",
    runtimeBookStatus: "ready",
    runtimeBookCandidateCount: 3,
    runtimeBookTopCandidateUci: "d2d4",
    runtimeBookTopCandidateSan: "d4",
    runtimeBookTopCandidateRank: 1,
    runtimeBookTopCandidateGames: 1000,
    runtimeBookBookExhausted: false,
    runtimeBookFallbackUsed: false,
    runtimeBookFallbackAuthority: null,
    stage2CoachingResolverEnabled: true,
    stage2ApprovedContentEnabled: true,
    stage2SafeFallbackEnabled: true,
    stage2CoachingPacketKind: "safe_fallback",
    stage2CoachingSafetyStatus: "safe",
    stage2CoachingSurface: "assisted",
    stage2CoachingSourceFile: "stage2://safe-fallback",
    stage2CoachingRuntimeMatched: true,
    presentationFrame: { visual: { shouldRender: true, source: "continuation_candidate" }, coach: { owner: "intent_first_coach" }, legacy: {} },
    visibleTeachingSurface: {
      owner: "v28_visible_surface",
      mode: "assisted",
      coach: { shouldRender: true, title: "Caro-Kann", body: "Build the structure." },
      visual: { lines: [] },
      actions: [],
    },
    eventLog: [],
  } as any);

  assert.equal((snapshot as any).runtime.runtimeDataSource, "local_crawled_package");
  assert.equal((snapshot as any).runtime.runtimePackageId, "blundr-opening-runtime-3.99.v1");
  assert.equal((snapshot as any).runtime.openingCount, 21);
  assert.equal((snapshot as any).runtime.visibleOpeningCount, 21);
  assert.equal((snapshot as any).runtime.runtimeAvailableCount, 21);
  assert.equal((snapshot as any).runtime.approvedContentInventoryCount, 21);
  assert.equal((snapshot as any).runtime.approvedContentMatchedCount, 21);
  assert.equal((snapshot as any).runtime.selectedOpeningId, "caro-kann-black");
  assert.equal((snapshot as any).runtime.selectedOpeningRuntimeAvailable, true);
  assert.equal((snapshot as any).runtime.selectedOpeningContentStatus, "approved");
  assert.equal((snapshot as any).runtime.selectedOpeningApprovedContentAvailable, true);
  assert.equal((snapshot as any).runtime.candidateSource, "local_runtime_package");
  assert.equal((snapshot as any).runtime.liveLichessCalled, false);
  assert.equal((snapshot as any).runtime.openingAvailabilityStatus, "runtime_available");

  assert.equal((snapshot as any).continuation.stage2ApprovedContentEnabled, true);
  assert.equal((snapshot as any).continuation.stage2CoachingTargetMatched, true);
  assert.equal((snapshot as any).continuation.stage2CoachingPlainViewSafe, true);
  assert.equal((snapshot as any).continuation.stage2CoachingReasonRejected, null);

  const copyEverything = buildDebugCopyEverythingPayload(snapshot);
  assert.equal((copyEverything as any).runtime.approvedContentInventoryCount, 21);
  assert.equal((copyEverything as any).runtime.approvedContentMatchedCount, 21);
  assert.equal((copyEverything as any).runtime.selectedOpeningApprovedContentAvailable, true);
  assert.equal((copyEverything as any).stage2Coaching.approvedContentEnabled, true);
  assert.equal((copyEverything as any).stage2Coaching.targetMatched, true);
  assert.equal((copyEverything as any).stage2Coaching.plainViewSafe, true);
  assert.equal((copyEverything as any).stage2Coaching.reasonRejected, null);
}

testStage2RuntimeVsApprovedContentSeparation();
console.log("stage2RuntimeVsApprovedContentSeparation ok");
