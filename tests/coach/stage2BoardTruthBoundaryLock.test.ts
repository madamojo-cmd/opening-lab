import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { buildBoardTruth } from "../../lib/blundr/brain/providers/boardTruthProvider";
import { buildCurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";
import { lockInstructionTarget } from "../../lib/blundr/runtime/instructionFrameLock";

const DERIVED_FEATURE_TERMS = [
  "development",
  "center",
  "recapture",
  "tactic",
  "plan",
  "piece activity",
  "pawn structure",
  "king attack",
  "material win",
  "forced sequence",
  "best move",
  "only move",
] as const;

export function testStage2BoardTruthBoundaryLock(): void {
  const frame = buildCurrentInstructionFrame({
    kind: "guided_move",
    fenBefore: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
    ply: 1,
    sideToMove: "black",
    target: lockInstructionTarget({
      uci: "e7e5",
      san: "e5",
      pieceType: "pawn",
      color: "black",
      source: "opening_tree",
      reason: "board_truth_boundary",
    }),
    mode: "guided",
    source: "opening_tree",
  });

  const boardTruth = buildBoardTruth({ frame });

  // Approved board-truth fact checks.
  assert.equal(typeof boardTruth.targetLegal === "boolean" || boardTruth.targetLegal === "unknown" || boardTruth.targetLegal === "not_applicable", true);
  assert.equal(typeof boardTruth.targetSan === "string" || boardTruth.targetSan === null || typeof boardTruth.targetSan === "undefined", true);
  assert.equal(typeof frame.target?.uci, "string");
  assert.equal(typeof boardTruth.sourcePiece?.type === "string" || boardTruth.sourcePiece === null, true);
  assert.equal(typeof boardTruth.sourcePiece?.square === "string" || boardTruth.sourcePiece === null, true);
  assert.equal(typeof boardTruth.destinationOccupancy?.square === "string" || boardTruth.destinationOccupancy === null, true);
  assert.equal(typeof boardTruth.isCapture, "boolean");
  assert.equal(typeof boardTruth.isCheck, "boolean");
  assert.equal(typeof boardTruth.isCheckmate, "boolean");
  assert.equal(typeof boardTruth.isCastle, "boolean");
  assert.equal(typeof boardTruth.isPromotion, "boolean");
  assert.equal(typeof boardTruth.isEnPassant, "boolean");
  assert.equal(typeof boardTruth.fenBefore, "string");
  assert.equal(typeof boardTruth.fenAfterTarget === "string" || boardTruth.fenAfterTarget === null || typeof boardTruth.fenAfterTarget === "undefined", true);

  // Boundary: derived-feature labels are not board-truth fields.
  const boardTruthJson = JSON.stringify(boardTruth).toLowerCase();
  for (const term of DERIVED_FEATURE_TERMS) {
    assert.equal(
      boardTruthJson.includes(term),
      false,
      `board_truth_boundary_violation_contains_derived_term:${term}`,
    );
  }

  // Provider implementation itself should remain purely board-truth and not encode derived-feature labeling.
  const providerPath = path.resolve(__dirname, "..", "..", "lib", "blundr", "brain", "providers", "boardTruthProvider.ts");
  const providerSource = fs.readFileSync(providerPath, "utf8").toLowerCase();
  for (const term of DERIVED_FEATURE_TERMS) {
    assert.equal(
      providerSource.includes(term),
      false,
      `board_truth_provider_source_should_not_encode_derived_feature_term:${term}`,
    );
  }
}

testStage2BoardTruthBoundaryLock();
console.log("stage2BoardTruthBoundaryLock ok");
