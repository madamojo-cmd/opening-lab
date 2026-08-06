import assert from "node:assert/strict";
import test from "node:test";
import {
  allowedRatings,
  reviewItemId,
  validateReviewRating,
} from "../reviewContracts";

test("review items are owner/version-bound and opaque", () => {
  const base = {
    userId: "u1",
    openingId: "french",
    playKey: "e2e4,e7e6",
    version: 2,
  };
  assert.notEqual(reviewItemId(base), reviewItemId({ ...base, userId: "u2" }));
  assert.notEqual(reviewItemId(base), reviewItemId({ ...base, version: 3 }));
});

test("rating policy keeps all four choices distinct", () => {
  const answer = {
    correct: true,
    revealOccurred: false,
    priorFailure: false,
    priorReps: 8,
    elapsedMs: 4_000,
  };
  assert.deepEqual(allowedRatings(answer), ["hard", "good", "easy"]);
  assert.deepEqual(allowedRatings({ ...answer, elapsedMs: 5_001 }), [
    "hard",
    "good",
  ]);
  assert.deepEqual(allowedRatings({ ...answer, revealOccurred: true }), [
    "again",
  ]);
  assert.deepEqual(allowedRatings({ ...answer, priorFailure: true }), [
    "again",
  ]);
  assert.equal(validateReviewRating({ ...answer, rating: "easy" }), true);
  assert.equal(
    validateReviewRating({ ...answer, priorFailure: true, rating: "good" }),
    false,
  );
});
