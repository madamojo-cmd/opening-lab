import assert from "node:assert/strict";

import { buildDebugCopyEverythingPayload } from "../../components/debug/BlundrDiagnosticsPanel";
import { buildTrainerDebugSnapshot } from "../../lib/blundr/debug/trainerDebugSnapshot";
import {
  STAGE2_APPROVED_CONTENT_INVENTORY,
  getStage2ApprovedContentInventoryEntry,
  getStage2ApprovedContentInventorySummary,
} from "../../lib/blundr/stage2Coaching";

export function testStage2ApprovedContentInventory(): void {
  const summary = getStage2ApprovedContentInventorySummary();
  assert.equal(STAGE2_APPROVED_CONTENT_INVENTORY.length, 21);
  assert.equal(summary.approvedContentInventoryCount, 21);
  assert.equal(summary.approvedContentMatchedCount, 21);
  assert.equal(summary.approvedContentAvailableCount, 21);
  assert.equal(summary.sampleCount, 0);
  assert.equal(summary.draftCount, 0);
  assert.equal(summary.blockedCount, 0);
  assert.equal(summary.fallbackOnlyCount, 0);
  assert.equal(summary.runtimeMatchedCount, 21);
  assert.equal(summary.targetMatchedCount, 21);
  assert.equal(summary.plainViewSafeCount, 21);
  assert.equal(summary.visualRecipeAvailableCount, 21);

  for (const entry of STAGE2_APPROVED_CONTENT_INVENTORY) {
    assert.equal(Boolean(entry.openingId), true, `opening_id_missing:${entry.openingId}`);
    assert.equal(entry.approvedContentAvailable, true, `approved_content_should_be_available:${entry.openingId}`);
    assert.equal(entry.runtimeMatched, true, `runtime_must_remain_matched:${entry.openingId}`);
    assert.equal(entry.targetMatched, true, `target_should_be_available:${entry.openingId}`);
    assert.equal(entry.plainViewSafe, true, `plain_view_should_be_safe:${entry.openingId}`);
    assert.equal(entry.visualRecipeAvailable, true, `visual_recipe_should_be_available:${entry.openingId}`);
    assert.equal(Boolean(entry.reasonNotApproved), false, `reason_not_approved_should_not_exist:${entry.openingId}`);
  }

  const approved = getStage2ApprovedContentInventoryEntry("italian-white");
  assert.equal(approved?.status, "approved");
  assert.equal(approved?.reasonNotApproved, undefined);

  const snapshot = buildTrainerDebugSnapshot({
    debugEnabled: true,
    trainerFrameId: 901,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: true,
    fen: "rnbqkbnr/pp2pppp/8/2pp4/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3",
    selectedOpeningId: "italian-white",
    stage2ApprovedContentEnabled: false,
    stage2CoachingResolverEnabled: true,
    stage2SafeFallbackEnabled: true,
    stage2CoachingPacketKind: "safe_fallback",
    stage2CoachingSafetyStatus: "safe",
    stage2CoachingSurface: "assisted",
    stage2CoachingSourceFile: "stage2://safe-fallback",
    stage2CoachingRuntimeMatched: true,
    stage2CoachingTargetMatched: false,
    stage2CoachingPlainViewSafe: false,
    stage2CoachingReasonRejected: "reconciled_partial_source_not_approved:italian-white",
    runtimeBookQueried: true,
    runtimeBookOpeningId: "italian-white",
    runtimeBookPlayKeyBefore: "e2e4,e7e5,g1f3,b8c6",
    runtimeBookStatus: "ready",
    runtimeBookCandidateCount: 1,
    runtimeBookTopCandidateUci: "f1c4",
    runtimeBookTopCandidateSan: "Bc4",
    runtimeBookTopCandidateRank: 1,
    runtimeBookTopCandidateGames: 1234,
    runtimeBookBookExhausted: false,
    runtimeBookFallbackUsed: false,
    runtimeBookFallbackAuthority: null,
    stage2ApprovedContentEnabled: true,
    presentationFrame: { visual: { shouldRender: true, source: "continuation_candidate" }, coach: { owner: "intent_first_coach" }, legacy: {} },
    eventLog: [],
  } as any);

  assert.equal((snapshot as any).runtime.approvedContentInventoryCount, 21);
  assert.equal((snapshot as any).runtime.approvedContentMatchedCount, 21);
  assert.equal((snapshot as any).runtime.selectedOpeningApprovedContentAvailable, true);
  assert.equal((snapshot as any).runtime.selectedOpeningContentStatus, "approved");

  const copyEverything = buildDebugCopyEverythingPayload(snapshot);
  assert.equal((copyEverything as any).runtime.approvedContentInventoryCount, 21);
  assert.equal((copyEverything as any).runtime.approvedContentMatchedCount, 21);
  assert.equal((copyEverything as any).runtime.selectedOpeningApprovedContentAvailable, true);
  assert.equal((copyEverything as any).stage2Coaching.reasonRejected, null);
}

testStage2ApprovedContentInventory();
console.log("stage2ApprovedContentInventory ok");
