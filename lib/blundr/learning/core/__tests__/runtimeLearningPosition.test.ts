import assert from "node:assert/strict";
import test from "node:test";
import { Chess } from "chess.js";
import { verifyRuntimeLearningPosition } from "../runtimeLearningPosition";

const italianKey = "e2e4,e7e5,g1f3,b8c6,f1c4,f8c5";
const queensGambitKey = "d2d4,d7d5,c2c4";
const trainer = {
  nodesByKey: new Map([
    [
      `italian-white:${italianKey}`,
      {
        nodeId: "iw-six",
        openingId: "italian-white",
        playKey: italianKey,
        playSequenceUci: italianKey,
        ply: 6,
        sideToMove: "white" as const,
      },
    ],
    [
      `queens-gambit-white:${queensGambitKey}`,
      {
        nodeId: "qg-three",
        openingId: "queens-gambit-white",
        playKey: queensGambitKey,
        playSequenceUci: queensGambitKey,
        ply: 3,
        sideToMove: "black" as const,
      },
    ],
  ]),
  childMovesByParent: new Map([
    [
      `italian-white:${italianKey}`,
      [
        {
          openingId: "italian-white",
          playKeyBefore: italianKey,
          moveUci: "c2c3",
          rank: 1,
        },
      ],
    ],
    [
      `queens-gambit-white:${queensGambitKey}`,
      [
        {
          openingId: "queens-gambit-white",
          playKeyBefore: queensGambitKey,
          moveUci: "e7e6",
          rank: 1,
        },
      ],
    ],
  ]),
};

test("seen-line persistence resolves only canonical node-backed Trainer positions", () => {
  const italian = new Chess();
  for (const move of ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5"])
    italian.move(move);
  const verifiedItalian = verifyRuntimeLearningPosition(
    {
      openingId: "italian-white",
      moveOrderKey: italianKey,
      canonicalFen: italian.fen(),
      expectedMoveUci: "c2c3",
    },
    trainer,
  );
  assert.deepEqual(verifiedItalian, {
    openingId: "italian-white",
    moveOrderKey: italianKey,
    canonicalFen: italian.fen(),
    expectedMoveUci: "c2c3",
  });

  const queensGambit = new Chess();
  for (const move of ["d4", "d5", "c4"]) queensGambit.move(move);
  const alias = verifyRuntimeLearningPosition(
    {
      openingId: "qg-white",
      moveOrderKey: queensGambitKey,
      canonicalFen: queensGambit.fen(),
      expectedMoveUci: "e7e6",
    },
    trainer,
  );
  assert.equal(alias?.openingId, "queens-gambit-white");
  assert.equal(alias?.moveOrderKey, queensGambitKey);
  assert.equal(alias?.expectedMoveUci, "e7e6");

  assert.equal(
    verifyRuntimeLearningPosition(
      {
        openingId: "italian-white",
        moveOrderKey: italianKey,
        canonicalFen: italian.fen(),
        expectedMoveUci: "d2d4",
      },
      trainer,
    ),
    null,
  );
  assert.equal(
    verifyRuntimeLearningPosition(
      {
        openingId: "italian-white",
        moveOrderKey: queensGambitKey,
        canonicalFen: queensGambit.fen(),
      },
      trainer,
    ),
    null,
  );
  assert.equal(
    verifyRuntimeLearningPosition(
      {
        openingId: "italian-white",
        moveOrderKey:
          "e2e4,e7e5,g1f3,b8c6,f1c4,f8c5,c2c3,g8f6,d2d3,d7d6,e1g1,e8g8,e1e2",
        canonicalFen: italian.fen(),
      },
      trainer,
    ),
    null,
  );
});
