import assert from "node:assert/strict";
import { Chess } from "chess.js";

import { buildDailyBlundrDeck } from "../dailyBlundrDeckBuilder";
import { buildDailyBlundrCardKey, type LegacyProgressSnapshot } from "../adapters/progressMistakeAdapter";
import type { DailyBlundrMasteryState, LearningEvent } from "../dailyBlundrTypes";

function makeProgressMistake(input: {
  fen: string;
  expectedMove: string;
  playedMove: string;
  count: number;
  opening: string;
  repertoireId: string;
}) {
  return { ...input };
}

function makeLearningEvent(input: Partial<LearningEvent> & Pick<LearningEvent, "fen" | "expectedMoveSan" | "expectedMoveUci" | "type">): LearningEvent {
  return {
    id: `event-${Math.random().toString(36).slice(2, 8)}`,
    source: "train",
    createdAt: "2026-07-02T08:00:00.000Z",
    sessionId: "session-daily",
    openingId: "italian-white",
    openingName: "Italian Game",
    correct: false,
    ...input,
  };
}

function makeMasteryRecord(key: string, label: string, currentMastery: number, confidence: number): DailyBlundrMasteryState["records"][string] {
  return {
    key,
    label,
    domain: "daily_recall",
    cardKind: "recall",
    sources: ["progress_mistake"],
    exposureCount: 10,
    attemptCount: 10,
    attempts: 10,
    correctCount: 9,
    correct: 9,
    incorrectCount: 1,
    incorrect: 1,
    recentAccuracy: 0.94,
    lifetimeAccuracy: 0.9,
    avgResponseTimeMs: 1400,
    hintRate: 0.05,
    revealRate: 0.03,
    currentMastery,
    confidence,
    currentDifficulty: "expert",
    streak: 4,
    lapses: 1,
    firstSeenAt: "2026-07-01T00:00:00.000Z",
    lastSeenAt: "2026-07-02T00:00:00.000Z",
    lastAttemptAt: "2026-07-02T00:00:00.000Z",
    lastCorrectAt: "2026-07-02T00:00:00.000Z",
    lastIncorrectAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-07-02T00:00:00.000Z",
  };
}

