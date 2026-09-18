import assert from "node:assert/strict";
import test from "node:test";

import { verifyRuntimeLearningPosition } from "../runtimeLearningPosition";
import type { TrainerTreeIndex } from "@/lib/blundr/trainingRuntime/runtimeEvidenceIndices";

const startFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

const trainer: TrainerTreeIndex = {
  nodesByKey: new Map([
    [
      "italian-white:startpos",
      {
        nodeId: "start",
        openingId: "italian-white",
        playKey: "startpos",
        playSequenceUci: "",
        ply: 0,
        sideToMove: "white",
        learnerPerspective: "white",
      },
    ],
  ]),
  childMovesByParent: new Map([
    [
      "italian-white:startpos",
      [
        {
          openingId: "italian-white",
          playKeyBefore: "startpos",
          moveUci: "e2e4",
        },
        {
          openingId: "italian-white",
          playKeyBefore: "startpos",
          moveUci: "d2d4",
        },
      ],
    ],
  ]),
};

test("runtime learning preferred authority accepts only the selected preferred expected move for indexed openings", () => {
  const preferred = verifyRuntimeLearningPosition(
    {
      openingId: "italian-white",
      moveOrderKey: "startpos",
      canonicalFen: startFen,
      expectedMoveUci: "e2e4",
    },
    trainer,
  );
  assert.equal(preferred?.expectedMoveUci, "e2e4");

  const superseded = verifyRuntimeLearningPosition(
    {
      openingId: "italian-white",
      moveOrderKey: "startpos",
      canonicalFen: startFen,
      expectedMoveUci: "d2d4",
    },
    trainer,
  );
  assert.equal(superseded, null);
});
