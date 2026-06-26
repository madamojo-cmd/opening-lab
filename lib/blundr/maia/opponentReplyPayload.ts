import type { MaiaRuntimeMoveRequest } from "./maiaRuntimeTypes";
import type { MaiaSkillLevel } from "./maiaTypes";
import { validateFen } from "chess.js";

import { STAGE2_RATING_BANDS } from "../ratings/ratingBands";

const SKILLS = new Set<MaiaSkillLevel>([
  "maia-1100",
  "maia-1200",
  "maia-1300",
  "maia-1400",
  "maia-1500",
  "maia-1600",
  "maia-1700",
  "maia-1800",
  "maia-1900",
]);

function normalizeUci(uci: unknown): string | null {
  const value = String(uci ?? "").trim().toLowerCase();
  return /^[a-h][1-8][a-h][1-8][qrbn]?$/.test(value) ? value : null;
}

function normalizeFen4(fen: string): string {
  return String(fen ?? "").trim().split(/\s+/).slice(0, 4).join(" ");
}

function normalizeRequestedRating(value: unknown): number | null {
  if (value === null || value === undefined || String(value).trim() === "") return null;
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  return Math.max(1000, Math.min(2500, Math.round(numeric)));
}

function isKnownRatingBandId(value: string): boolean {
  const normalized = String(value ?? "").trim().toLowerCase();
  return STAGE2_RATING_BANDS.some((band) => band.id === normalized || band.value === normalized);
}

export function validateOpponentReplyPayload(body: any): { ok: true; value: MaiaRuntimeMoveRequest } | { ok: false; reason: string } {
  const requestId = Number(body?.requestId);
  if (!Number.isFinite(requestId) || requestId <= 0 || !Number.isInteger(requestId)) return { ok: false, reason: "invalid_request_id" };

  const fen = String(body?.fen ?? "").trim();
  const fen4 = String(body?.fen4 ?? "").trim();
  if (!fen || !fen4) return { ok: false, reason: "invalid_fen" };
  if (!validateFen(fen).ok || normalizeFen4(fen) !== fen4) return { ok: false, reason: "invalid_fen" };

  const sideToMove = String(body?.sideToMove ?? "").trim().toLowerCase();
  if (sideToMove && sideToMove !== "w" && sideToMove !== "b") return { ok: false, reason: "invalid_side_to_move" };

  const skillLevel = String(body?.skillLevel ?? "") as MaiaSkillLevel;
  if (!SKILLS.has(skillLevel)) return { ok: false, reason: "invalid_skill_level" };

  const requestedTimeoutMs = Number(body?.timeoutMs ?? 1500);
  if (!Number.isFinite(requestedTimeoutMs) || requestedTimeoutMs <= 0) return { ok: false, reason: "invalid_timeout_ms" };
  const timeoutMs = Math.max(250, Math.min(5000, Math.round(requestedTimeoutMs)));

  const rawRatingBandId = typeof body?.ratingBandId === "string" ? body.ratingBandId.trim() : "";
  if (rawRatingBandId && !isKnownRatingBandId(rawRatingBandId)) return { ok: false, reason: "invalid_rating_band_id" };
  const ratingBandId = rawRatingBandId || null;

  const requestedRatingRaw = body?.requestedRating;
  const requestedRating = normalizeRequestedRating(requestedRatingRaw);
  if (requestedRatingRaw !== null && requestedRatingRaw !== undefined && requestedRating === null) {
    return { ok: false, reason: "invalid_requested_rating" };
  }

  const legalMovesRaw = Array.isArray(body?.legalMovesUci) ? body.legalMovesUci : [];
  if (!legalMovesRaw.length || legalMovesRaw.length > 512) return { ok: false, reason: "no_legal_moves" };
  const legalMovesUci = legalMovesRaw.map(normalizeUci).filter(Boolean) as string[];
  if (!legalMovesUci.length) return { ok: false, reason: "no_legal_moves" };

  return {
    ok: true,
    value: {
      requestId,
      fen,
      fen4,
      legalMovesUci,
      skillLevel,
      timeoutMs,
      ratingBandId,
      requestedRating,
    },
  };
}
