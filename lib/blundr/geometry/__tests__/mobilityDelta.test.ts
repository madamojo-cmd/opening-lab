import assert from "node:assert/strict";
import { Chess } from "chess.js";

import { computeMobilityDelta } from "../mobilityDelta";

export function testMobilityDelta(): void {
  const start = new Chess();
  assert.equal(typeof computeMobilityDelta(start.fen(), "g1f3").movedPieceGain, "number");
  assert.throws(() => computeMobilityDelta(start.fen(), "g1g3"), /Illegal move/);

  const italian = new Chess();
  italian.move("e4");
  italian.move("e5");
  italian.move("Nf3");
  italian.move("Nc6");
  assert.equal(typeof computeMobilityDelta(italian.fen(), "f1c4").movedPieceGain, "number");

  const capture = new Chess();
  capture.move("e4");
  capture.move("d5");
  assert.doesNotThrow(() => computeMobilityDelta(capture.fen(), "e4d5"));
}
