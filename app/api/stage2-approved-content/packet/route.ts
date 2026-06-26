import { NextResponse } from "next/server";

import { resolveStage2ApprovedContentPacketCollection } from "@/lib/blundr/stage2ApprovedContent/stage2ApprovedContentPackage";
import type { Stage2ApprovedContentResolverRequest } from "@/lib/blundr/stage2ApprovedContent/stage2ApprovedContentTypes";
import type { CoachingSurface } from "@/lib/blundr/stage2Coaching/stage2CoachingTypes";

export const dynamic = "force-dynamic";

const SURFACES = new Set<CoachingSurface>([
  "assisted",
  "plain_hint",
  "plain_show_more",
  "review",
  "debug_only",
]);

function jsonNoStore(body: unknown, init?: ResponseInit): NextResponse {
  const response = NextResponse.json(body, init);
  response.headers.set("Cache-Control", "no-store");
  return response;
}

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

export async function POST(request: Request): Promise<Response> {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return jsonNoStore({ error: "invalid_json" }, { status: 400 });
  }

  const validated = validateApprovedContentPacketPayload(body);
  if (validated.ok === false) {
    return jsonNoStore({ error: validated.reason }, { status: 400 });
  }

  return jsonNoStore(resolveStage2ApprovedContentPacketCollection(validated.value));
}

export async function GET(): Promise<Response> {
  return jsonNoStore({ error: "method_not_allowed" }, { status: 405 });
}
