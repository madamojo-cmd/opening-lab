import type { LearningEventV2 } from "@/lib/blundr/contracts";
import { adaptLearningEventToFinding } from "./learningFindingAdapter";
import { dedupeReviewSeeds } from "./reviewDedupe";
import { createReviewSeed, type ReviewSeed } from "./reviewSeedFactory";
export function buildReviewQueue(
  events: readonly LearningEventV2[],
): ReviewSeed[] {
  return dedupeReviewSeeds(
    events
      .map(adaptLearningEventToFinding)
      .filter((finding): finding is NonNullable<typeof finding> =>
        Boolean(finding),
      )
      .map(createReviewSeed),
  );
}
