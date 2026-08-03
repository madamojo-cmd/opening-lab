import assert from "node:assert/strict";

import { buildDebugCopyEverythingPayload } from "../../components/debug/BlundrDiagnosticsPanel";
import { buildTrainerDebugSnapshot } from "../../lib/blundr/debug/trainerDebugSnapshot";

export function testRuntimeDataSourceDebug(): void {
  const snapshot = buildTrainerDebugSnapshot({
    debugEnabled: true,
    trainerFrameId: 21,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: true,
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    selectedOpeningId: "caro-kann-black",
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
    candidateSource: "local_runtime_package",
    stage2ApprovedContentEnabled: true,
    coachDecision: {
      shouldShowCoachCard: true,
      title: "London System",
      body: "Build a stable setup.",
      debug: { coachDecisionSource: "live_coach", coachMoveUci: "d2d4" },
    },
    presentationFrame: {
      visual: { shouldRender: true, source: "continuation_candidate" },
      coach: { shouldRender: true, owner: "intent_first_coach", title: "London System", body: "Build a stable setup." },
      legacy: {},
    },
    visibleTeachingSurface: {
      owner: "v28_visible_surface",
      mode: "assisted",
      coach: { shouldRender: true, title: "London System", body: "Build a stable setup." },
      visual: { lines: [] },
      actions: [],
    },
    eventLog: [],
  } as any);

  assert.equal((snapshot as any).runtime.runtimeDataSource, "local_crawled_package");
  assert.equal((snapshot as any).runtime.runtimePackageId, "blundr-opening-runtime-3.99.v1");
  assert.equal((snapshot as any).runtime.openingCount, 21);
  assert.equal((snapshot as any).runtime.visibleOpeningCount, 21);
  assert.equal((snapshot as any).runtime.approvedContentInventoryCount, 21);
  assert.equal((snapshot as any).runtime.approvedContentMatchedCount, 21);
  assert.equal((snapshot as any).runtime.selectedOpeningId, "caro-kann-black");
  assert.equal((snapshot as any).runtime.selectedOpeningRuntimeAvailable, true);
  assert.equal((snapshot as any).runtime.selectedOpeningContentStatus, "approved");
  assert.equal((snapshot as any).runtime.selectedOpeningApprovedContentAvailable, true);
  assert.equal((snapshot as any).runtime.candidateSource, "local_runtime_package");
  assert.equal((snapshot as any).runtime.liveLichessCalled, false);
  assert.equal((snapshot as any).runtime.openingAvailabilityStatus, "runtime_available");

  const copyEverything = buildDebugCopyEverythingPayload(snapshot);
  assert.equal((copyEverything as any).runtime.runtimeDataSource, "local_crawled_package");
  assert.equal((copyEverything as any).runtime.runtimePackageId, "blundr-opening-runtime-3.99.v1");
  assert.equal((copyEverything as any).runtime.openingCount, 21);
  assert.equal((copyEverything as any).runtime.visibleOpeningCount, 21);
  assert.equal((copyEverything as any).runtime.approvedContentInventoryCount, 21);
  assert.equal((copyEverything as any).runtime.approvedContentMatchedCount, 21);
  assert.equal((copyEverything as any).runtime.selectedOpeningRuntimeAvailable, true);
  assert.equal((copyEverything as any).runtime.selectedOpeningApprovedContentAvailable, true);
  assert.equal((copyEverything as any).runtime.liveLichessCalled, false);
  assert.equal((copyEverything as any).runtime.candidateSource, "local_runtime_package");
  assert.equal((copyEverything as any).runtime.openingAvailabilityStatus, "runtime_available");
}

testRuntimeDataSourceDebug();
console.log("runtimeDataSourceDebug ok");
