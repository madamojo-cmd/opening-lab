import assert from "node:assert/strict";

import { generateKingRaceMiniGameCard, advanceKingRaceMiniGame } from "../miniGames/kingRace";
import type { DailyMiniGameGenerationContext, DailyMiniGameState } from "../miniGames/dailyMiniGameTypes";

function makeContext(): DailyMiniGameGenerationContext {
  return {
    dateKey: "2026-07-02",
    now: "2026-07-02T09:00:00.000Z",
    mastery: null,
    difficulty: "intro",
    currentMastery: 0.12,
    confidence: 0.18,
    dueReviewCount: 0,
    selectedReviewCount: 0,
    recentMiniGameIds: [],
    recentFenKeys: [],
    sessionMiniGameIds: [],
  };
}

function makeWinState(): DailyMiniGameState {
  const startFen = "7k/8/8/8/8/8/4K3/8 w - - 0 1";
  return {
    miniGameId: "king_race",
    skillIds: ["king_pathing", "opposition", "goal_zone"],
    difficulty: "intro",
    startFen,
    currentFen: startFen,
    sideToMove: "w",
    learnerSide: "white",
    goalSquares: ["e3"],
    flagSquares: ["e3"],
    moveLimit: 1,
    plyCount: 0,
    bestKnownScore: 1,
    completed: false,
    won: false,
    formationHash: "king-race-win",
    noveltyKey: "king_race:king-race-win",
  };
}

export function testKingRace(): void {
  const generated = generateKingRaceMiniGameCard(makeContext());
  assert.ok(generated);
  assert.equal(generated?.kind, "mini_game");
  assert.equal(generated?.miniGame.miniGameId, "king_race");
  assert.deepEqual(generated?.miniGame.skillIds, ["king_pathing", "opposition", "goal_zone"]);
  assert.equal(generated?.masteryTargets.length, 3);

  const winResult = advanceKingRaceMiniGame(makeWinState(), {
    from: "e2",
    to: "e3",
    uci: "e2e3",
    san: "Ke3",
    legal: true,
  });
  assert.equal(winResult.completed, true);
  assert.equal(winResult.won, true);
  assert.equal(winResult.reason, "goal_reached");
  assert.equal(winResult.state.completed, true);
  assert.equal(winResult.state.won, true);
  assert.equal(winResult.scoreInput.won, true);
  assert.equal(winResult.scoreInput.objectivesCompleted, 1);

  const illegalResult = advanceKingRaceMiniGame(makeWinState(), {
    from: "e2",
    to: "e4",
    uci: "e2e4",
    san: "Ke4",
    legal: false,
  });
  assert.equal(illegalResult.completed, true);
  assert.equal(illegalResult.won, false);
  assert.equal(illegalResult.reason, "illegal_move_attempt");
  assert.equal(illegalResult.scoreInput.illegalMoveCount, 1);
}

testKingRace();
console.log("kingRace ok");
