import assert from "node:assert/strict";
import test from "node:test";

import { resolveSelectedRuntimeLineOpponentReply } from "../selectedRuntimeLineReply";

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