export function testDailyBlundrDeckBuilder(): void {
  const dateKey = "2026-07-02";
  const start = new Chess();
  const startFen = start.fen();

  const afterE4E5 = new Chess(startFen);
  afterE4E5.move("e4");
  afterE4E5.move("e5");
  const e4e5Fen = afterE4E5.fen();

  const afterNf3Nc6 = new Chess(e4e5Fen);
  afterNf3Nc6.move("Nf3");
  afterNf3Nc6.move("Nc6");
  const nf3Nc6Fen = afterNf3Nc6.fen();

  const afterD4D5 = new Chess(startFen);
  afterD4D5.move("d4");
  afterD4D5.move("d5");
  const d4d5Fen = afterD4D5.fen();

  const afterC4E5 = new Chess(startFen);
  afterC4E5.move("c4");
  afterC4E5.move("e5");
  const c4e5Fen = afterC4E5.fen();

  const repeatedKey = buildDailyBlundrCardKey({ fen: startFen, expectedMoveSan: "e4", expectedMoveUci: "e2e4" });
  const nf3Key = buildDailyBlundrCardKey({ fen: e4e5Fen, expectedMoveSan: "Nf3", expectedMoveUci: "g1f3" });
  const sanOnlyKey = buildDailyBlundrCardKey({ fen: startFen, expectedMoveSan: "??" });
  const bb5Key = buildDailyBlundrCardKey({ fen: nf3Nc6Fen, expectedMoveSan: "Bb5", expectedMoveUci: "f1b5" });
  const c4Key = buildDailyBlundrCardKey({ fen: d4d5Fen, expectedMoveSan: "c4", expectedMoveUci: "c2c4" });
  const c4e5Key = buildDailyBlundrCardKey({ fen: c4e5Fen, expectedMoveSan: "Nf3", expectedMoveUci: "g1f3" });

  const rankingProgress: LegacyProgressSnapshot = {
    attempts: 0,
    correct: 0,
    incorrect: 0,
    streak: 0,
    trainedPositions: {},
    mistakes: {
      a: makeProgressMistake({ fen: startFen, expectedMove: "e4", playedMove: "e5", count: 5, opening: "Italian Game", repertoireId: "italian-white" }),
      b: makeProgressMistake({ fen: e4e5Fen, expectedMove: "Nf3", playedMove: "Nc6", count: 1, opening: "Italian Game", repertoireId: "italian-white" }),
      c: makeProgressMistake({ fen: startFen, expectedMove: "??", playedMove: "e5", count: 1, opening: "Broken SAN", repertoireId: "broken-line" }),
      d: makeProgressMistake({ fen: nf3Nc6Fen, expectedMove: "Bb5", playedMove: "Nf6", count: 1, opening: "Ruy Lopez", repertoireId: "ruy-white" }),
      e: makeProgressMistake({ fen: d4d5Fen, expectedMove: "c4", playedMove: "e6", count: 1, opening: "Queen's Gambit", repertoireId: "queens-gambit-white" }),
      f: makeProgressMistake({ fen: c4e5Fen, expectedMove: "Nf3", playedMove: "Nc6", count: 1, opening: "English Opening", repertoireId: "english-white" }),
    },
  };

  const mastery: DailyBlundrMasteryState = {
    schemaVersion: 1,
    updatedAt: "2026-07-02T00:00:00.000Z",
    records: {
      [bb5Key]: makeMasteryRecord(bb5Key, "Ruy Lopez", 0.96, 0.9),
    },
  };

  const rankingInput = {
    progress: rankingProgress,
    learningEvents: [] as LearningEvent[],
    mastery,
    dateKey,
    limit: 6,
  };

  const firstRun = buildDailyBlundrDeck(rankingInput);
  const secondRun = buildDailyBlundrDeck(rankingInput);

  assert.deepEqual(firstRun.cards.map((card) => card.cardKey), secondRun.cards.map((card) => card.cardKey));
  assert.equal(firstRun.cards.length, 5);
  assert.equal(firstRun.cards[0].cardKey, repeatedKey);
  assert.ok(firstRun.cards.every((card) => card.masteryTargets.length > 0));

  const nf3Index = firstRun.cards.findIndex((card) => card.cardKey === nf3Key);
  const sanOnlyIndex = firstRun.cards.findIndex((card) => card.cardKey === sanOnlyKey);
  assert.ok(nf3Index >= 0);
  assert.ok(sanOnlyIndex === -1 || nf3Index < sanOnlyIndex);

  const highMasteryIndex = firstRun.cards.findIndex((card) => card.cardKey === bb5Key);
  const lowerMasteryIndex = firstRun.cards.findIndex((card) => card.cardKey === c4Key);
  assert.ok(highMasteryIndex >= 0);
  assert.ok(lowerMasteryIndex >= 0);
  assert.ok(firstRun.cards[highMasteryIndex].priority >= firstRun.cards[lowerMasteryIndex].priority);

  const cappedRun = buildDailyBlundrDeck({
    progress: rankingProgress,
    learningEvents: [] as LearningEvent[],
    mastery: null,
    dateKey,
    limit: 3,
  });
  assert.equal(cappedRun.cards.length, 3);
  assert.equal(cappedRun.summary.totalCards, 3);
  assert.ok(firstRun.cards.every((card) => card.reviewCardId));

  const mergeProgress: LegacyProgressSnapshot = {
    attempts: 0,
    correct: 0,
    incorrect: 0,
    streak: 0,
    trainedPositions: {},
    mistakes: {
      a: makeProgressMistake({ fen: startFen, expectedMove: "e4", playedMove: "e5", count: 2, opening: "Italian Game", repertoireId: "italian-white" }),
      b: makeProgressMistake({ fen: e4e5Fen, expectedMove: "Nf3", playedMove: "Nc6", count: 1, opening: "Italian Game", repertoireId: "italian-white" }),
    },
  };

  const mergeEvent = makeLearningEvent({
    type: "move_incorrect",
    fen: startFen,
    expectedMoveSan: "e4",
    expectedMoveUci: "e2e4",
    playedMoveSan: "e5",
    playedMoveUci: "e7e5",
    correct: false,
    timeToMoveMs: 8000,
  });

  const mergedRun = buildDailyBlundrDeck({
    progress: mergeProgress,
    learningEvents: [mergeEvent],
    mastery: null,
    dateKey,
    limit: 5,
  });

  assert.equal(mergedRun.cards.length, 2);
  assert.equal(mergedRun.summary.mergedCards, 1);
  assert.ok(mergedRun.cards[0].source === "merged" || mergedRun.cards[0].source === "learning_event" || mergedRun.cards[0].source === "progress_mistake");
}

testDailyBlundrDeckBuilder();
console.log("dailyBlundrDeckBuilder ok");
