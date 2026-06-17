import assert from "node:assert/strict";

import { buildDebugCopyEverythingPayload } from "../../components/debug/BlundrDiagnosticsPanel";
import { buildTrainerDebugSnapshot } from "../../lib/blundr/debug/trainerDebugSnapshot";

export function testStage2OpeningVisibilityDebugTruth(): void {
  const snapshot = buildTrainerDebugSnapshot({
    debugEnabled: true,
    trainerFrameId: 901,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: true,
    fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 1 2",
    selectedOpeningId: "italian-white",
    runtimeBookQueried: true,
    runtimeBookOpeningId: "italian-white",
    runtimeBookPlayKeyBefore: "e2e4,e7e5,g1f3,b8c6",
    runtimeBookStatus: "ready",
    runtimeBookCandidateCount: 2,
    runtimeBookTopCandidateUci: "f1c4",
    runtimeBookTopCandidateSan: "Bc4",
    runtimeBookTopCandidateRank: 1,
    runtimeBookTopCandidateGames: 4321,
    runtimeBookBookExhausted: false,
    runtimeBookFallbackUsed: false,
    runtimeBookFallbackAuthority: null,
    candidateSource: "local_runtime_package",
    stage2ApprovedContentEnabled: true,
    stage2CoachingResolverEnabled: true,
    stage2SafeFallbackEnabled: true,
    presentationFrame: {
      visual: { shouldRender: true, source: "continuation_candidate" },
      coach: { shouldRender: true, owner: "intent_first_coach", title: "Italian Game", body: "Play the bishop to c4." },
      legacy: {},
    },
    visibleTeachingSurface: {
      owner: "v28_visible_surface",
      mode: "assisted",
      coach: { shouldRender: true, title: "Italian Game", body: "Play the bishop to c4." },
      visual: { lines: [] },
      actions: [],
    },
    eventLog: [],
  } as any);

  const runtime = (snapshot as any).runtime;
  assert.equal(runtime.runtimeDataSource, "local_crawled_package");
  assert.equal(runtime.visibleOpeningCount, 21);
  assert.equal(runtime.publicOpeningCount, 0);
  assert.equal(runtime.betaOpeningCount, 1);
  assert.equal(runtime.devOpeningCount, 20);
  assert.equal(runtime.selectedOpeningId, "italian-white");
  assert.equal(runtime.selectedOpeningRuntimeAvailable, true);
  assert.equal(runtime.selectedOpeningContentStatus, "approved");
  assert.equal(runtime.selectedOpeningApprovedContentAvailable, true);
  assert.equal(runtime.selectedOpeningStage, "beta");
  assert.equal(runtime.selectedOpeningQaStatus, "smoke_pass");
  assert.equal(runtime.selectedOpeningPublicReady, false);
  assert.equal(runtime.selectedOpeningBetaReady, true);
  assert.equal(runtime.selectedOpeningNeedsBrowserQA, true);
  assert.equal(runtime.selectedOpeningLeadingMvpCandidate, true);
  assert.equal(runtime.selectedOpeningReasonHidden, "beta_selector_only_until_browser_qa");
  assert.equal(runtime.candidateSource, "local_runtime_package");
  assert.equal(runtime.liveLichessCalled, false);

  const copyEverything = buildDebugCopyEverythingPayload(snapshot);
  assert.equal((copyEverything as any).runtime.publicOpeningCount, 0);
  assert.equal((copyEverything as any).runtime.betaOpeningCount, 1);
  assert.equal((copyEverything as any).runtime.devOpeningCount, 20);
  assert.equal((copyEverything as any).runtime.selectedOpeningStage, "beta");
  assert.equal((copyEverything as any).runtime.selectedOpeningQaStatus, "smoke_pass");
  assert.equal((copyEverything as any).runtime.selectedOpeningPublicReady, false);
  assert.equal((copyEverything as any).runtime.selectedOpeningBetaReady, true);
  assert.equal((copyEverything as any).runtime.selectedOpeningNeedsBrowserQA, true);
  assert.equal((copyEverything as any).runtime.selectedOpeningLeadingMvpCandidate, true);
  assert.equal((copyEverything as any).runtime.selectedOpeningReasonHidden, "beta_selector_only_until_browser_qa");
}

testStage2OpeningVisibilityDebugTruth();
console.log("stage2OpeningVisibilityDebugTruth ok");
