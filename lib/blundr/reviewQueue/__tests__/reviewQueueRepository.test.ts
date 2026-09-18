import assert from "node:assert/strict";
import test from "node:test";

import { filterReviewQueueItemsForPreferredAuthority } from "../reviewQueueRepository.server";

const fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

function item(overrides: Record<string, unknown>) {
  return {
    mistakeId: String(overrides.positionKey),
    positionKey: String(overrides.positionKey),
    openingId: "italian-white",
    playKey: String(overrides.playKey ?? "startpos"),
    repertoireSide: "white",
    category: "opening_move",
    score: Number(overrides.score ?? 10),
    confidence: 1,
    explanation: "missed",
    recommendedDailyIntervention: "review_position",
    lifecycleState: String(overrides.lifecycleState ?? "active"),
    missCount: Number(overrides.missCount ?? 1),
    lastMissedAt: String(overrides.lastMissedAt ?? "2026-08-25T00:00:00.000Z"),
    updatedAt: String(overrides.updatedAt ?? "2026-08-25T00:00:00.000Z"),
    canonicalFen: fen,
    expectedMoveUci: String(overrides.expectedMoveUci),
  };
}

test("Review queue repository preferred authority filtering returns one representative and hides historical competing answers without exposing expected UCI", () => {
  const result = filterReviewQueueItemsForPreferredAuthority({
    includeResolved: false,
    items: [
      item({
        positionKey: "pos-alt",
        expectedMoveUci: "d2d4",
        score: 99,
        missCount: 5,
      }),
      item({
        positionKey: "pos-preferred-a",
        expectedMoveUci: "e2e4",
        score: 30,
        missCount: 2,
        lastMissedAt: "2026-08-26T00:00:00.000Z",
      }),
      item({
        positionKey: "pos-preferred-b",
        expectedMoveUci: "e2e4",
        score: 40,
        missCount: 3,
        updatedAt: "2026-08-26T00:00:00.000Z",
      }),
    ] as never,
  });

  assert.equal(result.length, 1);
  assert.equal(result[0].positionKey, "pos-preferred-b");
  assert.equal(result[0].score, 40);
  assert.equal(result[0].missCount, 5);
  assert.equal(result[0].lastMissedAt, "2026-08-26T00:00:00.000Z");
  assert.equal("expectedMoveUci" in result[0], false);
  assert.equal("canonicalFen" in result[0], false);
});

test("Review queue repository preferred authority filtering does not expose an older duplicate after preferred representative resolves", () => {
  const result = filterReviewQueueItemsForPreferredAuthority({
    includeResolved: false,
    items: [
      item({
        positionKey: "pos-old-alt",
        expectedMoveUci: "d2d4",
        lifecycleState: "active",
      }),
      item({
        positionKey: "pos-preferred",
        expectedMoveUci: "e2e4",
        lifecycleState: "resolved",
      }),
    ] as never,
  });

  assert.equal(result.length, 0);
});

test("Review queue repository preferred authority filtering keeps pagination ordering stable after filtering", () => {
  const result = filterReviewQueueItemsForPreferredAuthority({
    includeResolved: false,
    items: [
      item({
        positionKey: "pos-preferred",
        expectedMoveUci: "e2e4",
        score: 10,
      }),
      {
        ...item({
          positionKey: "pos-other",
          expectedMoveUci: "g1f3",
          score: 20,
        }),
        openingId: "non-indexed-fixture",
      },
    ] as never,
  });

  assert.deepEqual(
    result.map((entry) => entry.positionKey),
    ["pos-other", "pos-preferred"],
  );
});

test("Review queue repository preferred authority filtering defers capped preferred representatives before pagination", () => {
  const result = filterReviewQueueItemsForPreferredAuthority({
    includeResolved: false,
    deferredAuthorityKeys: new Set([
      `italian-white|${fen.split(" ").slice(0, 4).join(" ")}|white`,
    ]),
    items: [
      item({
        positionKey: "pos-preferred",
        expectedMoveUci: "e2e4",
        score: 30,
      }),
      {
        ...item({
          positionKey: "pos-other",
          expectedMoveUci: "g1f3",
          score: 20,
        }),
        openingId: "non-indexed-fixture",
      },
    ] as never,
  });

  assert.deepEqual(
    result.map((entry) => entry.positionKey),
    ["pos-other"],
  );
});
