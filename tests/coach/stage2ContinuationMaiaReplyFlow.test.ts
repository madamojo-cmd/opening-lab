import assert from "node:assert/strict";

import { shouldScheduleContinuationOpponentReply } from "../../lib/blundr/runtime/continuationOpponentReplyGate";

assert.equal(
  shouldScheduleContinuationOpponentReply({
    trainingMode: "restricted",
    gameOver: false,
    turn: "b",
    userColor: "w",
    nextBranchCompleteEligible: true,
  }),
  false,
  "restricted terminal branch-complete state must still block opponent reply",
);

assert.equal(
  shouldScheduleContinuationOpponentReply({
    trainingMode: "continuation",
    gameOver: false,
    turn: "b",
    userColor: "w",
    nextBranchCompleteEligible: true,
  }),
  true,
  "continuation should schedule Maia after the learner moves even if old branch-complete state remains true",
);

assert.equal(
  shouldScheduleContinuationOpponentReply({
    trainingMode: "continuation",
    gameOver: false,
    turn: "w",
    userColor: "w",
    nextBranchCompleteEligible: true,
  }),
  false,
  "Maia must not move when it is still the learner turn",
);

assert.equal(
  shouldScheduleContinuationOpponentReply({
    trainingMode: "continuation",
    gameOver: true,
    turn: "b",
    userColor: "w",
    nextBranchCompleteEligible: false,
  }),
  false,
  "game-over positions must not schedule opponent reply",
);

console.log("stage2ContinuationMaiaReplyFlow ok");
