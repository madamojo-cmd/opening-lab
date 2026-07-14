import { createDeterministicIdentity } from "@/lib/blundr/contracts";
import type { ProviderGameRecord } from "./gameDataTypes";

export function normalizeProviderUsername(value: string): string {
  return value.trim().toLocaleLowerCase("en-US").replace(/\s+/g, "");
}

export function providerGameFingerprint(input: {
  provider: string;
  externalId: string;
}): string {
  return createDeterministicIdentity("provider-game", [
    input.provider.toLowerCase(),
    input.externalId.trim(),
  ]);
}

export function fallbackGameFingerprint(
  game: Pick<
    ProviderGameRecord,
    "provider" | "whitePlayer" | "blackPlayer" | "playedAt" | "normalizedMoves"
  >,
): string {
  return createDeterministicIdentity("fallback-game", [
    game.provider,
    normalizeProviderUsername(game.whitePlayer),
    normalizeProviderUsername(game.blackPlayer),
    game.playedAt,
    game.normalizedMoves.join(" "),
  ]);
}

export function findingFingerprint(input: {
  userId: string;
  gameFingerprint: string;
  segmentId: string;
  positionKey: string;
  category: string;
}): string {
  return createDeterministicIdentity("finding", [
    input.userId,
    input.gameFingerprint,
    input.segmentId,
    input.positionKey,
    input.category,
  ]);
}
