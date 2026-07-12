import { getLocalAccountCurrentUserId, getLocalTrainingProfile } from "../accounts/localAccountStorage";
import { buildBlundrTaskCompletionId, recordBlundrTaskCompleted } from "./dailyRingGameplayEvents";
import { loadDailyRingSnapshot } from "./dailyRingService";
import type { DailyRingCompletionResultLike } from "./dailyRingTypes";
import { loadDailyBlundrOverview } from "../daily/dailyBlundrReadModel";
import { getDailyBlundrDateKey } from "../daily/dailyBlundrStorage";
import { isDailyBlundrSessionComplete } from "../daily/dailyBlundrSessionController";
import { loadRepertoireProgress } from "../repertoire/repertoireProgressService";

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

export async function reconcileDailyBlundrRingCompletionForToday(input: {
  overview?: ReturnType<typeof loadDailyBlundrOverview> | null;
  userId?: string | null;
  now?: string;
} = {}): Promise<DailyRingCompletionResultLike | null> {
  const overview = input.overview ?? loadDailyBlundrOverview(5);
  const session = overview.currentSession;
  if (!session || !isDailyBlundrSessionComplete(session)) return null;

  const userId = normalizeText(input.userId) || getLocalAccountCurrentUserId();
  const ringSnapshot = loadDailyRingSnapshot({ userId, profile: getLocalTrainingProfile(userId) ?? undefined });
  if (ringSnapshot.blundr.complete) return null;

  const completionId = buildBlundrTaskCompletionId({
    dateKey: overview.dateKey || getDailyBlundrDateKey(),
    deckId: session.deckFingerprint,
    reviewSessionId: session.deckFingerprint,
    taskId: "daily_blundr_deck_completed",
    completionIndex: 0,
  });

  return recordBlundrTaskCompleted({
    userId,
    deckId: session.deckFingerprint,
    reviewSessionId: session.deckFingerprint,
    taskId: "daily_blundr_deck_completed",
    completionIndex: 0,
    completionId,
    repertoireProgress: loadRepertoireProgress({ userId }),
    profile: getLocalTrainingProfile(userId) ?? undefined,
    now: input.now,
  });
}
