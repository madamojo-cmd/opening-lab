import assert from "node:assert/strict";
import test from "node:test";

import {
  buildReviewQueuePracticeActionHref,
  parseReviewQueueQuery,
} from "../reviewQueueModel.ts";

test("parseReviewQueueQuery clamps and defaults", () => {
  const params = new URLSearchParams();
  const parsed = parseReviewQueueQuery(params);
  assert.equal(parsed.page, 0);
  assert.equal(parsed.limit, 25);
  assert.equal(parsed.includeResolved, false);

  const parsed2 = parseReviewQueueQuery(
    new URLSearchParams({ page: "-10", limit: "999", includeResolved: "1" }),
  );
  assert.equal(parsed2.page, 0);
  assert.equal(parsed2.limit, 50);
  assert.equal(parsed2.includeResolved, true);
});

test("buildReviewQueuePracticeActionHref matches contract", () => {
  const href = buildReviewQueuePracticeActionHref({
    positionKey: "pos-123",
  });
  assert.equal(href, "/review/mistakes/pos-123");
});

test("buildReviewQueuePracticeActionHref returns null when missing key", () => {
  assert.equal(buildReviewQueuePracticeActionHref({ positionKey: "" }), null);
});
