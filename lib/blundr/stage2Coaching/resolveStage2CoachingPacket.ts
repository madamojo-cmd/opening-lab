import { buildSafeStage2FallbackPacket } from "./buildSafeStage2FallbackPacket";
import {
  STAGE2_APPROVED_CONTENT_ENABLED,
  STAGE2_COACHING_RESOLVER_ENABLED,
  STAGE2_SAFE_FALLBACK_ENABLED,
} from "./stage2CoachingFlags";
import type { Stage2CoachContext, Stage2CoachingPacketResolution } from "./stage2CoachingTypes";
import { resolveStage2ApprovedContentPacketCollection } from "../stage2ApprovedContent";

export function resolveStage2CoachingPacket(context: Stage2CoachContext): Stage2CoachingPacketResolution {
  if (!STAGE2_COACHING_RESOLVER_ENABLED) {
    return { kind: "none", reason: "resolver_disabled" };
  }

  if (!STAGE2_APPROVED_CONTENT_ENABLED) {
    return { kind: "none", reason: "approved_content_disabled" };
  }

  const approvedResolution = resolveStage2ApprovedContentPacketCollection({
    openingId: context.openingId ?? "",
    playKeyBefore: context.playKeyBefore ?? null,
    playKey: context.playKey ?? null,
    targetUci: context.targetUci ?? "",
    targetSan: context.targetSan ?? null,
    learnerSide: context.learnerSide ?? null,
    sideToMove: context.sideToMove ?? null,
    surface: context.surface,
  });
  if (approvedResolution.kind === "approved_packet") {
    return approvedResolution as unknown as Stage2CoachingPacketResolution;
  }

  if (!STAGE2_SAFE_FALLBACK_ENABLED) {
    return { kind: "none", reason: "safe_fallback_disabled" };
  }

  return {
    kind: "safe_fallback",
    packet: buildSafeStage2FallbackPacket(context),
  };
}
