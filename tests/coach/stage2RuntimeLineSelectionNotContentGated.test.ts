import assert from "node:assert/strict";

import { buildDebugCopyEverythingPayload } from "../../components/debug/BlundrDiagnosticsPanel";
import { buildTrainerDebugSnapshot } from "../../lib/blundr/debug/trainerDebugSnapshot";
import { STAGE2_RUNTIME_WEIGHTED_OPENING_SELECTION } from "../../lib/blundr/openings/runtimeTrainableRepertoires";

export function testStage2RuntimeLineSelectionNotContentGated(): void {
  const snapshot = buildTrainerDebugSnapshot({
    debugEnabled: true,
    trainerFrameId: 910,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: true,
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    selectedOpeningId: STAGE2_RUNTIME_WEIGHTED_OPENING_SELECTION.selectedOpeningId,
    selectedRepertoireId: STAGE2_RUNTIME_WEIGHTED_OPENING_SELECTION.selectedOpeningId,
    runtimeBookQueried: true,
    runtimeBookOpeningId: STAGE2_RUNTIME_WEIGHTED_OPENING_SELECTION.selectedOpeningId,
    runtimeBookPlayKeyBefore: null,
    runtimeBookStatus: "ready",
    runtimeBookCandidateCount: 3,
    runtimeBookTopCandidateUci: "e2e4",
    runtimeBookTopCandidateSan: "e4",
    runtimeBookTopCandidateRank: 1,
    runtimeBookTopCandidateGames: 1000,
    runtimeBookBookExhausted: false,
    runtimeBookFallbackUsed: false,
    runtimeBookFallbackAuthority: null,
    candidateSource: "local_runtime_package",
    stage2ApprovedContentEnabled: false,
    stage2CoachingResolverEnabled: true,
    stage2SafeFallbackEnabled: true,
    presentationFrame: {
      visual: { shouldRender: true, source: "fallback_current_surface" },
      coach: { shouldRender: true, owner: "intent_first_coach", title: "Status", body: "Ready" },
      legacy: {},
    },
    visibleTeachingSurface: {
      owner: "v28_visible_surface",
      mode: "assisted",
      coach: { shouldRender: true, title: "Status", body: "Ready" },
      visual: { lines: [] },
      actions: [],
    },
    eventLog: [],
  } as any);

  const runtime = (snapshot as any).runtime;
  assert.equal(runtime.lineSelectionSource, "local_runtime_package");
  assert.equal(runtime.lineSelectionWeighted, true);
  assert.equal(runtime.lineSelectionContentGated, false);
  assert.equal(runtime.lineSelectionRuntimeBacked, true);
  assert.equal(runtime.candidateSource, "local_runtime_package");
  assert.equal(runtime.liveLichessCalled, false);
  assert.equal(runtime.openingSelectionMode, "runtime_weighted");
  assert.equal(runtime.openingSelectionSource, "local_runtime_package");
  assert.equal(runtime.openingSelectionEligibleCount, 21);

  const copyEverything = buildDebugCopyEverythingPayload(snapshot);
  assert.equal((copyEverything as any).runtime.lineSelectionSource, "local_runtime_package");
  assert.equal((copyEverything as any).runtime.lineSelectionWeighted, true);
  assert.equal((copyEverything as any).runtime.lineSelectionContentGated, false);
  assert.equal((copyEverything as any).runtime.lineSelectionRuntimeBacked, true);
  assert.equal((copyEverything as any).runtime.openingSelectionMode, "runtime_weighted");
  assert.equal((copyEverything as any).runtime.openingSelectionSource, "local_runtime_package");
}

testStage2RuntimeLineSelectionNotContentGated();
console.log("stage2RuntimeLineSelectionNotContentGated ok");
