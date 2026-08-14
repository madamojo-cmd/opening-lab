import "server-only";

import type { CurrentBlundrUser, UserTrainingProfile } from "./accountTypes";
import { getOrCreateTrainingProfile } from "./accountService";
import { saveTrainingProfile } from "./accountRepository";
import type { TrainingPreferencesPatch } from "./trainingPreferences";

function context(user: CurrentBlundrUser) {
  return {
    user,
    accessToken: user.accessToken ?? null,
    mode: user.mode,
    allowLocalFallback: false,
  } as const;
}

export async function readOwnedTrainingPreferences(
  user: CurrentBlundrUser,
): Promise<UserTrainingProfile> {
  const result = await getOrCreateTrainingProfile(user.userId, context(user));
  if (!result.ok) throw new Error("training_preferences_unavailable");
  return result.data;
}

export async function updateOwnedTrainingPreferences(
  user: CurrentBlundrUser,
  patch: TrainingPreferencesPatch,
): Promise<UserTrainingProfile> {
  const current = await readOwnedTrainingPreferences(user);
  const next: UserTrainingProfile = {
    ...current,
    ...patch,
    userId: user.userId,
    ratingSource: patch.ratingBandId ? "manual" : current.ratingSource,
    rawRating: patch.ratingBandId ? undefined : current.rawRating,
    ratingTimeControl: patch.ratingBandId
      ? undefined
      : current.ratingTimeControl,
    updatedAt: new Date().toISOString(),
  };
  const saved = await saveTrainingProfile(next, context(user));
  if (!saved.ok) throw new Error("training_preferences_unavailable");
  return saved.data;
}
