import type { ProviderKind } from "@/lib/blundr/contracts";
import {
  BLUNDR_CLASSIFIER_VERSION,
  BLUNDR_RUNTIME_VERSION,
} from "@/lib/blundr/contracts";
import {
  fallbackGameFingerprint,
  normalizeProviderUsername,
  providerGameFingerprint,
} from "./gameFingerprint";
import type { ProviderGameRecord } from "./gameDataTypes";

export type RawProviderGame = {
  provider: ProviderKind;
  externalId?: string | null;
  username: string;
  white: string;
  black: string;
  playedAt: string;
  result: string;
  timeControl?: string | null;
  rated?: boolean | null;
  variant?: string | null;
  pgn: string;
  moves: readonly string[];
};

export function normalizeProviderGame(
  raw: RawProviderGame,
): ProviderGameRecord | null {
  const variant = (raw.variant ?? "standard").trim().toLowerCase();
  if (!raw.pgn.trim() || !raw.moves.length || variant !== "standard")
    return null;
  if (!["1-0", "0-1", "1/2-1/2"].includes(raw.result)) return null;
  const playedAt = new Date(raw.playedAt);
  if (!Number.isFinite(playedAt.valueOf())) return null;
  const username = normalizeProviderUsername(raw.username);
  const color: "white" | "black" | null =
    normalizeProviderUsername(raw.white) === username
      ? "white"
      : normalizeProviderUsername(raw.black) === username
        ? "black"
        : null;
  if (!color) return null;
  const base = {
    provider: raw.provider,
    whitePlayer: raw.white.trim(),
    blackPlayer: raw.black.trim(),
    playedAt: playedAt.toISOString(),
    normalizedMoves: [...raw.moves],
  } as const;
  return {
    ...base,
    providerGameId: raw.externalId?.trim() || null,
    providerFingerprint: raw.externalId
      ? providerGameFingerprint({
          provider: raw.provider,
          externalId: raw.externalId,
        })
      : null,
    fallbackFingerprint: fallbackGameFingerprint({
      ...base,
      provider: raw.provider,
    }),
    username,
    result: raw.result as ProviderGameRecord["result"],
    timeControl: raw.timeControl?.trim() || null,
    rated: raw.rated ?? null,
    variant,
    pgn: raw.pgn,
    playerColor: color,
    classificationState: "pending",
    processingVersion: BLUNDR_RUNTIME_VERSION,
    classifierVersion: BLUNDR_CLASSIFIER_VERSION,
  };
}

export function shouldIncludeTimeControl(
  timeControl: string | null,
  includeBullet = false,
): boolean {
  const text = (timeControl ?? "").toLowerCase();
  if (!text) return true;
  if (text.includes("bullet")) return includeBullet;
  return true;
}
