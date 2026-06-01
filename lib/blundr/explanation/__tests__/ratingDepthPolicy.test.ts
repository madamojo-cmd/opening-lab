import assert from "node:assert/strict";

import { maxSentencesForRating, ratingBucketFor } from "../ratingDepthPolicy";

export function testRatingDepthPolicy(): void {
  assert.equal(ratingBucketFor({ rating: 1000 }), "beginner");
  assert.equal(ratingBucketFor({ rating: 2000 }), "advanced");
  assert.equal(maxSentencesForRating("advanced"), 2);
}
