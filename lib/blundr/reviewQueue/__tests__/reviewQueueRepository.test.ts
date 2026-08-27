import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { filterReviewQueueItemsForPreferredAuthority } from "../reviewQueueRepository.server";

const fen =
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

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

describe("Review queue repository preferred authority filtering", () => {
  it("returns one representative and hides historical competing answers without exposing expected UCI", () => {
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

    expect(result).toHaveLength(1);
    expect(result[0].positionKey).toBe("pos-preferred-b");
    expect(result[0].score).toBe(40);
    expect(result[0].missCount).toBe(5);
    expect(result[0].lastMissedAt).toBe("2026-08-26T00:00:00.000Z");
    expect("expectedMoveUci" in result[0]).toBe(false);
    expect("canonicalFen" in result[0]).toBe(false);
  });

  it("does not expose an older duplicate after preferred representative resolves", () => {
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

    expect(result).toHaveLength(0);
  });

  it("keeps pagination ordering stable after filtering", () => {
    const result = filterReviewQueueItemsForPreferredAuthority({
      includeResolved: false,
      items: [
        item({ positionKey: "pos-preferred", expectedMoveUci: "e2e4", score: 10 }),
        {
          ...item({ positionKey: "pos-other", expectedMoveUci: "g1f3", score: 20 }),
          openingId: "non-indexed-fixture",
        },
      ] as never,
    });

    expect(result.map((entry) => entry.positionKey)).toEqual([
      "pos-other",
      "pos-preferred",
    ]);
  });
});
