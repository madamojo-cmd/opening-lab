import assert from "node:assert/strict";

import { buildDebugCopyEverythingPayload } from "../../components/debug/BlundrDiagnosticsPanel";
import { buildTrainerDebugSnapshot } from "../../lib/blundr/debug/trainerDebugSnapshot";
import { getPendingPromotionFromAttempt, resolvePromotionAuthority } from "../../lib/blundr/runtime/promotionAuthority";

const WHITE_PROMOTION_FEN = "8/2P1k3/8/8/8/8/8/4K3 w - - 0 1";
const BLACK_PROMOTION_FEN = "4k3/8/8/8/8/8/2p5/4K3 b - - 0 1";

export function testPromotionPickerAuthority(): void {
  const whitePending = getPendingPromotionFromAttempt({
    fen: WHITE_PROMOTION_FEN,
    from: "c7",
    to: "c8",
    color: "w",
  });
  assert.ok(whitePending, "white pawn promotion attempt should expose a pending picker");
  assert.deepEqual(whitePending?.legalPromotionUcis, ["c7c8b", "c7c8n", "c7c8q", "c7c8r"]);

  const blackPending = getPendingPromotionFromAttempt({
    fen: BLACK_PROMOTION_FEN,
    from: "c2",
    to: "c1",
    color: "b",
  });
  assert.ok(blackPending, "black pawn promotion attempt should expose a pending picker");
  assert.deepEqual(blackPending?.legalPromotionUcis, ["c2c1b", "c2c1n", "c2c1q", "c2c1r"]);

  const exactMatch = resolvePromotionAuthority({
    attemptedPromotionUci: "c7c8q",
    acceptedPromotionUci: "c7c8q",
    authorityPromotionUci: "c7c8q",
  });
  assert.equal(exactMatch.promotionAuthorityMatched, true);
  assert.equal(exactMatch.promotionAuthorityMismatchReason, null);
  assert.equal(exactMatch.selectedPromotionPiece, "q");

  const suffixMismatch = resolvePromotionAuthority({
    attemptedPromotionUci: "c7c8q",
    acceptedPromotionUci: "c7c8q",
    authorityPromotionUci: "c7c8r",
  });
  assert.equal(suffixMismatch.promotionAuthorityMatched, false);
  assert.equal(suffixMismatch.promotionAuthorityMismatchReason, "promotion_suffix_mismatch");
  assert.equal(suffixMismatch.selectedPromotionPiece, "q");

  const snapshot = buildTrainerDebugSnapshot({
    debugEnabled: true,
    trainerFrameId: 7,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "continuation",
    isUserTurn: true,
    fen: WHITE_PROMOTION_FEN,
    instructionTargetUci: "c7c8q",
    expectedMoveUci: "c7c8q",
    expectedMoveSan: "c8=Q",
    coachMoveUci: "c7c8q",
    visualMoveUci: "c7c8q",
    revealTargetUci: "c7c8q",
    pendingPromotion: whitePending,
    promotionPickerRendered: true,
    promotionOptions: whitePending?.legalPromotionUcis ?? [],
    selectedPromotionPiece: "q",
    attemptedPromotionUci: "c7c8q",
    acceptedPromotionUci: "c7c8q",
    promotionAuthorityMatched: true,
    promotionAuthorityMismatchReason: null,
    promotionAuthorityTargetUci: "c7c8q",
    runtimeBookQueried: true,
    runtimeBookOpeningId: "promotion-test",
    runtimeBookPlayKeyBefore: "c7c8",
    runtimeBookStatus: "ready",
    runtimeBookCandidateCount: 1,
    runtimeBookTopCandidateUci: "c7c8q",
    runtimeBookBookExhausted: false,
    coachDecision: {
      shouldShowCoachCard: true,
      title: "Promote",
      body: "Choose a promotion piece.",
      debug: { coachDecisionSource: "live_coach", coachMoveUci: "c7c8q" },
    },
    presentationFrame: { visual: { shouldRender: true, source: "continuation_candidate", lines: [{ from: "c7", to: "c8" }] }, coach: { shouldRender: true, owner: "intent_first_coach" }, legacy: {} },
    visibleTeachingSurface: {
      owner: "v28_visible_surface",
      mode: "assisted",
      coach: { shouldRender: true, title: "Promote", body: "Choose a promotion piece." },
      visual: { lines: [{ from: "c7", to: "c8" }] },
      actions: [{ kind: "hint" }],
    },
    boardLines: [{ from: "c7", to: "c8" }],
    visualRecipe: { fen: WHITE_PROMOTION_FEN, moveUci: "c7c8q" },
    visualRecipeOverlay: { visibleSurfaceMode: "assisted", recipeFrameMatchesBoard: true, recipeFenMatchesBoard: true, adapterAllowed: true } as any,
    visualRecipePlayback: { playbackKey: "promo", animationState: "idle", lines: [], squares: [], replayAvailable: false, animationReducedMotion: false, animationSkippedToEnd: false, animationClearedReason: null, animationSuppressedReason: null, recipeFrameMatchesBoard: true, recipeFenMatchesBoard: true, tacticalPrimitivesRendered: false } as any,
    eventLog: [],
  } as any);

  assert.equal((snapshot as any).promotion.pendingPromotion.from, "c7");
  assert.equal((snapshot as any).promotion.promotionPickerRendered, true);
  assert.deepEqual((snapshot as any).promotion.promotionOptions, ["c7c8b", "c7c8n", "c7c8q", "c7c8r"]);
  assert.equal((snapshot as any).promotion.selectedPromotionPiece, "q");
  assert.equal((snapshot as any).promotion.attemptedPromotionUci, "c7c8q");
  assert.equal((snapshot as any).promotion.acceptedPromotionUci, "c7c8q");
  assert.equal((snapshot as any).promotion.promotionAuthorityMatched, true);
  assert.equal((snapshot as any).promotion.promotionAuthorityMismatchReason, null);

  const copyEverything = buildDebugCopyEverythingPayload(snapshot);
  assert.equal((copyEverything as any).promotion.attemptedPromotionUci, "c7c8q");
  assert.equal((copyEverything as any).promotion.acceptedPromotionUci, "c7c8q");
  assert.equal((copyEverything as any).promotion.promotionPickerRendered, true);
  assert.doesNotThrow(() => buildDebugCopyEverythingPayload(null));
  assert.doesNotThrow(() => buildDebugCopyEverythingPayload(undefined));

  const blackSnapshot = buildTrainerDebugSnapshot({
    debugEnabled: true,
    trainerFrameId: 8,
    trainerPhase: "ready_for_user",
    trainerView: "plain",
    trainingMode: "restricted",
    isUserTurn: true,
    fen: BLACK_PROMOTION_FEN,
    pendingPromotion: blackPending,
    promotionPickerRendered: true,
    promotionOptions: blackPending?.legalPromotionUcis ?? [],
    selectedPromotionPiece: "n",
    attemptedPromotionUci: "c2c1n",
    acceptedPromotionUci: "c2c1n",
    promotionAuthorityMatched: true,
    promotionAuthorityMismatchReason: null,
    promotionAuthorityTargetUci: "c2c1n",
    presentationFrame: { visual: { shouldRender: false, source: "none" }, coach: { shouldRender: true, owner: "intent_first_coach" }, legacy: {} },
    visibleTeachingSurface: {
      owner: "v28_visible_surface",
      mode: "plain_before_show_more",
      coach: { shouldRender: true, title: "Promotion", body: "Pick the promotion piece." },
      visual: { lines: [] },
      actions: [{ kind: "hint" }],
    },
    eventLog: [],
  } as any);
  assert.equal((blackSnapshot as any).promotion.pendingPromotion.to, "c1");
  assert.equal((blackSnapshot as any).promotion.selectedPromotionPiece, "n");
}

testPromotionPickerAuthority();
