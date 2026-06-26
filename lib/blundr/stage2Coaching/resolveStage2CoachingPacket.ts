import { buildSafeStage2FallbackPacket } from "./buildSafeStage2FallbackPacket";
import {
  STAGE2_APPROVED_CONTENT_ENABLED,
  STAGE2_COACHING_RESOLVER_ENABLED,
  STAGE2_SAFE_FALLBACK_ENABLED,
} from "./stage2CoachingFlags";
import type { Stage2CoachContext, Stage2CoachingPacketResolution } from "./stage2CoachingTypes";

const APPROVED_CONTENT_CLIENT_DEFERRED_REASON = "approved_content_deferred_from_client_bundle";

/**
 * Client-safe Stage 2 coaching resolver.
 *
 * Important:
 * - Do not import ../stage2ApprovedContent here.
 * - Do not import stage2ApprovedContentPackage.generated here.
 * - This file is reachable from the app/page.tsx client graph through debug/feature-trace paths.
 *
 * The full approved-content package is a large generated presentation/copy payload.
 * Pulling it into this synchronous resolver ships the approved-content monolith in
 * the initial browser bundle and causes severe Codespaces/Next dev cold-load stalls.
 *
 * Until approved content is served through an async/API/lazy boundary, the live
 * client resolver must use safe fallback copy. This preserves runtime move authority:
 * restricted training moves still come from runtime line data, not approved copy.
 */
export function resolveStage2CoachingPacket(context: Stage2CoachContext): Stage2CoachingPacketResolution {
  if (!STAGE2_COACHING_RESOLVER_ENABLED) {
    return { kind: "none", reason: "resolver_disabled" };
  }

  if (!STAGE2_APPROVED_CONTENT_ENABLED) {
    return { kind: "none", reason: "approved_content_disabled" };
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
