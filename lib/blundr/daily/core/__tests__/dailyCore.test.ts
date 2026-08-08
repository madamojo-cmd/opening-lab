import assert from "node:assert/strict";
import test from "node:test";
import {
  type CardFingerprint,
  type DeckFingerprint,
} from "@/lib/blundr/contracts";
import {
  buildDeterministicDailyDeck,
  createDailyStateEnvelope,
  InMemoryDailyDeckReservation,
  LocalDailySessionPersistence,
} from "..";
import { reduceDailySession } from "../dailySessionReducer";
const card = {
  deckFingerprint: "deck" as DeckFingerprint,
  cardFingerprint: "card" as CardFingerprint,
  positionKey: "position",
  activityId: "review",
  title: "Review",
  prompt: "Find the plan",
  positionFen: "fen",
  openingId: "italian-white",
  side: "white" as const,
  priority: 1,
  stableKey: "a",
};
test("Daily deck policy is deterministic and deduplicates positions", () => {
  const candidates = [
    card,
    { ...card, cardFingerprint: "card-2" as CardFingerprint, stableKey: "b" },
    {
      ...card,
      cardFingerprint: "card-3" as CardFingerprint,
      positionKey: "other",
    },
  ];
  const deck = buildDeterministicDailyDeck({
    userId: "u",
    dateKey: "2026-07-13",
    candidates,
  });
  assert.deepEqual(
    deck.cards.map((candidate) => candidate.positionKey),
    ["position", "other"],
  );
  assert.equal(
    buildDeterministicDailyDeck({
      userId: "u",
      dateKey: "2026-07-13",
      candidates,
    }).deckFingerprint,
    deck.deckFingerprint,
  );
});
test("Daily deck identity changes with the reservation composer, runtime, and profile", () => {
  const candidate = {
    ...card,
    activityId: "daily_move_recall",
    cardFingerprint: "board-recall" as CardFingerprint,
  };
  const base = buildDeterministicDailyDeck({
    userId: "u",
    dateKey: "2026-07-13",
    candidates: [candidate],
    reservationIdentity: {
      composerVersion: "composer-a",
      runtimePackageId: "runtime-a",
      profileVersion: "profile-a",
    },
  });
  const changedRuntime = buildDeterministicDailyDeck({
    userId: "u",
    dateKey: "2026-07-13",
    candidates: [candidate],
    reservationIdentity: {
      composerVersion: "composer-a",
      runtimePackageId: "runtime-b",
      profileVersion: "profile-a",
    },
  });
  assert.notEqual(base.deckFingerprint, changedRuntime.deckFingerprint);
  assert.notEqual(base.sessionId, changedRuntime.sessionId);
});
test("Daily deck reserves board recall before optional choice activities", () => {
  const boardRecall = {
    ...card,
    activityId: "daily_move_recall",
    cardFingerprint: "board-recall" as CardFingerprint,
    stableKey: "z",
  };
  const choice = {
    ...card,
    activityId: "daily_candidate_choice",
    cardFingerprint: "choice" as CardFingerprint,
    positionKey: "choice-position",
    stableKey: "a",
  };
  const deck = buildDeterministicDailyDeck({
    userId: "u",
    dateKey: "2026-07-13",
    candidates: [choice, boardRecall],
  });
  assert.equal(deck.cards[0]?.activityId, "daily_move_recall");
});
test("Daily reservation is atomic and scored first attempts are immutable", () => {
  const deck = buildDeterministicDailyDeck({
    userId: "u",
    dateKey: "2026-07-13",
    candidates: [card],
  });
  const reservation = new InMemoryDailyDeckReservation();
  assert.equal(
    reservation.reserve({
      userId: "u",
      dateKey: "2026-07-13",
      deck,
      now: "2026-07-13T00:00:00Z",
    }).created,
    true,
  );
  assert.equal(
    reservation.reserve({
      userId: "u",
      dateKey: "2026-07-13",
      deck,
      now: "2026-07-13T00:01:00Z",
    }).created,
    false,
  );
  const state = {
    deck,
    attempts: [],
    currentIndex: 0,
    revealedCardIds: [],
    firstAttemptIds: [],
    status: "in_progress" as const,
  };
  const first = reduceDailySession(state, {
    userId: "u",
    cardFingerprint: "card",
    now: "2026-07-13T00:00:00Z",
    outcome: "incorrect",
  });
  const teachingRetry = reduceDailySession(first.state, {
    userId: "u",
    cardFingerprint: "card",
    now: "2026-07-13T00:01:00Z",
    outcome: "correct",
  });
  assert.equal(teachingRetry.result, "accepted");
  assert.equal(teachingRetry.state.attempts.length, 2);
  assert.equal(teachingRetry.state.attempts[0].outcome, "incorrect");
  assert.equal(teachingRetry.state.attempts[0].scored, true);
  assert.equal(teachingRetry.state.attempts[1].outcome, "correct");
  assert.equal(teachingRetry.state.attempts[1].scored, false);
  assert.equal(teachingRetry.state.currentIndex, 1);
});
test("Daily session persistence resumes the exact serialized state", () => {
  const deck = buildDeterministicDailyDeck({
    userId: "u",
    dateKey: "2026-07-13",
    candidates: [card],
  });
  const state = {
    deck,
    attempts: [],
    currentIndex: 0,
    revealedCardIds: [],
    firstAttemptIds: [],
    status: "in_progress" as const,
  };
  const persistence = new LocalDailySessionPersistence();
  const envelope = createDailyStateEnvelope(
    deck.sessionId,
    deck.dateKey,
    state,
    "state-fingerprint",
    "2026-07-13T00:00:00Z",
  );
  persistence.save("u", envelope);
  assert.deepEqual(persistence.load("u", deck.dateKey), envelope);
});
test("Daily reveal and retry remain unscored and cannot replace the first scored result", () => {
  const deck = buildDeterministicDailyDeck({
    userId: "u",
    dateKey: "2026-07-13",
    candidates: [card],
  });
  const state = {
    deck,
    attempts: [],
    currentIndex: 0,
    revealedCardIds: [],
    firstAttemptIds: [],
    status: "in_progress" as const,
  };
  const revealed = reduceDailySession(state, {
    userId: "u",
    cardFingerprint: "card",
    now: "2026-07-13T00:00:00Z",
    outcome: "reveal",
  });
  assert.equal(revealed.state.attempts[0].scored, false);
  const retry = reduceDailySession(revealed.state, {
    userId: "u",
    cardFingerprint: "card",
    now: "2026-07-13T00:01:00Z",
    outcome: "retry",
  });
  assert.equal(retry.result, "retry_recorded");
  assert.equal(
    retry.state.attempts.filter((attempt) => attempt.scored).length,
    0,
  );
  assert.equal(retry.state.revealedCardIds.length, 0);
});
