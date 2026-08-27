import { describe, expect, it } from "vitest";

import { verifyRuntimeLearningPosition } from "../runtimeLearningPosition";
import type { TrainerTreeIndex } from "@/lib/blundr/trainingRuntime/runtimeEvidenceIndices";

const startFen =
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

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
        { openingId: "italian-white", playKeyBefore: "startpos", moveUci: "e2e4" },
        { openingId: "italian-white", playKeyBefore: "startpos", moveUci: "d2d4" },
      ],
    ],
  ]),
};

describe("runtime learning preferred authority", () => {
  it("accepts only the selected preferred expected move for indexed openings", () => {
    const preferred = verifyRuntimeLearningPosition(
      {
        openingId: "italian-white",
        moveOrderKey: "startpos",
        canonicalFen: startFen,
        expectedMoveUci: "e2e4",
      },
      trainer,
    );
    expect(preferred?.expectedMoveUci).toBe("e2e4");

    const superseded = verifyRuntimeLearningPosition(
      {
        openingId: "italian-white",
        moveOrderKey: "startpos",
        canonicalFen: startFen,
        expectedMoveUci: "d2d4",
      },
      trainer,
    );
    expect(superseded).toBeNull();
  });
});
