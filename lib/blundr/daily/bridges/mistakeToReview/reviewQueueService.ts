import type { LearningEventV2 } from "../../../contracts/index.ts";
import { adaptLearningEventToFinding } from "./learningFindingAdapter.ts";
import { dedupeReviewSeeds } from "./reviewDedupe.ts";
import { createReviewSeed, type ReviewSeed } from "./reviewSeedFactory.ts";
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
