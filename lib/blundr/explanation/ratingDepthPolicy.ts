import type { CoachRatingBucket } from "./explanationTypes";

export function ratingBucketFor(input?: { rating?: number; setting?: CoachRatingBucket }): CoachRatingBucket {
  if (input?.setting) return input.setting;
  if ((input?.rating ?? 1500) < 1400) return "beginner";
  if ((input?.rating ?? 1500) > 1800) return "advanced";
  return "intermediate";
}

export function maxSentencesForRating(bucket: CoachRatingBucket): number {
  return bucket === "advanced" ? 2 : 1;
}
