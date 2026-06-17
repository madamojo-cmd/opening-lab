import assert from "node:assert/strict";

import { resolvePromotionAuthority } from "../../lib/blundr/runtime/promotionAuthority";
import { buildLegacyAuditFrameResolution } from "./stage2LegacyNoBypassTestHelpers";

export function testStage2LegacyNoPromotionBypass(): void {
  const exact = resolvePromotionAuthority({
    attemptedPromotionUci: "c7c8q",
    acceptedPromotionUci: "c7c8q",
    authorityPromotionUci: "c7c8q",
  });
  assert.equal(exact.promotionAuthorityMatched, true);
  assert.equal(exact.selectedPromotionPiece, "q");

  const suffixMismatch = resolvePromotionAuthority({
    attemptedPromotionUci: "c7c8r",
    acceptedPromotionUci: "c7c8r",
    authorityPromotionUci: "c7c8q",
  });
  assert.equal(suffixMismatch.promotionAuthorityMatched, false);
  assert.equal(suffixMismatch.promotionAuthorityMismatchReason, "promotion_suffix_mismatch");

  const strippedSuffix = resolvePromotionAuthority({
    attemptedPromotionUci: "c7c8",
    acceptedPromotionUci: "c7c8",
    authorityPromotionUci: "c7c8q",
  });
  assert.equal(strippedSuffix.promotionAuthorityMatched, false);
  assert.equal(strippedSuffix.promotionAuthorityMismatchReason, "promotion_suffix_mismatch");

  const frame = buildLegacyAuditFrameResolution({
    instructionTargetUci: "c7c8q",
    instructionTargetSan: "c8=Q",
    coachMoveUci: "c7c8q",
    acceptedTargetUci: "c7c8q",
    promotionAuthorityTargetUci: "c7c8q",
    promotionAuthorityMatched: true,
    promotionAuthorityMismatchReason: null,
    selectedPromotionPiece: "q",
    attemptedPromotionUci: "c7c8q",
    acceptedPromotionUci: "c7c8q",
  } as any);
  assert.equal(frame.acceptedTargetUci, "c7c8q");
  assert.equal(frame.promotion.acceptedTargetUci, "c7c8q");
  assert.equal(frame.promotion.promotionAuthorityMatched, true);
}

testStage2LegacyNoPromotionBypass();
console.log("stage2LegacyNoPromotionBypass ok");

