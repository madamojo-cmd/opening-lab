import { describe, expect, it } from "vitest";
import { createPositionIdentity } from "@/lib/blundr/contracts";
import { InMemoryLearningEventStore } from "@/lib/blundr/learning/core/eventStore";
import { InMemoryNodeMasteryRepository } from "@/lib/blundr/learning/core/nodeMasteryRepository";
import { candidateChoiceLearningEvents } from "@/lib/blundr/daily/activities/candidateChoice/candidateChoiceLearningEvents";
import { planRecallLearningEvents } from "@/lib/blundr/daily/activities/planRecall/planRecallLearningEvents";
import { transpositionLearningEvents } from "@/lib/blundr/daily/activities/samePositionDifferentRoute/transpositionLearningEvents";
import { continuationLearningEvents } from "@/lib/blundr/daily/activities/continuationChallenge/continuationLearningEvents";
import { punishmentLearningEvents } from "@/lib/blundr/daily/activities/punishTheMistake/punishmentLearningEvents";

describe("Step 3 learning and review journeys", () => {
  it("joins all five activities to one canonical node and preserves retry semantics", () => {
    const position = createPositionIdentity({
      canonicalFen: "fen",
      openingId: "italian-white",
      repertoireSide: "white",
      expectedMoveUci: "e2e4",
    });
    const input = {
      userId: "user-a",
      sessionId: "session-a",
      positionKey: position.positionKey,
      now: "2026-07-14T00:00:00Z",
      position,
    };
    const events = [
      candidateChoiceLearningEvents({ ...input, correct: false })[0],
      planRecallLearningEvents(input)[0],
      transpositionLearningEvents(input)[0],
      continuationLearningEvents(input)[0],
      punishmentLearningEvents(input)[0],
    ];
    const store = new InMemoryLearningEventStore();
    const mastery = new InMemoryNodeMasteryRepository();
    const access = {
      openingId: "italian-white",
      repertoireSide: "white" as const,
      decision: "active" as const,
      checkedAt: input.now,
      authorityVersion: "test",
      expiresAt: null,
    };
    for (const event of events) {
      const result = store.append(event);
      expect(result.status).toBe("inserted");
      mastery.apply(event, access);
    }
    expect(store.list("user-a")).toHaveLength(5);
    expect(mastery.get("user-a", position.positionKey)?.attempts).toBe(5);
    expect(store.append(events[0]).status).toBe("duplicate");
    const retry = candidateChoiceLearningEvents({
      ...input,
      retry: true,
      now: "2026-07-14T00:01:00Z",
      correct: false,
    })[0];
    expect(retry.firstAttempt).toBe(false);
    expect(retry.position?.positionKey).toBe(position.positionKey);
  });
});
