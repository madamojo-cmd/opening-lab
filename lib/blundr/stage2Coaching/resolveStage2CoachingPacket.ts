import { buildSafeStage2FallbackPacket } from "./buildSafeStage2FallbackPacket";
import { resolveStage2ApprovedContentPacket } from "../stage2ApprovedContent/stage2ApprovedContentPackage";
import {
  STAGE2_APPROVED_CONTENT_ENABLED,
  STAGE2_COACHING_RESOLVER_ENABLED,
  STAGE2_SAFE_FALLBACK_ENABLED,
} from "./stage2CoachingFlags";
import type { Stage2CoachContext, Stage2CoachingPacketEntry, Stage2CoachingPacketResolution } from "./stage2CoachingTypes";

const APPROVED_CONTENT_CLIENT_DEFERRED_REASON = "approved_content_exact_match_not_found";

/**
 * Client-safe Stage 2 coaching resolver.
 *
 * Important:
 * Exact approved content is authoritative when its position, move, surface,
 * runtime reconciliation, approval, and safety metadata all match. Fallback is
 * considered only after that exact lookup returns no verified packet.
 */
export function resolveStage2CoachingPacket(context: Stage2CoachContext): Stage2CoachingPacketResolution {
  if (!STAGE2_COACHING_RESOLVER_ENABLED) {
    return { kind: "none", reason: "resolver_disabled" };
  }

  if (!STAGE2_APPROVED_CONTENT_ENABLED) {
    return { kind: "none", reason: "approved_content_disabled" };
  }

  if (context.openingId && context.targetUci) {
    const approved = resolveStage2ApprovedContentPacket({
      openingId: context.openingId,
      playKeyBefore: context.playKeyBefore,
      playKey: context.playKey,
      targetUci: context.targetUci,
      targetSan: context.targetSan,
      learnerSide: context.learnerSide,
      sideToMove: context.sideToMove,
      surface: context.surface,
    });
    if (approved.kind === "approved_packet") {
      return { kind: "approved_packet", packet: approved.packet as unknown as Stage2CoachingPacketEntry };
    }
  }

  if (!STAGE2_SAFE_FALLBACK_ENABLED) {
    return { kind: "none", reason: APPROVED_CONTENT_CLIENT_DEFERRED_REASON };
  }

  return {
    kind: "safe_fallback",
    packet: buildSafeStage2FallbackPacket({
      ...context,
      runtimeBook: {
        ...(context.runtimeBook ?? {}),
        status: context.runtimeBook?.status ?? APPROVED_CONTENT_CLIENT_DEFERRED_REASON,
      },
    }),
  };
}
