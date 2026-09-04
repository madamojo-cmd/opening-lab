import assert from "node:assert/strict";
import test from "node:test";

import {
  buildReviewDailyLimitAuthorityKey,
  countDailyCorrectReviewCompletionsByAuthority,
  MAX_DAILY_REVIEW_COMPLETIONS_PER_FREE_USER,
} from "../dailyReviewLimit.server";

const canonicalFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

const key = buildReviewDailyLimitAuthorityKey({
  openingId: "italian-white",
  canonicalFen,
  repertoireSide: "white",
});

function correctRow(overrides: Record<string, unknown> = {}) {
  return {
    source: "review",
    taxonomy: "move_correct",
    opening_id: "italian-white",
    canonical_fen: canonicalFen,
    repertoire_side: "white",
    occurred_at: "2026-08-27T15:00:00.000Z",
    deleted_at: null,
    ...overrides,
  };
}

test("daily Review completion limit counts only server-confirmed correct Review completions for the local day", () => {
  const counts = countDailyCorrectReviewCompletionsByAuthority({
    localDate: "2026-08-27",
    timeZone: "UTC",
    rows: [
      correctRow(),
      correctRow({ taxonomy: "move_incorrect" }),
      correctRow({ source: "train" }),
      correctRow({ deleted_at: "2026-08-27T15:01:00.000Z" }),
      correctRow({ occurred_at: "2026-08-26T23:00:00.000Z" }),
    ],
  });

  assert.equal(counts.get(key ?? ""), 1);
});

test("daily Review completion limit allows the fifth Free completion after four same-day completions", () => {
  const counts = countDailyCorrectReviewCompletionsByAuthority({
    localDate: "2026-08-27",
    timeZone: "UTC",
    rows: [correctRow(), correctRow(), correctRow(), correctRow()],
  });

  assert.equal(
    (counts.get(key ?? "") ?? 0) < MAX_DAILY_REVIEW_COMPLETIONS_PER_FREE_USER,
    true,
  );
});

test("daily Review completion limit defers Free users after five same-day completions and keeps authority keys separate", () => {
  const otherFen = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1";
  const otherKey = buildReviewDailyLimitAuthorityKey({
    openingId: "italian-white",
    canonicalFen: otherFen,
    repertoireSide: "white",
  });
  const counts = countDailyCorrectReviewCompletionsByAuthority({
    localDate: "2026-08-27",
    timeZone: "UTC",
    rows: [
      correctRow(),
      correctRow(),
      correctRow(),
      correctRow(),
      correctRow(),
      correctRow({ canonical_fen: otherFen }),
    ],
  });

  assert.equal(counts.get(key ?? ""), 5);
  assert.equal(
    (counts.get(key ?? "") ?? 0) >= MAX_DAILY_REVIEW_COMPLETIONS_PER_FREE_USER,
    true,
  );
  assert.equal(counts.get(otherKey ?? ""), 1);
});

test("daily Review completion limit uses the persisted timezone day and restores eligibility on the next local day", () => {
  const countsToday = countDailyCorrectReviewCompletionsByAuthority({
    localDate: "2026-08-27",
    timeZone: "America/Los_Angeles",
    rows: [
      correctRow({ occurred_at: "2026-08-28T06:55:00.000Z" }),
      correctRow({ occurred_at: "2026-08-28T06:56:00.000Z" }),
      correctRow({ occurred_at: "2026-08-28T06:57:00.000Z" }),
      correctRow({ occurred_at: "2026-08-28T06:58:00.000Z" }),
    ],
  });
  const countsTomorrow = countDailyCorrectReviewCompletionsByAuthority({
    localDate: "2026-08-28",
    timeZone: "America/Los_Angeles",
    rows: [
      correctRow({ occurred_at: "2026-08-28T06:55:00.000Z" }),
      correctRow({ occurred_at: "2026-08-28T06:56:00.000Z" }),
      correctRow({ occurred_at: "2026-08-28T06:57:00.000Z" }),
      correctRow({ occurred_at: "2026-08-28T06:58:00.000Z" }),
    ],
  });

  assert.equal(countsToday.get(key ?? ""), 4);
  assert.equal(countsTomorrow.get(key ?? "") ?? 0, 0);
});
