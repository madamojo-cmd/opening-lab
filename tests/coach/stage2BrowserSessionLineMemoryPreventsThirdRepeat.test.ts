import assert from "node:assert/strict";

import { buildTrainerDebugSnapshot } from "../../lib/blundr/debug/trainerDebugSnapshot";
import {
  selectRuntimeWeightedTrainingLineSelection,
  updateRuntimeTrainingLineKeys,
} from "../../lib/blundr/openings/runtimeTrainableRepertoires";

function findSelection(
  repertoire: { id: string; name: string; color: "white" | "black"; description: string; lines: string[][] },
  recentLineKeys: string[],
  predicate: (selection: NonNullable<ReturnType<typeof selectRuntimeWeightedTrainingLineSelection>>) => boolean,
): { seed: string; selection: NonNullable<ReturnType<typeof selectRuntimeWeightedTrainingLineSelection>> } {
  for (let index = 0; index < 256; index += 1) {
    const seed = `stage2-browser-session-${index}`;
    const selection = selectRuntimeWeightedTrainingLineSelection({
      openingId: repertoire.id,
      repertoire,
      recentLineKeys,
      seed,
    });
    if (selection && predicate(selection)) {
      return { seed, selection };
    }
  }
  throw new Error("no_runtime_selection_found");
}

