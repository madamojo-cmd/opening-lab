import assert from "node:assert/strict";

import type { DailyBlundrCard } from "../dailyBlundrTypes";
import {
  attachConceptTagsToDailyCard,
  inferConceptTagsForFailureType,
  inferConceptTagsForMiniGame,
  inferConceptTagsForTrainingTarget,
  makeConceptMasteryKey,
  normalizeConceptId,
} from "../concepts/dailyConceptTagging";

function makeBaseCard(): DailyBlundrCard {
  return {
    source: "daily_attempt",
    cardKey: "card:test",
    positionKey: "card:test",
    fen: "8/8/8/8/8/8/8/8 w - - 0 1",
    expectedMoveUci: null,
    expectedMoveSan: null,
    playedMoveUci: null,
    playedMoveSan: null,
    openingId: null,
    openingName: "Test",
    patternId: null,
    concept: null,
    count: 1,
    weight: 1,
    lastSeenAt: null,
    note: null,
    signals: [],
    masteryTargets: [],
    confidence: "medium",
    difficulty: "beginner",
    id: "card:test",
    kind: "recall",
    title: "Test",
    prompt: "Test",
    repertoireId: null,
    reviewCardId: null,
    reviewDedupeKey: null,
    reviewPromptKind: null,
    reviewStatus: null,
    reviewDueAt: null,
    deckRank: 1,
    priority: 1,
    masteryKey: "card:test",
    sourceCount: 1,
    summary: "Test",
  } as DailyBlundrCard;
}

export function testDailyConceptTagging(): void {
  assert.equal(normalizeConceptId("concept:key_squares:weak_square"), "concept:key_squares:weak_square");
  assert.equal(normalizeConceptId("concept:key_squares:weak_square:mastery"), "concept:key_squares:weak_square");
  assert.equal(makeConceptMasteryKey("concept:key_squares:weak_square"), "concept:key_squares:weak_square:mastery");

  assert.deepEqual(
    inferConceptTagsForMiniGame("king_race", ["king_pathing", "opposition", "goal_zone"]),
    [
      "concept:key_squares:king_entry_square",
      "concept:key_squares:opposition_square",
      "concept:special_techniques:opposition",
    ],
  );
  assert.deepEqual(
    inferConceptTagsForTrainingTarget("break_timing_drill", ["break_timing", "pawn_break"]),
    [
      "concept:tactical_ideas:pawn_break",
      "concept:pawn_structures:open_center",
      "concept:special_techniques:breakthrough",
    ],
  );
  assert.deepEqual(inferConceptTagsForFailureType("wrong_book_move"), []);

  const tagged = attachConceptTagsToDailyCard(makeBaseCard(), [
    "concept:key_squares:weak_square",
    "concept:key_squares:weak_square",
    "concept:pawn_structures:passed_pawn",
  ]);

  assert.deepEqual(tagged.conceptIds, ["concept:key_squares:weak_square", "concept:pawn_structures:passed_pawn"]);
  assert.equal(tagged.primaryConceptId, "concept:key_squares:weak_square");
  assert.deepEqual(tagged.conceptMasteryKeys, [
    "concept:key_squares:weak_square:mastery",
    "concept:pawn_structures:passed_pawn:mastery",
  ]);
}

testDailyConceptTagging();
console.log("dailyConceptTagging ok");
