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
    stage2ApprovedContentEnabled: false,
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
  assert.equal((snapshot as any).runtime.runtimePackageId, "stage2-21-opening-stepdown-runtime-v1");
  assert.equal((snapshot as any).runtime.openingCount, 21);
  assert.equal((snapshot as any).runtime.visibleOpeningCount, 21);
  assert.equal((snapshot as any).runtime.runtimeAvailableCount, 21);
  assert.equal((snapshot as any).runtime.approvedContentInventoryCount, 21);
  assert.equal((snapshot as any).runtime.approvedContentMatchedCount, 0);
  assert.equal((snapshot as any).runtime.selectedOpeningId, "caro-kann-black");
  assert.equal((snapshot as any).runtime.selectedOpeningRuntimeAvailable, true);
  assert.equal((snapshot as any).runtime.selectedOpeningContentStatus, "fallback_only");
  assert.equal((snapshot as any).runtime.selectedOpeningApprovedContentAvailable, false);
  assert.equal((snapshot as any).runtime.candidateSource, "local_runtime_package");
  assert.equal((snapshot as any).runtime.liveLichessCalled, false);
  assert.equal((snapshot as any).runtime.openingAvailabilityStatus, "runtime_available");

  assert.equal((snapshot as any).continuation.stage2ApprovedContentEnabled, false);
  assert.equal((snapshot as any).continuation.stage2CoachingTargetMatched, false);
  assert.equal((snapshot as any).continuation.stage2CoachingPlainViewSafe, false);
  assert.equal((snapshot as any).continuation.stage2CoachingReasonRejected, "draft_source_not_approved:caro-kann-black");

  const copyEverything = buildDebugCopyEverythingPayload(snapshot);
  assert.equal((copyEverything as any).runtime.approvedContentInventoryCount, 21);
  assert.equal((copyEverything as any).runtime.approvedContentMatchedCount, 0);
  assert.equal((copyEverything as any).runtime.selectedOpeningApprovedContentAvailable, false);
  assert.equal((copyEverything as any).stage2Coaching.approvedContentEnabled, false);
  assert.equal((copyEverything as any).stage2Coaching.targetMatched, false);
  assert.equal((copyEverything as any).stage2Coaching.plainViewSafe, false);
  assert.equal((copyEverything as any).stage2Coaching.reasonRejected, "draft_source_not_approved:caro-kann-black");
}

testStage2RuntimeVsApprovedContentSeparation();
console.log("stage2RuntimeVsApprovedContentSeparation ok");
