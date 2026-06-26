import type { Stage2ApprovedContentResolverRequest } from "./stage2ApprovedContentTypes";
import type { CoachingSurface } from "../stage2Coaching/stage2CoachingTypes";

const SURFACES = new Set<CoachingSurface>([
  "assisted",
  "plain_hint",
  "plain_show_more",
  "review",
  "debug_only",
]);

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function normalizeNullableText(value: unknown): string | null {
  const text = normalizeText(value);
  return text.length > 0 ? text : null;
}

export function validateApprovedContentPacketPayload(
  body: any,
): { ok: true; value: Stage2ApprovedContentResolverRequest } | { ok: false; reason: string } {
  const openingId = normalizeText(body?.openingId);
  if (!openingId) return { ok: false, reason: "invalid_opening_id" };

  const targetUci = normalizeText(body?.targetUci).toLowerCase();
  if (!/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(targetUci)) return { ok: false, reason: "invalid_target_uci" };

  const surface = normalizeText(body?.surface) as CoachingSurface;
  if (!SURFACES.has(surface)) return { ok: false, reason: "invalid_surface" };

  return {
    ok: true,
    value: {
      openingId,
      targetUci,
      surface,
      playKeyBefore: normalizeNullableText(body?.playKeyBefore),
      playKey: normalizeNullableText(body?.playKey),
      targetSan: normalizeNullableText(body?.targetSan),
      learnerSide: normalizeNullableText(body?.learnerSide),
      sideToMove: normalizeNullableText(body?.sideToMove),
      approvedPacketsPath: normalizeNullableText(body?.approvedPacketsPath),
    },
  };
}
