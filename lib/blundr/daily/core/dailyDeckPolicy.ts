import {
  createDeterministicIdentity,
  type SessionId,
} from "@/lib/blundr/contracts";
import type { DailyDeck, DailyDeckCard } from "./dailyActivityTypes";
import { validateDailyDeck } from "./dailyActivityValidator";

export type DailyDeckCandidate = DailyDeckCard & {
  priority: number;
  stableKey: string;
};
export function buildDeterministicDailyDeck(input: {
  userId: string;
  dateKey: string;
  candidates: readonly DailyDeckCandidate[];
  limit?: number;
  reservationIdentity?: {
    composerVersion: string;
    runtimePackageId: string;
    profileVersion: string;
  };
}): DailyDeck {
  const ordered = [...input.candidates].sort(
    (a, b) => b.priority - a.priority || a.stableKey.localeCompare(b.stableKey),
  );
  const seen = new Set<string>();
  const boardRecall = ordered.find(
    (card) => card.activityId === "daily_move_recall",
  );
  const cards = [...(boardRecall ? [boardRecall] : []), ...ordered]
    .filter((card) => !seen.has(card.positionKey) && seen.add(card.positionKey))
    .slice(0, input.limit ?? 5);
  const deckFingerprint = createDeterministicIdentity("deck", [
    input.userId,
    input.dateKey,
    input.reservationIdentity?.composerVersion ?? "legacy-composer",
    input.reservationIdentity?.runtimePackageId ?? "legacy-runtime",
    input.reservationIdentity?.profileVersion ?? "legacy-profile",
    ...cards.map((card) => card.cardFingerprint),
  ]);
  const deck: DailyDeck = {
    sessionId: createDeterministicIdentity("session", [
      input.userId,
      input.dateKey,
      input.reservationIdentity?.composerVersion ?? "legacy-composer",
      input.reservationIdentity?.runtimePackageId ?? "legacy-runtime",
      input.reservationIdentity?.profileVersion ?? "legacy-profile",
    ]) as SessionId,
    dateKey: input.dateKey,
    cards,
    deckFingerprint: deckFingerprint as DailyDeck["deckFingerprint"],
  };
  const errors = validateDailyDeck(deck);
  if (errors.length) throw new Error(`invalid_daily_deck:${errors.join(",")}`);
  return deck;
}
