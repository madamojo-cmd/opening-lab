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

function testLegalMoveDotsVisibility(): void {
  const pageSource = fs.readFileSync(path.join(REPO_ROOT, "app", "page.tsx"), "utf8");
  const homeSection = pageSource.match(/activeTab==="home"&&<section[\s\S]*?<\/section>/)?.[0] ?? "";
  const repertoireSection = pageSource.match(/activeTab==="repertoire"&&<section[\s\S]*?<\/section>/)?.[0] ?? "";

  assert.equal(/countPositions\s*\(/.test(pageSource), false, "app_page_unsafe_render_time_count_positions_call");
  assert.equal(homeSection.includes("buildOpeningTree("), false, "app_page_home_section_unsafe_tree_building");
  assert.equal(repertoireSection.includes("buildOpeningTree("), false, "app_page_repertoire_section_unsafe_tree_building");
  assert.equal(/getRepertoirePositionCount\s*\(/.test(pageSource), true, "app_page_missing_catalog_metadata_position_helper");

  const whiteGame = new Chess();
  const whiteSelectedSquare = "g1";
  const whiteVisibleSquares = buildTrainingBoardVisibilitySquares({
    instructionTargetFrom: null,
    instructionTargetTo: null,
    selectedSquare: whiteSelectedSquare,
    selectedLegalMoveSquares: legalDestinations(whiteGame, whiteSelectedSquare),
  });
  assert.equal(whiteVisibleSquares.has(whiteSelectedSquare), true);
  assert.equal(whiteVisibleSquares.has("f3"), true);
  assert.equal(whiteVisibleSquares.has("h3"), true);

  const blackGame = new Chess();
  blackGame.move("e4");
  const blackSelectedSquare = "g8";
  const blackVisibleSquares = buildTrainingBoardVisibilitySquares({
    instructionTargetFrom: null,
    instructionTargetTo: null,
    selectedSquare: blackSelectedSquare,
    selectedLegalMoveSquares: legalDestinations(blackGame, blackSelectedSquare),
  });
  assert.equal(blackVisibleSquares.has(blackSelectedSquare), true);
  assert.equal(blackVisibleSquares.has("f6"), true);
  assert.equal(blackVisibleSquares.has("h6"), true);
}

testLegalMoveDotsVisibility();
console.log("legalMoveDotsVisibility ok");
