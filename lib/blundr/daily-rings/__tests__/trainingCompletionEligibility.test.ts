import assert from "node:assert/strict";
import test from "node:test";
import { Chess } from "chess.js";

import {
  isBatteryCompletionEligible,
  isTempoCompletionEligible,
} from "../trainingCompletionEligibility";

const MATE_START_FEN = "7k/5Q2/6K1/8/8/8/8/8 w - - 0 1";
const STALEMATE_START_FEN = "7k/5K2/8/6Q1/8/8/8/8 w - - 0 1";

function resultFen(fen: string, uci: string): string {
  const game = new Chess(fen);
  const move = game.move({
    from: uci.slice(0, 2),
    to: uci.slice(2, 4),
    promotion: uci[4] as "q" | "r" | "b" | "n" | undefined,
  });
  assert.ok(move);
  return game.fen();
}

test("authoritative restricted branch completion closes Tempo", () => {
  assert.equal(
    isTempoCompletionEligible({
      trainingMode: "restricted",
      bookComplete: false,
      branchCompleteEligible: true,
      terminalProof: true,
    }),
    true,
  );
});

test("committed learner-delivered checkmate is Battery submission eligible", () => {
  const completedFen = resultFen(MATE_START_FEN, "f7h7");
  assert.equal(new Chess(completedFen).isCheckmate(), true);
  assert.equal(
    isBatteryCompletionEligible({
      trainingMode: "continuation",
      userEnteredContinuation: true,
      completedFen,
      lastMoveUci: "f7h7",
      lastMoveColor: "w",
      userColor: "w",
    }),
    true,
  );
});

test("Battery submission does not depend on continuation move-rating availability", () => {
  const completedFen = resultFen(MATE_START_FEN, "f7h7");

  assert.equal(
    isBatteryCompletionEligible({
      trainingMode: "continuation",
      userEnteredContinuation: true,
      completedFen,
      lastMoveUci: "f7h7",
      lastMoveColor: "w",
      userColor: "w",
    }),
    true,
  );
});

test("non-mate, stalemate, opponent mate ownership and invalid state cannot submit Battery evidence", () => {
  const normalFen = resultFen(new Chess().fen(), "e2e4");
  const stalemateFen = resultFen(STALEMATE_START_FEN, "g5g6");
  assert.equal(new Chess(stalemateFen).isStalemate(), true);

  const mateFen = resultFen(MATE_START_FEN, "f7h7");
  const base = {
    trainingMode: "continuation" as const,
    userEnteredContinuation: true,
    completedFen: mateFen,
    lastMoveUci: "f7h7",
    lastMoveColor: "w" as const,
    userColor: "w" as const,
  };

  const cases = [
    { ...base, trainingMode: "restricted" as const },
    { ...base, userEnteredContinuation: false },
    { ...base, completedFen: normalFen, lastMoveUci: "e2e4" },
    { ...base, completedFen: stalemateFen, lastMoveUci: "g5g6" },
    { ...base, lastMoveUci: null },
    { ...base, lastMoveColor: "b" as const },
    { ...base, completedFen: "not-a-fen" },
  ];

  for (const input of cases) {
    assert.equal(isBatteryCompletionEligible(input), false);
  }
});

test("partial, unproven, and continuation states cannot close Tempo", () => {
  assert.equal(
    isTempoCompletionEligible({
      trainingMode: "restricted",
      bookComplete: false,
      branchCompleteEligible: true,
      terminalProof: false,
    }),
    false,
  );
  assert.equal(
    isTempoCompletionEligible({
      trainingMode: "continuation",
      bookComplete: true,
      branchCompleteEligible: true,
      terminalProof: true,
    }),
    false,
  );
});
