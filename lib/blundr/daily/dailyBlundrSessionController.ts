import { addDailyBlundrAttempt, markDailyBlundrSessionCardComplete } from "./dailyBlundrStorage";
import type { DailyBlundrAttempt, DailyBlundrSession } from "./dailyBlundrTypes";

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function uniqueStrings(values: readonly string[]): string[] {
  return Array.from(new Set(values.map((value) => normalizeText(value)).filter(Boolean)));
}

export function isDailyBlundrCardComplete(session: DailyBlundrSession, cardId: string): boolean {
  const normalizedCardId = normalizeText(cardId);
  if (!normalizedCardId) return false;
  return Boolean(session.cardProgressById[normalizedCardId]?.completed || session.completedCardIds.includes(normalizedCardId));
}

export function getNextIncompleteCardIndex(session: DailyBlundrSession): number {
  if (!session.cardOrder.length) return -1;
  return session.cardOrder.findIndex((cardId) => !isDailyBlundrCardComplete(session, cardId));
}

export function isDailyBlundrSessionComplete(session: DailyBlundrSession): boolean {
  return session.cardOrder.length > 0 && uniqueStrings(session.completedCardIds).length >= session.cardOrder.length;
}

export function applyDailyBlundrAttemptToSession(session: DailyBlundrSession, attempt: DailyBlundrAttempt): DailyBlundrSession {
  if (isDailyBlundrCardComplete(session, attempt.cardId)) {
    return session;
  }
  const withAttempt = addDailyBlundrAttempt(session, attempt);
  if (!attempt.correct || attempt.outcome !== "correct") {
    return withAttempt;
  }
  return markDailyBlundrSessionCardComplete(withAttempt, attempt.cardId, attempt.completedAt);
}
