import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { Chess } from "chess.js";

import { buildTrainingBoardVisibilitySquares } from "../../lib/blundr/presentation/legalMoveDotVisibility";

const REPO_ROOT = path.resolve(__dirname, "..", "..");

function legalDestinations(game: Chess, square: string): string[] {
  return (game.moves({ square: square as any, verbose: true }) as Array<{ to: string }>)
    .map((move) => move.to.toLowerCase())
    .sort();
}

export function testStage2LegalMoveDotsVisibility(): void {
  const pageSource = fs.readFileSync(path.join(REPO_ROOT, "app", "page.tsx"), "utf8");

  assert.equal(
    /instructionTargetFrom:\s*suppressPlainPreTargetHighlights\s*\?\s*null\s*:\s*instructionTarget\?\.from\s*\?\?\s*null/.test(pageSource),
    true,
    "app_page_missing_selection_safe_board_visibility_gate",
  );
  assert.equal(
    /instructionTarget\?\.from\s*\?\?\s*null/.test(pageSource),
    true,
    "app_page_missing_optional_instruction_target_from_in_selection_gate",
  );
  assert.equal(
    /instructionTarget\?\.to\s*\?\?\s*null/.test(pageSource),
    true,
    "app_page_missing_optional_instruction_target_to_in_selection_gate",
  );
  assert.equal(
    /if\(\s*!instructionTarget\?\.uci\s*\|\|\s*suppressPlainPreTargetHighlights\s*\)/.test(pageSource),
    false,
    "app_page_reintroduced_clear_all_on_missing_instruction_target",
  );

  const whiteGame = new Chess();
  const whiteSelectedSquare = "g1";
  const whiteVisibleSquares = buildTrainingBoardVisibilitySquares({
    instructionTargetFrom: null,
    instructionTargetTo: null,
    selectedSquare: whiteSelectedSquare,
    selectedLegalMoveSquares: legalDestinations(whiteGame, whiteSelectedSquare),
  });
  assert.equal(whiteVisibleSquares.has(whiteSelectedSquare), true, "white_selected_square_must_remain_visible");
  assert.equal(whiteVisibleSquares.has("f3"), true, "white_legal_destination_must_remain_visible");
  assert.equal(whiteVisibleSquares.has("h3"), true, "white_legal_destination_must_remain_visible");

  const blackGame = new Chess();
  blackGame.move("e4");
  const blackSelectedSquare = "g8";
  const blackVisibleSquares = buildTrainingBoardVisibilitySquares({
    instructionTargetFrom: null,
    instructionTargetTo: null,
    selectedSquare: blackSelectedSquare,
    selectedLegalMoveSquares: legalDestinations(blackGame, blackSelectedSquare),
  });
  assert.equal(blackVisibleSquares.has(blackSelectedSquare), true, "black_selected_square_must_remain_visible");
  assert.equal(blackVisibleSquares.has("f6"), true, "black_legal_destination_must_remain_visible");
  assert.equal(blackVisibleSquares.has("h6"), true, "black_legal_destination_must_remain_visible");
}

testStage2LegalMoveDotsVisibility();
console.log("stage2LegalMoveDotsVisibility ok");
