import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { Chess } from "chess.js";

import { detectProjectiveTactics, shouldSuppressProjectiveTacticsForCheckmate } from "../../lib/blundr/projectiveTactics";

const checkmate = new Chess("r1bqkb1r/pppp1Qpp/2n2n2/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4");
assert.equal(checkmate.isCheckmate(), true);
assert.equal(shouldSuppressProjectiveTacticsForCheckmate({ isCheckmate: checkmate.isCheckmate() }), true);

const candidateVisuals = shouldSuppressProjectiveTacticsForCheckmate({ isCheckmate: checkmate.isCheckmate() })
  ? []
  : detectProjectiveTactics({
    fen: checkmate.fen(),
    lastMoveUci: "h5f7",
    learnerColor: "w",
    movedColor: "w",
  }).visuals;
assert.deepEqual(candidateVisuals, []);

const pageSource = fs.readFileSync(path.resolve(__dirname, "..", "..", "app", "page.tsx"), "utf8");
assert.equal(pageSource.includes("shouldSuppressProjectiveTacticsForCheckmate"), true);
assert.equal(pageSource.includes("nextGame.isCheckmate()"), true);

console.log("projectiveTacticsCheckmateSuppression ok");
