import { describe, expect, it } from "vitest";
import {
  createPositionIdentity,
  type LearningEventV2,
} from "@/lib/blundr/contracts";
import {
  InMemoryLearningEventStore,
  InMemoryNodeMasteryRepository,
} from "@/lib/blundr/learning/core";
import { evaluateOpeningAccess } from "@/lib/blundr/openingAccess";
import { createDefaultRepertoireProgress } from "@/lib/blundr/repertoire/repertoireUnlockService";
import {
  buildDeterministicDailyDeck,
  InMemoryDailyDeckReservation,
} from "@/lib/blundr/daily/core";

describe("Wave 1 cross-source integration", () => {
  it("joins Train and Daily evidence into one canonical mastery node and deduplicates replay", () => {
    const position = createPositionIdentity({
      canonicalFen:
        "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1",
      openingId: "italian-white",
      repertoireSide: "white",
    });
    const makeEvent = (
      id: string,
      source: LearningEventV2["source"],
    ): LearningEventV2 => ({
      schemaVersion: "2026-07-13.v1",
      eventId: id as never,
      attemptId: null,
      sessionId: "s" as never,
      userId: "u",
      occurredAt: "2026-07-13T00:00:00Z",
      taxonomy: "move_incorrect",
      position,
      finding: null,
      firstAttempt: id === "train",
      idempotencyKey: id,
      source,
      contentVersion: "v1",
      classifierVersion: "v1",
      migrationMarker: null,
      deletedAt: null,
    });
    const train = makeEvent("train", "train");
    const daily = makeEvent("daily", "daily");
    const store = new InMemoryLearningEventStore();
    expect(store.append(train).status).toBe("inserted");
    expect(store.append(daily).status).toBe("inserted");
    expect(store.append(train).status).toBe("duplicate");
    const access = evaluateOpeningAccess({
      userId: "u",
      openingId: "italian-white",
      repertoireSide: "white",
      repertoire: createDefaultRepertoireProgress({
        userId: "u",
        starterPackId: "classical_attacker",
      }),
    });
    const mastery = new InMemoryNodeMasteryRepository();
    mastery.apply(train, access);
    mastery.apply(daily, access);
    expect(mastery.list("u")).toHaveLength(1);
    expect(mastery.get("u", position.positionKey)?.attempts).toBe(2);
  });
  it("reserves one Daily deck for concurrent callers and fails closed for locked access", () => {
    const deck = buildDeterministicDailyDeck({
      userId: "u",
      dateKey: "2026-07-13",
      candidates: [
        {
          deckFingerprint: "d" as never,
          cardFingerprint: "c" as never,
          positionKey: "p",
          activityId: "review",
          title: "Review",
          prompt: "Prompt",
          positionFen: "fen",
          openingId: "london-white",
          side: "white",
          priority: 1,
          stableKey: "p",
        },
      ],
    });
    const reservations = new InMemoryDailyDeckReservation();
    expect(
      reservations.reserve({
        userId: "u",
        dateKey: "2026-07-13",
        deck,
        now: "2026-07-13T00:00:00Z",
      }).created,
    ).toBe(true);
    expect(
      reservations.reserve({
        userId: "u",
        dateKey: "2026-07-13",
        deck,
        now: "2026-07-13T00:00:01Z",
      }).created,
    ).toBe(false);
    expect(
      evaluateOpeningAccess({
        userId: "u",
        openingId: "london-white",
        repertoireSide: "white",
        repertoire: createDefaultRepertoireProgress({
          userId: "u",
          starterPackId: "classical_attacker",
        }),
      }).decision,
    ).toBe("gated_pending");
  });
});
