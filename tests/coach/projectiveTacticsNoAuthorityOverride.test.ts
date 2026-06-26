import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { Chess } from "chess.js";

import { detectProjectiveTactics } from "../../lib/blundr/projectiveTactics";

const fen = "k2q4/8/8/8/b2R4/8/8/7K w - - 0 1";
const game = new Chess(fen);
const beforeFen = game.fen();
const beforeLegalMoves = game.moves().sort();
const result = detectProjectiveTactics({
  fen,
  lastMoveUci: "d1d4",
  learnerColor: "w",
  movedColor: "w",
});

assert.equal(game.fen(), beforeFen);
assert.deepEqual(game.moves().sort(), beforeLegalMoves);
assert.equal(result.visuals.length, 1);
assert.equal(result.visuals[0].kind, "fork");
assert.equal(result.visuals[0].label, "Fork");
assert.equal(result.visuals[0].confidence, "high");
assert.equal(result.visuals[0].lineSegments.every((segment) => segment.shape === "straight"), true);
assert.deepEqual(Object.keys(result).sort(), ["visuals"]);

const pinResult = detectProjectiveTactics({
  fen: "4k3/3q4/2n5/1B6/8/8/8/4K3 b - - 0 1",
  lastMoveUci: "a4b5",
  learnerColor: "w",
  movedColor: "w",
});

assert.equal(pinResult.visuals.length, 1);
assert.equal(pinResult.visuals[0].kind, "pin");
assert.equal(pinResult.visuals[0].label, "Pin");
assert.equal(pinResult.visuals[0].lineSegments.length, 2);
assert.equal(pinResult.visuals[0].lineSegments.every((segment) => segment.shape === "straight"), true);
assert.equal(pinResult.visuals[0].confidence, "high");

const projectiveDir = path.resolve(__dirname, "..", "..", "lib", "blundr", "projectiveTactics");
const source = fs.readdirSync(projectiveDir)
  .filter((file) => file.endsWith(".ts"))
  .map((file) => fs.readFileSync(path.join(projectiveDir, file), "utf8"))
  .join("\n");

assert.equal(/maia|MAIA/.test(source), false, "projective_tactics_must_not_import_or_call_maia");
assert.equal(/runtimeLines|stage2RuntimeTrainableRepertoires/.test(source), false, "projective_tactics_must_not_import_runtime_generated_files");
assert.equal(/stage2ApprovedContentPackage/.test(source), false, "projective_tactics_must_not_import_approved_content_generated_package");
assert.equal(/Stockfish|stockfish/.test(source), false, "projective_tactics_must_not_import_stockfish");
assert.equal(/node:fs|node:child_process/.test(source), false, "projective_tactics_must_not_import_server_modules");

console.log("projectiveTacticsNoAuthorityOverride ok");
