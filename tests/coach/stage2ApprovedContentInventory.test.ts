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
  assert.equal(summary.approvedContentMatchedCount, 0);
  assert.equal(summary.approvedContentAvailableCount, 0);
  assert.equal(summary.sampleCount, 3);
  assert.equal(summary.draftCount, 18);
  assert.equal(summary.blockedCount, 0);
  assert.equal(summary.fallbackOnlyCount, 0);
  assert.equal(summary.runtimeMatchedCount, 21);
  assert.equal(summary.targetMatchedCount, 0);
  assert.equal(summary.plainViewSafeCount, 0);
  assert.equal(summary.visualRecipeAvailableCount, 0);

  for (const entry of STAGE2_APPROVED_CONTENT_INVENTORY) {
    assert.equal(Boolean(entry.openingId), true, `opening_id_missing:${entry.openingId}`);
    assert.equal(entry.approvedContentAvailable, false, `approved_content_should_not_be_faked:${entry.openingId}`);
    assert.equal(entry.runtimeMatched, true, `runtime_must_remain_matched:${entry.openingId}`);
    assert.equal(entry.targetMatched, false, `target_should_not_be_faked:${entry.openingId}`);
    assert.equal(entry.plainViewSafe, false, `plain_view_safe_should_not_be_faked:${entry.openingId}`);
    assert.equal(entry.visualRecipeAvailable, false, `visual_recipe_should_not_be_faked:${entry.openingId}`);
    assert.equal(Boolean(entry.reasonNotApproved), true, `reason_not_approved_missing:${entry.openingId}`);
  }

  const sample = getStage2ApprovedContentInventoryEntry("italian-white");
  assert.equal(sample?.status, "sample");
  assert.equal(sample?.reasonNotApproved, "reconciled_partial_source_not_approved:italian-white");

  const draft = getStage2ApprovedContentInventoryEntry("london-white");
  assert.equal(draft?.status, "draft");
  assert.equal(draft?.reasonNotApproved, "draft_source_not_approved:london-white");

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
    presentationFrame: { visual: { shouldRender: true, source: "continuation_candidate" }, coach: { owner: "intent_first_coach" }, legacy: {} },
    eventLog: [],
  } as any);

  assert.equal((snapshot as any).runtime.approvedContentInventoryCount, 21);
  assert.equal((snapshot as any).runtime.approvedContentMatchedCount, 0);
  assert.equal((snapshot as any).runtime.selectedOpeningApprovedContentAvailable, false);
  assert.equal((snapshot as any).runtime.selectedOpeningContentStatus, "sample");

  const copyEverything = buildDebugCopyEverythingPayload(snapshot);
  assert.equal((copyEverything as any).runtime.approvedContentInventoryCount, 21);
  assert.equal((copyEverything as any).runtime.approvedContentMatchedCount, 0);
  assert.equal((copyEverything as any).runtime.selectedOpeningApprovedContentAvailable, false);
  assert.equal((copyEverything as any).stage2Coaching.reasonRejected, "reconciled_partial_source_not_approved:italian-white");
}

testStage2ApprovedContentInventory();
console.log("stage2ApprovedContentInventory ok");
