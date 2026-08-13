import { Chess, validateFen } from "chess.js";

export const MOVE_CONTRACT_VERSION = "blundr-maia-move.v1";
export const HEALTH_CONTRACT_VERSION = "blundr-maia-health.v1";
export const SKILLS = Object.freeze([
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

const UCI_PATTERN = /^[a-h][1-8][a-h][1-8][qrbn]?$/;

export class ContractError extends Error {
  constructor(code, status = 400) {
    super(code);
    this.name = "ContractError";
    this.code = code;
    this.status = status;
  }
}

export function normalizeUci(value) {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();
  return UCI_PATTERN.test(normalized) ? normalized : null;
}

function moveToUci(move) {
  return `${move.from}${move.to}${move.promotion ?? ""}`.toLowerCase();
}

function equalSets(left, right) {
  if (left.size !== right.size) return false;
  for (const value of left) if (!right.has(value)) return false;
  return true;
}

export function validateMoveRequest(body) {
  const requestId = Number(body?.requestId);
  if (!Number.isSafeInteger(requestId) || requestId <= 0) {
    throw new ContractError("invalid_request_id");
  }

  const fen = String(body?.fen ?? "").trim();
  const fen4 = String(body?.fen4 ?? "").trim();
  if (!validateFen(fen).ok) throw new ContractError("invalid_fen");
  if (fen.split(/\s+/).slice(0, 4).join(" ") !== fen4) {
    throw new ContractError("fen_frame_mismatch", 422);
  }

  const skillLevel = String(body?.skillLevel ?? "").trim();
  if (!SKILLS.includes(skillLevel)) {
    throw new ContractError("invalid_skill_level");
  }

  const timeoutMs = Number(body?.timeoutMs);
  if (!Number.isInteger(timeoutMs) || timeoutMs < 250 || timeoutMs > 5_000) {
    throw new ContractError("invalid_timeout_ms");
  }

  if (!Array.isArray(body?.legalMovesUci)) {
    throw new ContractError("invalid_legal_moves");
  }
  if (body.legalMovesUci.length < 1 || body.legalMovesUci.length > 512) {
    throw new ContractError("invalid_legal_moves");
  }
  const suppliedMoves = body.legalMovesUci.map(normalizeUci);
  if (suppliedMoves.some((move) => !move)) {
    throw new ContractError("invalid_legal_moves");
  }
  const suppliedSet = new Set(suppliedMoves);
  if (suppliedSet.size !== suppliedMoves.length) {
    throw new ContractError("duplicate_legal_moves");
  }

  const chess = new Chess(fen);
  const actualSet = new Set(chess.moves({ verbose: true }).map(moveToUci));
  if (!equalSets(suppliedSet, actualSet)) {
    throw new ContractError("legal_set_mismatch", 422);
  }

  const rawRating = body?.requestedRating;
  const requestedRating =
    rawRating === null || rawRating === undefined ? null : Number(rawRating);
  if (
    requestedRating !== null &&
    (!Number.isInteger(requestedRating) ||
      requestedRating < 1_000 ||
      requestedRating > 2_500)
  ) {
    throw new ContractError("invalid_requested_rating");
  }

  const ratingBandId =
    body?.ratingBandId === null || body?.ratingBandId === undefined
      ? null
      : String(body.ratingBandId).trim();
  if (
    ratingBandId !== null &&
    !/^[a-z0-9][a-z0-9_-]{0,63}$/.test(ratingBandId)
  ) {
    throw new ContractError("invalid_rating_band_id");
  }

  return Object.freeze({
    requestId,
    fen,
    fen4,
    legalMovesUci: Object.freeze([...suppliedSet]),
    legalMoveSet: actualSet,
    skillLevel,
    timeoutMs,
    ratingBandId,
    requestedRating,
  });
}
