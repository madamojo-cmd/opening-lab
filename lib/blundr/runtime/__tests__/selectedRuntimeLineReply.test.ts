import assert from "node:assert/strict";
import test from "node:test";

import {
  resolvePlyFromFen,
  resolveSelectedRuntimeLineOpponentReply,
} from "../selectedRuntimeLineReply";

test("derives the current ply from the authoritative FEN instead of asynchronous UI history", () => {
  assert.equal(resolvePlyFromFen("start w - - 0 1"), 0);
  assert.equal(resolvePlyFromFen("after-e4 b - - 0 1"), 1);
  assert.equal(resolvePlyFromFen("after-e5 w - - 0 2"), 2);
  assert.equal(resolvePlyFromFen("after-nf3 b - - 1 2"), 3);
  assert.equal(resolvePlyFromFen("invalid"), null);
});

test("restricted opponent replies stay on the selected node-backed runtime line", () => {
  const line = ["e2e4", "e7e5", "g1f3", "b8c6"];
  assert.equal(
    resolveSelectedRuntimeLineOpponentReply({
      trainingMode: "restricted",
      selectedPlaySequenceUci: line,
      currentPly: 1,
      legalMoveUcis: ["c7c5", "e7e5"],
    }),
    "e7e5",
  );
  assert.equal(
    resolveSelectedRuntimeLineOpponentReply({
      trainingMode: "restricted",
      selectedPlaySequenceUci: line,
      currentPly: 3,
      legalMoveUcis: ["b8c6"],
    }),
    "b8c6",
  );
});

test("continuation, exhausted, and illegal selected replies do not bypass authority", () => {
  const base = {
    selectedPlaySequenceUci: ["e2e4", "e7e5"],
    currentPly: 1,
    legalMoveUcis: ["e7e5"],
  } as const;
  assert.equal(
    resolveSelectedRuntimeLineOpponentReply({
      ...base,
      trainingMode: "continuation",
    }),
    null,
  );
  assert.equal(
    resolveSelectedRuntimeLineOpponentReply({
      ...base,
      trainingMode: "restricted",
      currentPly: 2,
    }),
    null,
  );
  assert.equal(
    resolveSelectedRuntimeLineOpponentReply({
      ...base,
      trainingMode: "restricted",
      legalMoveUcis: ["c7c5"],
    }),
    null,
  );
});
