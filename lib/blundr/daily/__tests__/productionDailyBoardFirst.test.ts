import assert from "node:assert/strict";
import { Chess } from "chess.js";

import { toPublicDailySession } from "../productionDailyProjection";
import {
  buildProductionDailyTeachingPayload,
  isProductionDailyUciMove,
  productionDailyCardAcceptsBoardInput,
  resolveProductionDailyAnswerMoveUci,
  resolveProductionDailyBoardAnswer,
} from "../productionDailyTeaching";
import type {
  ProductionDailyPrivateCard,
  ProductionDailyPublicCard,
  ProductionDailySession,
} from "../productionDailyTypes";

const START_FEN = new Chess().fen();
const PRIVATE_NOTE = "Private teaching note.";

function basePublicCard(
  overrides: Partial<ProductionDailyPublicCard> = {},
): ProductionDailyPublicCard {
  return {
    cardFingerprint: "daily-card-1" as never,
    positionKey: "start",
    activityId: "move_recall",
    title: "Find the move",
    prompt: "Play the verified move.",
    positionFen: START_FEN,
    openingId: "italian-game",
    playKey: "italian-game:white",
    side: "white",
    why: "Scheduled from current learning evidence.",
    interaction: "move",
    ...overrides,
  };
}

function sessionFor(input: {
  publicCard: ProductionDailyPublicCard;
  privateCard: ProductionDailyPrivateCard;
  revealedCardIds?: string[];
  activityProgress?: Record<
    string,
    { stepIndex: number; firstAttemptRecorded: boolean; status: string }
  >;
}): ProductionDailySession {
  return {
    sessionId: "daily-session-1",
    deckId: "daily-deck-1",
    userId: "user-1",
    dateKey: "2026-08-17",
    state: {
      attempts: [],
      currentIndex: 0,
      revealedCardIds: input.revealedCardIds ?? [],
      firstAttemptIds: [],
      activityProgress: input.activityProgress ?? {},
      status: "in_progress",
    } as ProductionDailySession["state"],
    publicCards: [input.publicCard],
    privateCards: [input.privateCard],
    reservationIdentity: {
      composerVersion: "test",
      runtimePackageId: "test-runtime",
      profileVersion: "test-profile",
    },
    version: 1,
    completedAt: null,
  };
}

function testTeachingMoveProjection(): void {
  assert.equal(isProductionDailyUciMove("e2e4"), true);
  assert.equal(isProductionDailyUciMove("Choice A"), false);

  const built = buildProductionDailyTeachingPayload({
    sourceFen: START_FEN,
    moveUci: "e2e4",
  });
  assert.ok(built);
  assert.equal(built.moveSan, "e4");
  assert.equal(built.from, "e2");
  assert.equal(built.to, "e4");
  assert.notEqual(built.resultFen, START_FEN);
  assert.equal(
    buildProductionDailyTeachingPayload({
      sourceFen: START_FEN,
      moveUci: "not-a-move",
    }),
    null,
  );
}

function testOpaqueCandidateChoiceSupportsBoardInput(): void {
  const card = basePublicCard({
    interaction: "choice",
    options: [
      { id: "approved-e2e4", label: "e4", moveUci: "e2e4" },
      { id: "mistake-d2d4", label: "d4", moveUci: "d2d4" },
      { id: "alternative-c2c4", label: "c4", moveUci: "c2c4" },
    ],
  });

  assert.equal(productionDailyCardAcceptsBoardInput(card), true);
  assert.equal(
    resolveProductionDailyBoardAnswer(card, "e2e4"),
    "approved-e2e4",
  );
  assert.equal(
    resolveProductionDailyAnswerMoveUci(card, "approved-e2e4"),
    "e2e4",
  );
  assert.equal(resolveProductionDailyBoardAnswer(card, "g1f3"), "g1f3");
}

function testInitialProjectionDoesNotLeakTeaching(): void {
  const publicCard = basePublicCard();
  const privateCard: ProductionDailyPrivateCard = {
    ...publicCard,
    acceptedMoves: ["e2e4"],
    explanation: PRIVATE_NOTE,
  };
  const projected = toPublicDailySession(
    sessionFor({ publicCard, privateCard }),
  );
  const projectedCard = projected.publicCards[0];

  assert.equal("teaching" in projectedCard, false);
  const serialized = JSON.stringify(projected);
  assert.equal(serialized.includes("acceptedMoves"), false);
  assert.equal(serialized.includes("acceptedAnswers"), false);
  assert.equal(serialized.includes(PRIVATE_NOTE), false);
  assert.equal(serialized.includes("e2e4"), false);
}

function testRevealProjectsTeachingAndRetryHidesItAgain(): void {
  const publicCard = basePublicCard();
  const privateCard: ProductionDailyPrivateCard = {
    ...publicCard,
    acceptedMoves: ["e2e4"],
    explanation: PRIVATE_NOTE,
  };
  const revealed = toPublicDailySession(
    sessionFor({
      publicCard,
      privateCard,
      revealedCardIds: [String(publicCard.cardFingerprint)],
    }),
  );
  assert.ok(revealed.publicCards[0].teaching);
  assert.equal(revealed.publicCards[0].teaching?.moveUci, "e2e4");
  assert.equal(revealed.publicCards[0].teaching?.moveSan, "e4");
  assert.equal(revealed.publicCards[0].teaching?.note, PRIVATE_NOTE);

  const retried = toPublicDailySession(
    sessionFor({
      publicCard,
      privateCard,
      revealedCardIds: [],
    }),
  );
  assert.equal("teaching" in retried.publicCards[0], false);
}

function testContinuationRevealUsesCurrentVerifiedStep(): void {
  const afterE4E5 =
    "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2";
  const publicCard = basePublicCard({
    cardFingerprint: "daily-continuation-1" as never,
    activityId: "continuation",
    steps: [
      {
        stepIndex: 0,
        positionFen: START_FEN,
        prompt: "First move",
        side: "white",
      },
      {
        stepIndex: 1,
        positionFen: afterE4E5,
        prompt: "Continue",
        side: "white",
      },
    ],
  });
  const privateCard: ProductionDailyPrivateCard = {
    ...publicCard,
    acceptedMoves: ["e2e4"],
    explanation: "First step.",
    privateSteps: [
      {
        stepIndex: 0,
        positionFen: START_FEN,
        prompt: "First move",
        side: "white",
        acceptedMoves: ["e2e4"],
        explanation: "First step.",
      },
      {
        stepIndex: 1,
        positionFen: afterE4E5,
        prompt: "Continue",
        side: "white",
        acceptedMoves: ["g1f3"],
        explanation: "Develop the knight.",
      },
    ],
  };
  const projected = toPublicDailySession(
    sessionFor({
      publicCard,
      privateCard,
      activityProgress: {
        [String(publicCard.cardFingerprint)]: {
          stepIndex: 1,
          firstAttemptRecorded: true,
          status: "revealed",
        },
      },
    }),
  );

  const card = projected.publicCards[0];
  assert.equal(card.positionFen, afterE4E5);
  assert.equal(card.teaching?.sourceFen, afterE4E5);
  assert.equal(card.teaching?.moveUci, "g1f3");
  assert.equal(card.teaching?.moveSan, "Nf3");
}

testTeachingMoveProjection();
testOpaqueCandidateChoiceSupportsBoardInput();
testInitialProjectionDoesNotLeakTeaching();
testRevealProjectsTeachingAndRetryHidesItAgain();
testContinuationRevealUsesCurrentVerifiedStep();

console.log("productionDailyBoardFirst ok");
