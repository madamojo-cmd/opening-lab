import assert from "node:assert/strict";
import test from "node:test";
import type { ProductionDailyPublicSession } from "../productionDailyTypes";
import { resolveProductionDailyCompletion } from "../productionDailyCompletion";

const card = {
  cardFingerprint: "card-1",
  positionKey: "position-1",
  activityId: "candidate_choice",
  title: "Candidate choice",
  prompt: "Choose.",
  positionFen: "8/8/8/8/8/8/8/K6k w - - 0 1",
  openingId: "italian-white",
  playKey: "e2e4 e7e5",
  side: "white" as const,
  why: "Verified evidence.",
  interaction: "choice" as const,
};

function session(
  overrides: Partial<ProductionDailyPublicSession> = {},
): ProductionDailyPublicSession {
  return {
    sessionId: "session-1",
    deckId: "deck-1",
    dateKey: "2026-07-20",
    publicCards: [card],
    version: 2,
    completedAt: "2026-07-20T12:00:00.000Z",
    state: {
      currentIndex: 1,
      completedCardIds: ["card-1"],
      revealedCardIds: [],
    },
    ...overrides,
  };
}

test("production Daily emits one deterministic completion only after every server card completes", () => {
  assert.deepEqual(resolveProductionDailyCompletion(session()), {
    completionId: "2026-07-20:session-1:daily_blundr_deck_completed",
    dateKey: "2026-07-20",
    deckId: "deck-1",
    reviewSessionId: "session-1",
    taskId: "daily_blundr_deck_completed",
    completedAt: "2026-07-20T12:00:00.000Z",
  });
  assert.equal(
    resolveProductionDailyCompletion(session({ completedAt: null })),
    null,
  );
  assert.equal(
    resolveProductionDailyCompletion(
      session({
        state: {
          currentIndex: 0,
          completedCardIds: [],
          revealedCardIds: [],
        },
      }),
    ),
    null,
  );
  assert.equal(
    resolveProductionDailyCompletion(session({ publicCards: [] })),
    null,
  );
});
