import assert from "node:assert/strict";

import { buildCandidateFromPlacements } from "../miniGames/generation/miniGameCandidateFactory";
import { validateMiniGameObjective } from "../miniGames/generation/miniGameObjectiveValidation";
import type { MiniGameGenerationCandidate } from "../miniGames/generation/miniGameGenerationTypes";

function makeInput(miniGameId: MiniGameGenerationCandidate["miniGameId"], seed: string) {
  return {
    miniGameId,
    source: "standalone_review" as const,
    seed,
    difficulty: "medium" as const,
    userBoardPreference: { boardOrientation: "white" as const },
    recentScenarioKeys: [] as string[],
    dateKey: "2026-07-09",
    userId: "objective-user",
  };
}

function makeNoPawnKingMoveCandidate(
  miniGameId: MiniGameGenerationCandidate["miniGameId"],
  family: string,
  motif: string,
): MiniGameGenerationCandidate {
  return buildCandidateFromPlacements({
    ...makeInput(miniGameId, `${miniGameId}-${family}`),
    family,
    motif,
    estimatedTimeSeconds: 30,
    placements: [
      { square: "d4", piece: "K" },
      { square: "g7", piece: "k" },
    ],
    sideToMove: "w",
    prompt: "Test prompt",
    instruction: "Test instruction",
    goal: "Test goal",
    explanation: "Test explanation",
    solutionFrom: "d4",
    solutionTo: "e4",
    acceptedMoves: ["d4e4"],
    overlays: {
      keySquares: ["e4"],
      targetSquares: ["e4"],
      route: ["d4", "e4"],
    },
    conceptTags: ["test"],
    analysis: {
      complexity: 20,
      candidateCount: 4,
      forcing: false,
      blockerCount: 0,
      decoyCount: 0,
      routeLength: 1,
      materialBalance: 0,
    },
  })!;
}

const tacticBase = buildCandidateFromPlacements({
  ...makeInput("tactic_shots", "tactic-valid"),
  family: "knight_fork",
  motif: "knight fork",
  estimatedTimeSeconds: 30,
  placements: [
    { square: "f3", piece: "N" },
    { square: "c2", piece: "K" },
    { square: "h8", piece: "k" },
  ],
  sideToMove: "w",
  prompt: "Test prompt",
  instruction: "Test instruction",
  goal: "Test goal",
  explanation: "Test explanation",
  solutionFrom: "f3",
  solutionTo: "e5",
  acceptedMoves: ["f3e5"],
  overlays: {
    keySquares: ["d7"],
    targetSquares: ["d7"],
    route: ["f3", "e5"],
  },
  conceptTags: ["fork", "knight"],
  analysis: {
    complexity: 24,
    candidateCount: 4,
    forcing: true,
    blockerCount: 0,
    decoyCount: 0,
    routeLength: 1,
    materialBalance: 0,
  },
})!;
assert.equal(
  validateMiniGameObjective({
    ...tacticBase,
    overlays: {
      ...tacticBase.overlays,
      targetSquares: ["a1"],
    },
  }).passed,
  false,
  "Expected a false fork claim to be rejected",
);

const keySquareBase = buildCandidateFromPlacements({
  ...makeInput("key_square_conquest", "key-valid"),
  family: "key_square_conquest",
  motif: "central control square",
  estimatedTimeSeconds: 30,
  placements: [
    { square: "e5", piece: "K" },
    { square: "h8", piece: "k" },
  ],
  sideToMove: "w",
  prompt: "Test prompt",
  instruction: "Test instruction",
  goal: "Test goal",
  explanation: "Test explanation",
  solutionFrom: "e5",
  solutionTo: "d5",
  acceptedMoves: ["e5d5"],
  overlays: {
    keySquares: ["d5"],
    targetSquares: ["d5"],
    route: ["e5", "d5"],
  },
  conceptTags: ["key square"],
  analysis: {
    complexity: 22,
    candidateCount: 4,
    forcing: false,
    blockerCount: 0,
    decoyCount: 0,
    routeLength: 1,
    materialBalance: 0,
  },
})!;
assert.equal(
  validateMiniGameObjective({
    ...keySquareBase,
    motif: "central control square",
    overlays: {
      ...keySquareBase.overlays,
      keySquares: ["a1"],
      targetSquares: ["a1"],
    },
  }).passed,
  false,
  "Expected an ineffective key-square claim to be rejected",
);

const structureReject = makeNoPawnKingMoveCandidate("structure_builder", "structure_builder", "structure repair");
assert.equal(validateMiniGameObjective(structureReject).passed, false, "Expected a structure claim with no pawn skeleton to be rejected");

const imbalanceReject = makeNoPawnKingMoveCandidate("imbalance_arena", "imbalance_arena", "space advantage");
assert.equal(validateMiniGameObjective(imbalanceReject).passed, false, "Expected a position with no imbalance to be rejected");

const techniqueReject = makeNoPawnKingMoveCandidate("technique_lab", "technique_lab", "direct opposition");
assert.equal(
  validateMiniGameObjective({ ...techniqueReject, board: { ...techniqueReject.board, fen: "bad fen" } }).passed,
  false,
  "Expected incoherent technique lab board to be rejected",
);

const kingRaceBase = buildCandidateFromPlacements({
  ...makeInput("king_race", "king-race-valid"),
  family: "king_race",
  motif: "king catches pawn",
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
    keySquares: ["c4"],
    targetSquares: ["c4"],
    route: ["c3", "c4"],
  },
  conceptTags: ["king race"],
  analysis: {
    complexity: 20,
    candidateCount: 4,
    forcing: false,
    blockerCount: 0,
    decoyCount: 0,
    routeLength: 1,
    materialBalance: 0,
  },
})!;
assert.equal(
  validateMiniGameObjective({
    ...kingRaceBase,
    overlays: {
      ...kingRaceBase.overlays,
      keySquares: ["a1"],
      targetSquares: ["a1"],
    },
  }).passed,
  false,
  "Expected a race claim with a worse distance to be rejected",
);

const knightGymBase = buildCandidateFromPlacements({
  ...makeInput("knight_gymnasium", "knight-valid"),
  family: "knight_gymnasium",
  motif: "quiet reroute",
  estimatedTimeSeconds: 30,
  placements: [
    { square: "f3", piece: "N" },
    { square: "h8", piece: "k" },
    { square: "c2", piece: "K" },
  ],
  sideToMove: "w",
  prompt: "Test prompt",
  instruction: "Test instruction",
  goal: "Test goal",
  explanation: "Test explanation",
  solutionFrom: "f3",
  solutionTo: "e5",
  acceptedMoves: ["f3e5"],
  overlays: {
    keySquares: ["d7"],
    targetSquares: ["d7"],
    route: ["f3", "e5"],
  },
  conceptTags: ["knight geometry"],
  analysis: {
    complexity: 24,
    candidateCount: 4,
    forcing: false,
    blockerCount: 0,
    decoyCount: 0,
    routeLength: 1,
    materialBalance: 0,
  },
})!;
assert.equal(
  validateMiniGameObjective({
    ...knightGymBase,
    motif: "quiet reroute",
    overlays: {
      ...knightGymBase.overlays,
      keySquares: ["a1"],
      targetSquares: ["a1"],
    },
  }).passed,
  false,
  "Expected a route claim without improvement to be rejected",
);

const pawnWarsReject = makeNoPawnKingMoveCandidate("pawn_wars", "pawn_wars", "promotion race");
assert.equal(validateMiniGameObjective(pawnWarsReject).passed, false, "Expected a non-calculable promotion race to be rejected");

console.log("dailyMiniGameObjectiveValidation.test.ts passed");
