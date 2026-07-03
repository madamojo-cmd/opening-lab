import assert from "node:assert/strict";

import { generateKnightGymnasiumMiniGameCard, advanceKnightGymnasiumMiniGame } from "../miniGames/knightGymnasium";
import type { DailyMiniGameGenerationContext, DailyMiniGameState } from "../miniGames/dailyMiniGameTypes";

function makeContext(): DailyMiniGameGenerationContext {
  return {
    dateKey: "2026-07-02",
    now: "2026-07-02T09:00:00.000Z",
    mastery: null,
    difficulty: "beginner",
    currentMastery: 0.22,
    confidence: 0.28,
    dueReviewCount: 0,
    selectedReviewCount: 0,
    recentMiniGameIds: [],
    recentFenKeys: [],
    sessionMiniGameIds: [],
  };
}

function makeWinState(): DailyMiniGameState {
  const startFen = "7k/8/8/8/8/2p5/8/KN6 w - - 0 1";
  return {
    miniGameId: "knight_gymnasium",
    skillIds: ["knight_geometry", "shortest_path"],
    difficulty: "beginner",
    startFen,
    currentFen: startFen,
    sideToMove: "w",
    learnerSide: "white",
    targetSquares: ["c3"],
    flagSquares: ["c3"],
    moveLimit: 1,
    plyCount: 0,
    bestKnownScore: 1,
    completed: false,
    won: false,
    formationHash: "knight-gym-win",
    noveltyKey: "knight_gymnasium:knight-gym-win",
  };
}

export function testKnightGymnasium(): void {
  const generated = generateKnightGymnasiumMiniGameCard(makeContext());
  assert.ok(generated);
  assert.equal(generated?.kind, "mini_game");
  assert.equal(generated?.miniGame.miniGameId, "knight_gymnasium");
  assert.deepEqual(generated?.miniGame.skillIds, ["knight_geometry", "shortest_path"]);
  assert.equal(generated?.masteryTargets.length, 2);

  const winResult = advanceKnightGymnasiumMiniGame(makeWinState(), {
    from: "b1",
    to: "c3",
    uci: "b1c3",
    san: "Nc3",
    legal: true,
  });
  assert.equal(winResult.completed, true);
  assert.equal(winResult.won, true);
  assert.equal(winResult.reason, "targets_captured");
  assert.equal(winResult.state.completed, true);
  assert.equal(winResult.state.won, true);
  assert.equal(winResult.scoreInput.won, true);
  assert.equal(winResult.scoreInput.objectivesCompleted, 1);

  const illegalResult = advanceKnightGymnasiumMiniGame(makeWinState(), {
    from: "b1",
    to: "b3",
    uci: "b1b3",
    san: "Nb3",
    legal: false,
  });
  assert.equal(illegalResult.completed, true);
  assert.equal(illegalResult.won, false);
  assert.equal(illegalResult.reason, "illegal_move_attempt");
  assert.equal(illegalResult.scoreInput.illegalMoveCount, 1);
}

testKnightGymnasium();
console.log("knightGymnasium ok");
