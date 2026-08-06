import assert from "node:assert/strict";
import test from "node:test";
import {
  productionDailyActionId,
  toPublicDailySession,
} from "../productionDailyProjection";
import type {
  ProductionDailySession,
  ProductionDailyPrivateStep,
} from "../productionDailyTypes";

const privateSteps: readonly ProductionDailyPrivateStep[] = [
  {
    stepIndex: 0,
    positionFen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
    prompt: "Play the verified reply.",
    side: "black",
    acceptedMoves: ["c7c5"],
    explanation: "Verified first step.",
  },
  {
    stepIndex: 1,
    positionFen: "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
    prompt: "Continue after the reply.",
    side: "white",
    acceptedMoves: ["g1f3"],
    explanation: "Verified second step.",
  },
];

test("production Daily exposes only the current multi-step projection", () => {
  const session: ProductionDailySession = {
    sessionId: "session",
    deckId: "deck",
    userId: "user",
    dateKey: "2026-07-16",
    state: {
      deck: {
        sessionId: "session" as never,
        dateKey: "2026-07-16",
        deckFingerprint: "deck" as never,
        cards: [
          {
            deckFingerprint: "deck" as never,
            cardFingerprint: "card" as never,
            positionKey: "position",
            activityId: "daily_continuation_challenge",
            title: "Continuation",
            prompt: "Play the verified reply.",
            positionFen: privateSteps[0].positionFen,
            openingId: "italian-white",
            side: "black",
            priority: 1,
            stableKey: "card",
          },
        ],
      },
      attempts: [],
      currentIndex: 0,
      revealedCardIds: [],
      firstAttemptIds: [],
      activityProgress: {
        card: {
          stepIndex: 0,
          firstAttemptRecorded: false,
          status: "in_progress",
        },
      },
      status: "in_progress",
    },
    publicCards: [
      {
        cardFingerprint: "card" as never,
        positionKey: "position",
        activityId: "daily_continuation_challenge",
        title: "Continuation",
        prompt: privateSteps[0].prompt,
        positionFen: privateSteps[0].positionFen,
        openingId: "italian-white",
        playKey: "e2e4,c7c5",
        side: "black",
        why: "Verified continuation.",
        interaction: "move",
        steps: privateSteps,
      },
    ],
    privateCards: [
      {
        cardFingerprint: "card" as never,
        positionKey: "position",
        activityId: "daily_continuation_challenge",
        title: "Continuation",
        prompt: privateSteps[0].prompt,
        positionFen: privateSteps[0].positionFen,
        openingId: "italian-white",
        playKey: "e2e4,c7c5",
        side: "black",
        why: "Verified continuation.",
        interaction: "move",
        steps: privateSteps,
        acceptedMoves: ["c7c5"],
        privateSteps,
        explanation: "Verified continuation.",
      },
    ],
    reservationIdentity: {
      composerVersion: "test-composer",
      runtimePackageId: "test-runtime",
      profileVersion: "test-profile",
    },
    version: 1,
    completedAt: null,
  };
  const projected = toPublicDailySession(session);
  const serialized = JSON.stringify(projected);
  assert.equal(
    projected.publicCards[0].positionFen,
    privateSteps[0].positionFen,
  );
  assert.equal(serialized.includes(privateSteps[1].positionFen), false);
  assert.equal(serialized.includes("acceptedMoves"), false);
  assert.equal(serialized.includes("privateSteps"), false);
  assert.equal(
    projected.publicCards[0].actionId,
    productionDailyActionId({
      sessionId: session.sessionId,
      cardFingerprint: String(session.publicCards[0].cardFingerprint),
      stepIndex: 0,
      version: session.version,
    }),
  );
  assert.equal(
    toPublicDailySession(session).publicCards[0].actionId,
    projected.publicCards[0].actionId,
  );
  assert.notEqual(
    toPublicDailySession({ ...session, version: session.version + 1 })
      .publicCards[0].actionId,
    projected.publicCards[0].actionId,
  );
});
