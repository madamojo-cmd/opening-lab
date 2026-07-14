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
}): DailyDeck {
  const ordered = [...input.candidates].sort(
    (a, b) => b.priority - a.priority || a.stableKey.localeCompare(b.stableKey),
  );
  const seen = new Set<string>();
  const cards = ordered
    .filter((card) => !seen.has(card.positionKey) && seen.add(card.positionKey))
    .slice(0, input.limit ?? 5);
  const deckFingerprint = createDeterministicIdentity("deck", [
    input.userId,
    input.dateKey,
    ...cards.map((card) => card.cardFingerprint),
  ]);
  const deck: DailyDeck = {
    sessionId: createDeterministicIdentity("session", [
      input.userId,
      input.dateKey,
    ]) as SessionId,
    dateKey: input.dateKey,
    cards,
    deckFingerprint: deckFingerprint as DailyDeck["deckFingerprint"],
  };
  const errors = validateDailyDeck(deck);
  if (errors.length) throw new Error(`invalid_daily_deck:${errors.join(",")}`);
  return deck;
}