export function testStage2BrowserSessionLineMemoryPreventsThirdRepeat(): void {
  const repertoire = {
    id: "session-memory-open",
    name: "Session Memory Open",
    color: "white",
    description: "Synthetic repertoire for browser session memory coverage.",
    lines: [
      ["e4", "e5", "Nf3", "Nc6"],
      ["d4", "d5", "c4", "e6"],
      ["c4", "e5", "Nc3", "Nf6"],
    ],
  } as const;

  const game1 = findSelection(repertoire as any, [], () => true);
  const lineA = game1.selection.selectedLineKey;
  const recentAfterGame1 = updateRuntimeTrainingLineKeys([], lineA);

  const game2 = findSelection(repertoire as any, recentAfterGame1, (selection) => selection.selectedLineKey === lineA);
  const recentAfterGame2 = updateRuntimeTrainingLineKeys(recentAfterGame1, game2.selection.selectedLineKey);

  const game3 = findSelection(repertoire as any, recentAfterGame2, (selection) => selection.selectedLineKey !== lineA);

  assert.equal(game1.selection.recentLineKeys.length, 0);
  assert.equal(game2.selection.selectedLineKey, lineA);
  assert.equal(game3.selection.selectedLineKey === lineA, false);
  assert.equal(game3.selection.blockedThirdRepeatLineKeys.length, 1);
  assert.equal(game3.selection.blockedThirdRepeatLineKeys[0], lineA);
  assert.equal(game3.selection.variationReason, "third_consecutive_repeat_excluded");
  assert.equal(game3.selection.repeatUnavoidable, false);

  const snapshot = buildTrainerDebugSnapshot({
    debugEnabled: true,
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    trainerFrameId: 732,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: true,
    selectedOpeningId: repertoire.id,
    selectedLineId: game3.selection.selectedLineId,
    selectedRuntimeLineId: game3.selection.selectedLineId,
    selectedRuntimeLineKey: game3.selection.selectedLineKey,
    selectedRuntimeLinePlayKey: game3.selection.selectedPlayKey,
    selectedRuntimeLinePlaySequenceUci: game3.selection.selectedPlaySequenceUci,
    lineSelectionRecentLineKeys: recentAfterGame2,
    lineSelectionBlockedThirdRepeatLineKeys: game3.selection.blockedThirdRepeatLineKeys,
    lineSelectionSelectedLineKey: game3.selection.selectedLineKey,
    lineSelectionPreviousTwoSame: true,
    lineSelectionSessionId: "learn-s-game-3",
    lineSelectionVariationReason: game3.selection.variationReason,
    lineSelectionRepeatUnavoidable: game3.selection.repeatUnavoidable,
    lineSelectionSeed: game3.seed,
    selectedRuntimeLinePlyLength: game3.selection.selectedPlaySequenceUci.length,
    selectedRuntimeLineCurrentPly: 0,
    selectedRuntimeLineExhausted: false,
    terminalProofLineAuthority: "selected_runtime_line_play_sequence_uci",
    terminalProofBlockedReason: "runtime_line_not_exhausted",
    runtimeBookQueried: true,
    runtimeBookOpeningId: repertoire.id,
    runtimeBookPlayKeyBefore: null,
    runtimeBookStatus: "ready",
    runtimeBookCandidateCount: 3,
    runtimeBookBookExhausted: false,
    lineSelectionMode: game3.selection.mode,
    lineSelectionSource: game3.selection.source,
    lineSelectionWeighted: game3.selection.weighted,
    lineSelectionContentGated: game3.selection.contentGated,
    lineSelectionRuntimeBacked: true,
    lineSelectionEligibleCount: game3.selection.eligibleCount,
    lineSelectionEligibleLineIds: game3.selection.eligibleLineIds,
    lineSelectionEligibleLineKeys: game3.selection.eligibleLineKeys,
    selectedLineCompleteConfirmed: false,
    branchTransitionSurfaceRendered: false,
    continueFromHereAvailable: false,
    continueFromHereButtonRendered: false,
    branchCompleteEligible: false,
    branchCompleteReason: null,
    branchCompleteBlockedReason: null,
    explicitCuratedTerminalNode: false,
    exactNodeHasChildren: true,
    hasNextOpponentMove: true,
    hasNextUserMove: false,
    visibleTeachingSurface: {
      owner: "v28_visible_surface",
      mode: "guided_move",
      coach: { shouldRender: true, title: "Opening plan", body: "Play the next move.", buttons: [] },
      visual: { lines: [] },
      actions: [],
      safety: { blocked: false, criticalIssues: [] },
      debug: {
        visibleCoachOwner: "visible_surface_v28",
        visibleVisualOwner: "visible_surface_v28",
        visibleActionOwner: "visible_surface_v28",
      },
    },
    presentationFrame: {
      coach: { shouldRender: true, owner: "intent_first_coach", title: "Opening plan", body: "Play the next move.", buttons: [] },
      visual: { shouldRender: true, source: "fallback_current_surface" },
      legacy: {},
    },
    coachDecision: {
      shouldShowCoachCard: true,
      title: "Opening plan",
      body: "Play the next move.",
      buttons: [],
      debug: {
        coachDecisionSource: "visible_surface_v28",
        coachMoveUci: null,
        coachPieceType: null,
        coachQuality: { qualityScore: 90, targetAligned: false, pieceAligned: false, containsDebugLeak: false },
      },
    },
    actualCoachCardTitle: "Opening plan",
    actualCoachCardBody: "Play the next move.",
    actualCoachCardButtons: [],
    actualCoachCardSource: "surfaceCoachCardDecision",
    actualVisualSource: "fallback_current_surface",
    renderedActionIds: [],
    surfaceActionIds: [],
    renderedVisualPrimitiveCount: 0,
    surfaceVisualPrimitiveCount: 0,
    coachQuality: {
      qualityScore: 90,
      qualityScoreSource: "final_rendered",
      source: "final_rendered",
      targetAligned: false,
      pieceAligned: false,
      usedFallback: false,
      containsDebugLeak: false,
    },
    eventLog: [],
  } as any);

  assert.equal((snapshot.runtime as any)?.lineSelectionRecentLineKeys.join("|"), recentAfterGame2.join("|"));
  assert.equal((snapshot.runtime as any)?.lineSelectionSelectedLineKey, game3.selection.selectedLineKey);
  assert.equal((snapshot.runtime as any)?.lineSelectionPreviousTwoSame, true);
  assert.equal((snapshot.runtime as any)?.lineSelectionBlockedThirdRepeatLineKeys[0], lineA);
  assert.equal((snapshot.runtime as any)?.lineSelectionVariationReason, "third_consecutive_repeat_excluded");
  assert.equal((snapshot.runtime as any)?.lineSelectionRepeatUnavoidable, false);
  assert.equal((snapshot.runtime as any)?.lineSelectionSeed, game3.seed);
  assert.equal((snapshot.runtime as any)?.lineSelectionSessionId, "learn-s-game-3");
}

testStage2BrowserSessionLineMemoryPreventsThirdRepeat();
console.log("stage2BrowserSessionLineMemoryPreventsThirdRepeat ok");
