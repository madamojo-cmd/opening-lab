import assert from "node:assert/strict";

import { buildCandidateFromPlacements } from "../miniGames/generation/miniGameCandidateFactory";
import { classifyMiniGameDifficulty } from "../miniGames/generation/miniGameDifficultyClassifier";

const base = buildCandidateFromPlacements({
  miniGameId: "king_race",
  source: "standalone_review",
  seed: "difficulty-base",
  family: "king_race",
  motif: "king catches pawn",
  difficulty: "medium",
  estimatedTimeSeconds: 30,
  placements: [
    { square: "c3", piece: "K" },
    { square: "h8", piece: "k" },
  ],
  sideToMove: "w",
  prompt: "Test prompt",
  instruction: "Test instruction",
  goal: "Test goal",
  explanation: "Test explanation",
  solutionFrom: "c3",
  solutionTo: "c4",
  acceptedMoves: ["c3c4"],
  overlays: {
    keySquares: ["a1"],
    targetSquares: ["a1"],
    route: ["c3", "c4"],
  },
  conceptTags: ["king race"],
  analysis: {
    complexity: 24,
    decoyCount: 0,
    blockerCount: 0,
    routeLength: 1,
    forcing: false,
    materialBalance: 0,
    candidateCount: 4,
  },
})!;

const easy = {
  ...base,
  seed: "difficulty-easy",
  analysis: {
    ...base.analysis,
    complexity: 10,
    decoyCount: 0,
    blockerCount: 0,
    routeLength: 1,
    forcing: false,
    candidateCount: 1,
  },
};
assert.equal(classifyMiniGameDifficulty(easy), "easy", "Expected low-clutter direct scenarios to classify as easy");

const medium = {
  ...base,
  seed: "difficulty-medium",
  analysis: {
    ...base.analysis,
    complexity: 18,
    decoyCount: 1,
    blockerCount: 1,
    routeLength: 2,
    forcing: false,
    candidateCount: 3,
  },
};
assert.equal(classifyMiniGameDifficulty(medium), "medium", "Expected decoys and longer routes to classify as medium");

const hard = {
  ...base,
  seed: "difficulty-hard",
  analysis: {
    ...base.analysis,
    complexity: 52,
    decoyCount: 3,
    blockerCount: 2,
    routeLength: 4,
    forcing: true,
    materialBalance: 2,
    candidateCount: 6,
  },
};
assert.equal(classifyMiniGameDifficulty(hard), "hard", "Expected narrow margins and blockers to classify as hard");

const seedVariant = {
  ...easy,
  seed: "difficulty-seed-variant",
};
assert.equal(
  classifyMiniGameDifficulty(seedVariant),
  classifyMiniGameDifficulty(easy),
  "Difficulty should not be a random seed label",
);

console.log("dailyMiniGameDifficultyClassifier.test.ts passed");
