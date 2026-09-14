import assert from "node:assert/strict";
import test from "node:test";
import { Chess } from "chess.js";
import { createPositionIdentity } from "@/lib/blundr/contracts";
import {
  canonicalPositionFen,
  canonicalPositionFenFromChess,
  classifyChessRuleState,
} from "@/lib/blundr/chess/canonicalPosition";

test("canonical position identity ignores halfmove and fullmove counters", () => {
  const a = createPositionIdentity({
    canonicalFen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
    openingId: "italian-white",
    repertoireSide: "white",
  });
  const b = createPositionIdentity({
    canonicalFen:
      "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 12 20",
    openingId: "italian-white",
    repertoireSide: "white",
  });
  assert.equal(a.canonicalFen, b.canonicalFen);
  assert.equal(a.positionKey, b.positionKey);
});

test("canonical identity preserves castling-right differences", () => {
  assert.notEqual(
    canonicalPositionFen("r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1"),
    canonicalPositionFen("r3k2r/8/8/8/8/8/8/R3K2R w KQ - 0 1"),
  );
});

test("canonical identity preserves legally relevant en-passant state", () => {
  assert.notEqual(
    canonicalPositionFen("8/8/8/3pP3/8/8/8/K6k w - d6 0 1"),
    canonicalPositionFen("8/8/8/3pP3/8/8/8/K6k w - - 0 1"),
  );
});

test("draw rules distinguish claimable from automatic repetition and move-count draws", () => {
  const threefold = new Chess();
  for (const san of ["Nf3", "Nf6", "Ng1", "Ng8", "Nf3", "Nf6", "Ng1", "Ng8"]) {
    threefold.move(san);
  }
  const threefoldState = classifyChessRuleState(threefold);
  assert.equal(threefoldState.threefoldClaimable, true);
  assert.equal(threefoldState.fivefoldAutomatic, false);
  assert.equal(threefoldState.terminal, false);

  const fivefold = new Chess();
  for (const san of [
    "Nf3",
    "Nf6",
    "Ng1",
    "Ng8",
    "Nf3",
    "Nf6",
    "Ng1",
    "Ng8",
    "Nf3",
    "Nf6",
    "Ng1",
    "Ng8",
    "Nf3",
    "Nf6",
    "Ng1",
    "Ng8",
  ]) {
    fivefold.move(san);
  }
  const fivefoldState = classifyChessRuleState(
    fivefold,
    new Map([[canonicalPositionFenFromChess(fivefold), 5]]),
  );
  assert.equal(fivefoldState.fivefoldAutomatic, true);
  assert.equal(fivefoldState.terminal, true);

  const fifty = new Chess("r6k/8/8/8/8/8/8/R5K1 w - - 99 1");
  fifty.move("Kh1");
  const fiftyState = classifyChessRuleState(fifty);
  assert.equal(fiftyState.fiftyMoveClaimable, true);
  assert.equal(fiftyState.seventyFiveMoveAutomatic, false);
  assert.equal(fiftyState.terminal, false);

  const seventyFive = new Chess("r6k/8/8/8/8/8/8/R5K1 w - - 149 1");
  seventyFive.move("Kh1");
  const seventyFiveState = classifyChessRuleState(seventyFive);
  assert.equal(seventyFiveState.seventyFiveMoveAutomatic, true);
  assert.equal(seventyFiveState.terminal, true);
});

test("terminal state covers checkmate, stalemate, and dead positions", () => {
  const mate = new Chess("7k/6Q1/6K1/8/8/8/8/8 b - - 150 1");
  const mateState = classifyChessRuleState(mate);
  assert.equal(mateState.checkmate, true);
  assert.equal(mateState.reason, "checkmate");

  const stalemate = new Chess("7k/5K2/6Q1/8/8/8/8/8 b - - 0 1");
  const stalemateState = classifyChessRuleState(stalemate);
  assert.equal(stalemateState.stalemate, true);
  assert.equal(stalemateState.reason, "stalemate");

  const dead = new Chess("8/8/8/8/8/8/8/K6k w - - 0 1");
  const deadState = classifyChessRuleState(dead);
  assert.equal(deadState.deadPosition, true);
  assert.equal(deadState.reason, "dead_position");
});
