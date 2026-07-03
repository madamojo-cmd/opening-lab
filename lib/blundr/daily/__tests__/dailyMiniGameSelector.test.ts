import assert from "node:assert/strict";

import { selectDailyMiniGame } from "../miniGames/dailyMiniGameSelector";
import type { DailyBlundrMasteryState, DailyBlundrMasteryRecord } from "../dailyBlundrTypes";

function makeRecord(key: string, currentMastery: number, confidence: number, lastSeenAt = "2026-07-01T00:00:00.000Z"): DailyBlundrMasteryRecord {
  return {
    key,
    label: key,
    domain: "mini_game",
    cardKind: "mini_game",
    sources: ["daily_attempt"],
    exposureCount: 4,
    attemptCount: 4,
    attempts: 4,
    correctCount: 3,
    correct: 3,
    incorrectCount: 1,
    incorrect: 1,
    recentAccuracy: 0.8,
    lifetimeAccuracy: 0.75,
    avgResponseTimeMs: 1200,
    hintRate: 0.1,
    revealRate: 0.1,
    currentMastery,
    confidence,
    currentDifficulty: "beginner",
    streak: 2,
    lapses: 1,
    firstSeenAt: "2026-06-30T00:00:00.000Z",
    lastSeenAt,
    lastAttemptAt: lastSeenAt,
    lastCorrectAt: lastSeenAt,
    lastIncorrectAt: "2026-06-30T00:00:00.000Z",
    updatedAt: lastSeenAt,
  };
}

function makeMasteryState(entries: Record<string, DailyBlundrMasteryRecord>): DailyBlundrMasteryState {
  return {
    schemaVersion: 1,
    updatedAt: "2026-07-02T00:00:00.000Z",
    records: entries,
  };
}

export function testDailyMiniGameSelector(): void {
  const lowKingMastery = makeMasteryState({
    "mini:king_race:king_pathing": makeRecord("mini:king_race:king_pathing", 0.1, 0.2),
    "mini:king_race:opposition": makeRecord("mini:king_race:opposition", 0.1, 0.2),
    "mini:king_race:goal_zone": makeRecord("mini:king_race:goal_zone", 0.1, 0.2),
    "mini:knight_gymnasium:knight_geometry": makeRecord("mini:knight_gymnasium:knight_geometry", 0.9, 0.9),
    "mini:knight_gymnasium:shortest_path": makeRecord("mini:knight_gymnasium:shortest_path", 0.9, 0.9),
    "mini:pawn_wars:pawn_race": makeRecord("mini:pawn_wars:pawn_race", 0.9, 0.9),
    "mini:pawn_wars:promotion": makeRecord("mini:pawn_wars:promotion", 0.9, 0.9),
    "mini:pawn_wars:passed_pawn": makeRecord("mini:pawn_wars:passed_pawn", 0.9, 0.9),
  });

  const introSelection = selectDailyMiniGame({
    mastery: lowKingMastery,
    dateKey: "2026-07-02",
    now: "2026-07-02T09:00:00.000Z",
    dueReviewCount: 0,
    selectedReviewCount: 0,
    recentMiniGameIds: [],
    recentFenKeys: [],
    sessionMiniGameIds: [],
    excludedMiniGameIds: [],
  });

  assert.ok(introSelection);
  assert.equal(introSelection?.definition.id, "king_race");
  assert.equal(introSelection?.card.kind, "mini_game");
  assert.equal(introSelection?.card.miniGame.miniGameId, "king_race");
  assert.ok(introSelection?.difficulty === "intro" || introSelection?.difficulty === "beginner");

  const excludedSelection = selectDailyMiniGame({
    mastery: lowKingMastery,
    dateKey: "2026-07-02",
    now: "2026-07-02T09:00:00.000Z",
    dueReviewCount: 0,
    selectedReviewCount: 0,
    recentMiniGameIds: [],
    recentFenKeys: [],
    sessionMiniGameIds: ["king_race"],
    excludedMiniGameIds: [],
  });

  assert.ok(excludedSelection);
  assert.notEqual(excludedSelection?.definition.id, "king_race");

  const masteredAllSelection = selectDailyMiniGame({
    mastery: makeMasteryState({
      "mini:king_race:king_pathing": makeRecord("mini:king_race:king_pathing", 0.95, 0.92, "2026-07-01T10:00:00.000Z"),
      "mini:king_race:opposition": makeRecord("mini:king_race:opposition", 0.95, 0.92, "2026-07-01T10:00:00.000Z"),
      "mini:king_race:goal_zone": makeRecord("mini:king_race:goal_zone", 0.95, 0.92, "2026-07-01T10:00:00.000Z"),
      "mini:knight_gymnasium:knight_geometry": makeRecord("mini:knight_gymnasium:knight_geometry", 0.94, 0.9, "2026-07-01T10:00:00.000Z"),
      "mini:knight_gymnasium:shortest_path": makeRecord("mini:knight_gymnasium:shortest_path", 0.94, 0.9, "2026-07-01T10:00:00.000Z"),
      "mini:pawn_wars:pawn_race": makeRecord("mini:pawn_wars:pawn_race", 0.93, 0.91, "2026-07-01T10:00:00.000Z"),
      "mini:pawn_wars:promotion": makeRecord("mini:pawn_wars:promotion", 0.93, 0.91, "2026-07-01T10:00:00.000Z"),
      "mini:pawn_wars:passed_pawn": makeRecord("mini:pawn_wars:passed_pawn", 0.93, 0.91, "2026-07-01T10:00:00.000Z"),
    }),
    dateKey: "2026-07-02",
    now: "2026-07-02T09:00:00.000Z",
    dueReviewCount: 0,
    selectedReviewCount: 0,
    recentMiniGameIds: [],
    recentFenKeys: [],
    sessionMiniGameIds: [],
    excludedMiniGameIds: [],
  });

  assert.ok(masteredAllSelection);
  assert.ok(masteredAllSelection?.difficulty === "intermediate" || masteredAllSelection?.difficulty === "advanced" || masteredAllSelection?.difficulty === "expert");
}

testDailyMiniGameSelector();
console.log("dailyMiniGameSelector ok");

