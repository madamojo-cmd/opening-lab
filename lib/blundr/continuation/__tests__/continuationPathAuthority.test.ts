import assert from "node:assert/strict";
import test from "node:test";
import { Chess } from "chess.js";

import { verifyContinuationPath } from "../continuationPathAuthority";

function terminalAfterE4(): string {
  const game = new Chess();
  game.move("e4");
  return game.fen();
}

test("continuation authority replays a legal opponent reply and one user move", () => {
  const result = verifyContinuationPath({
    terminalFen: terminalAfterE4(),
    userColor: "w",
    pathUci: ["e7e5", "g1f3"],
  });
  assert.deepEqual(result.pathUci, ["e7e5", "g1f3"]);
  const expected = new Chess(terminalAfterE4());
  expected.move("e5");
  expected.move("Nf3");
  assert.equal(result.completedFen, expected.fen());
});

test("continuation authority rejects illegal and non-user terminal moves", () => {
  assert.throws(
    () =>
      verifyContinuationPath({
        terminalFen: terminalAfterE4(),
        userColor: "w",
        pathUci: ["e7e5", "g1g5"],
      }),
    /continuation_move_illegal/,
  );
  assert.throws(
    () =>
      verifyContinuationPath({
        terminalFen: terminalAfterE4(),
        userColor: "w",
        pathUci: ["e7e5"],
      }),
    /continuation_user_move_unverified/,
  );
});

test("continuation authority accepts exactly one user move", () => {
  assert.throws(
    () =>
      verifyContinuationPath({
        terminalFen: terminalAfterE4(),
        userColor: "w",
        pathUci: ["e7e5", "g1f3", "b8c6"],
      }),
    /continuation_path_invalid/,
  );
});
