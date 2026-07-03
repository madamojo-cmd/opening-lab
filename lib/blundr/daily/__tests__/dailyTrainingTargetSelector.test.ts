import assert from "node:assert/strict";
import { Chess } from "chess.js";

import { buildDailyBlundrDeck } from "../dailyBlundrDeckBuilder";
import { selectDailyTrainingTarget } from "../trainingTargets/dailyTrainingTargetSelector";
import type { DailyBlundrMasteryRecord, DailyBlundrMasteryState } from "../dailyBlundrTypes";
import type { LegacyProgressSnapshot } from "../adapters/progressMistakeAdapter";

function makeRecord(key: string, currentMastery: number, confidence: number): DailyBlundrMasteryRecord {
  return {
    key,
    label: key,
    domain: "training_target",
    cardKind: "training_target",
    sources: ["daily_attempt"],
    exposureCount: 5,
    attemptCount: 5,
    attempts: 5,
    correctCount: 4,
    correct: 4,
    incorrectCount: 1,
    incorrect: 1,
    recentAccuracy: 0.8,
    lifetimeAccuracy: 0.8,
    avgResponseTimeMs: 1200,
    hintRate: 0.1,
    revealRate: 0.1,
    currentMastery,
    confidence,
    currentDifficulty: "beginner",
    streak: 2,
    lapses: 1,
    firstSeenAt: "2026-07-01T00:00:00.000Z",
    lastSeenAt: "2026-07-02T00:00:00.000Z",
    lastAttemptAt: "2026-07-02T00:00:00.000Z",
    lastCorrectAt: "2026-07-02T00:00:00.000Z",
    lastIncorrectAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-07-02T00:00:00.000Z",
  };
}

function makeMasteryState(entries: Record<string, { currentMastery: number; confidence: number }>): DailyBlundrMasteryState {
  const records: DailyBlundrMasteryState["records"] = {};
  for (const [key, entry] of Object.entries(entries)) {
    records[key] = makeRecord(key, entry.currentMastery, entry.confidence);
  }
  return {
    schemaVersion: 1,
    updatedAt: "2026-07-02T00:00:00.000Z",
    records,
  };
}

function makeCandidateCards() {
  const startFen = new Chess().fen();
  const progress: LegacyProgressSnapshot = {
    attempts: 0,
    correct: 0,
    incorrect: 0,
    streak: 0,
    trainedPositions: {},
    mistakes: {
      a: {
        fen: startFen,
        expectedMove: "e4",
        playedMove: "e5",
        count: 1,
        opening: "Italian Game",
        repertoireId: "italian-white",
      },
    },
  };

  const deck = buildDailyBlundrDeck({
    progress,
    learningEvents: [],
    mastery: null,
    dateKey: "2026-07-02",
    now: "2026-07-02T09:00:00.000Z",
    limit: 5,
  });

  const candidateCards = deck.cards.filter((card) => card.kind === "recall");
  assert.ok(candidateCards.length > 0);
  return { deck, candidateCards };
}

export function testDailyTrainingTargetSelector(): void {
  const { deck, candidateCards } = makeCandidateCards();
  const firstCandidate = candidateCards[0];
  assert.ok(firstCandidate.expectedMoveUci);

  const lowMastery = makeMasteryState({
    "target:key_square_click:key_square_awareness": { currentMastery: 0.95, confidence: 0.9 },
    "target:key_square_click:square_control": { currentMastery: 0.95, confidence: 0.9 },
  });

  const selected = selectDailyTrainingTarget({
    mastery: lowMastery,
    dateKey: "2026-07-02",
    now: "2026-07-02T09:00:00.000Z",
    dueReviewCount: deck.dueReviewCount,
    selectedReviewCount: deck.selectedReviewCards.length,
    reviewCards: deck.reviewCards,
    reviewAttempts: [],
    candidateDailyCards: candidateCards,
    recentTrainingTargetIds: [],
    recentFenKeys: [],
    sessionTrainingTargetIds: [],
  });

  assert.ok(selected);
  assert.equal(selected?.definition.id, "break_timing_drill");
  assert.equal(selected?.reason, "intro");
  assert.equal(selected?.card.kind, "training_target");

  const excluded = selectDailyTrainingTarget({
    mastery: lowMastery,
    dateKey: "2026-07-02",
    now: "2026-07-02T09:00:00.000Z",
    dueReviewCount: deck.dueReviewCount,
    selectedReviewCount: deck.selectedReviewCards.length,
    reviewCards: deck.reviewCards,
    reviewAttempts: [],
    candidateDailyCards: candidateCards,
    recentTrainingTargetIds: ["break_timing_drill"],
    recentFenKeys: [],
    sessionTrainingTargetIds: [],
  });

  assert.ok(!excluded || excluded.definition.id !== "break_timing_drill");

  const highMastery = makeMasteryState({
    "target:reply_radar:candidate_move_recognition": { currentMastery: 0.92, confidence: 0.9 },
    "target:reply_radar:opponent_reply_recognition": { currentMastery: 0.92, confidence: 0.9 },
    "target:opening_branch_builder:branch_memory": { currentMastery: 0.92, confidence: 0.9 },
    "target:opening_branch_builder:move_order_precision": { currentMastery: 0.92, confidence: 0.9 },
    "target:opponent_reply_trainer:common_reply": { currentMastery: 0.92, confidence: 0.9 },
    "target:opponent_reply_trainer:opponent_reply_recognition": { currentMastery: 0.92, confidence: 0.9 },
    "target:break_timing_drill:break_timing": { currentMastery: 0.92, confidence: 0.9 },
    "target:break_timing_drill:pawn_break": { currentMastery: 0.92, confidence: 0.9 },
    "target:key_square_click:key_square_awareness": { currentMastery: 0.92, confidence: 0.9 },
    "target:key_square_click:square_control": { currentMastery: 0.92, confidence: 0.9 },
  });

  const advanced = selectDailyTrainingTarget({
    mastery: highMastery,
    dateKey: "2026-07-02",
    now: "2026-07-02T09:00:00.000Z",
    dueReviewCount: deck.dueReviewCount,
    selectedReviewCount: deck.selectedReviewCards.length,
    reviewCards: deck.reviewCards,
    reviewAttempts: [],
    candidateDailyCards: candidateCards,
    recentTrainingTargetIds: [],
    recentFenKeys: [],
    sessionTrainingTargetIds: [],
  });

  assert.ok(advanced);
  assert.equal(advanced?.reason, "advanced");
  assert.ok(advanced?.difficulty === "advanced" || advanced?.difficulty === "expert");
  assert.equal(advanced?.card.kind, "training_target");
  assert.ok(advanced?.card.trainingTarget.noveltyKey.length > 0);
}

testDailyTrainingTargetSelector();
console.log("dailyTrainingTargetSelector ok");
