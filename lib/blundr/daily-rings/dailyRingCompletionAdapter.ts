import { createDailyRingActivityCompletionId, type DailyRingActivitySource, type DailyRingId } from "./dailyRingEvents";
import type { DailyRingActivity } from "./dailyRingTypes";

export type DailyRingCompletionSourceInput =
  | DailyRingActivitySource
  | "book_end_completed"
  | "checkmate_game_completed"
  | "review_card_completed";

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

export function normalizeDailyRingCompletionSource(source: unknown): DailyRingActivitySource | null {
  const text = normalizeText(source);
  if (text === "opening_run_completed" || text === "continuation_completed" || text === "daily_blundr_deck_completed") {
    return text;
  }
  if (text === "book_end_completed" || text === "checkmate_game_completed") {
    return "continuation_completed";
  }
  if (text === "review_card_completed") {
    return "daily_blundr_deck_completed";
  }
  return null;
}

export function resolveDailyRingIdForCompletionSource(source: unknown): DailyRingId | null {
  const normalized = normalizeDailyRingCompletionSource(source);
  if (normalized === "opening_run_completed") return "daily_tempo";
  if (normalized === "continuation_completed") return "daily_battery";
  if (normalized === "daily_blundr_deck_completed") return "daily_blundr";
  return null;
}

export function createDailyRingCompletionActivity(input: {
  userId: string;
  source: DailyRingCompletionSourceInput | string;
  completionId: string;
  openingId?: string;
  dailySessionId?: string;
  createdAt?: string;
}): DailyRingActivity | null {
  const source = normalizeDailyRingCompletionSource(input.source);
  if (!source) return null;
  const completionId = normalizeText(input.completionId) || createDailyRingActivityCompletionId({
    ringId: resolveDailyRingIdForCompletionSource(source) ?? "daily_blundr",
    source,
    completionId: normalizeText(input.completionId) || "completion",
  });
  return {
    userId: normalizeText(input.userId),
    source,
    completionId,
    openingId: normalizeText(input.openingId) || undefined,
    dailySessionId: normalizeText(input.dailySessionId) || undefined,
    createdAt: normalizeText(input.createdAt) || undefined,
  };
}

