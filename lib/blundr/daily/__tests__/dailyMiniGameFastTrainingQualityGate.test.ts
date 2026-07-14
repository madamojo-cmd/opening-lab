import assert from "node:assert/strict";
import test from "node:test";

import { DAILY_MINI_GAME_REGISTRY } from "../miniGames/dailyMiniGameRegistry";
import { generateMiniGameScenarioAsync } from "../miniGames/generation/generatedMiniGameRegistry";
import { buildFenFromPieces } from "../miniGames/generation/miniGameFenBuilder";
import {
  countPawns,
  countPieces,
  countSidePieces,
  hasGenericExplanation,
  hasMinimumPlausibleChoices,
  hasPreAnswerSpoilerOverlays,
  validateTrainingQuality,
} from "../miniGames/generation/miniGameTrainingQualityGate";
import type { MiniGameGenerationCandidate } from "../miniGames/generation/miniGameGenerationTypes";

type CandidateInput = {
  miniGameId: MiniGameGenerationCandidate["miniGameId"];
  source: MiniGameGenerationCandidate["source"];
  family: string;
  motif?: string;
  difficulty: MiniGameGenerationCandidate["difficulty"];
  pieces: Array<{ square: string; piece: string }>;
  sideToMove?: "w" | "b";
  prompt: string;
  instruction: string;
  goal: string;
  explanation: string;
  from: string;
  to: string;
  acceptedMoves?: string[];
  targetSquares?: string[];
  keySquares?: string[];
  arrows?: Array<{ from: string; to: string; type: string }>;
  conceptTags: string[];
  candidateCount?: number;
};

function makeCandidate(input: CandidateInput): MiniGameGenerationCandidate {
  const fen = buildFenFromPieces(input.pieces as never, input.sideToMove ?? "w");
  return {
    miniGameId: input.miniGameId,
    source: input.source,
    seed: `fast-training-gate-${input.miniGameId}-${input.family}`,
    family: input.family,
    motif: input.motif ?? input.family,
    difficulty: input.difficulty,
    estimatedTimeSeconds: 30,
    board: {
      fen,
      orientation: "white",
      sideToMove: input.sideToMove ?? "w",
      lockedOrientation: true,
    },
    prompt: input.prompt,
    instruction: input.instruction,
    goal: input.goal,
    explanation: input.explanation,
    solution: {
      primaryMoveUci: `${input.from}${input.to}`.toLowerCase(),
      acceptedMoves: input.acceptedMoves?.length ? [...input.acceptedMoves] : [`${input.from}${input.to}`.toLowerCase()],
      from: input.from as never,
      to: input.to as never,
      verification: {
        verified: true,
        verifier: "test",
        objectiveScore: 1,
        notes: [],
      },
    },
    overlays: {
      targetSquares: input.targetSquares as never,
      keySquares: input.keySquares as never,
      arrows: input.arrows as never,
      route: [input.from as never, input.to as never],
      lastMove: { from: input.from as never, to: input.to as never },
    },
    conceptTags: [...input.conceptTags],
    analysis: {
      complexity: 24,
      decoyCount: 1,
      blockerCount: 0,
      routeLength: 1,
      forcing: false,
      materialBalance: 0,
      candidateCount: input.candidateCount ?? 4,
      note: input.family,
    },
    transformIds: [],
  } as MiniGameGenerationCandidate;
}

function denseTacticPieces(): Array<{ square: string; piece: string }> {
  return [
    { square: "g1", piece: "K" },
    { square: "g8", piece: "k" },
    { square: "f3", piece: "N" },
    { square: "c8", piece: "q" },
    { square: "e8", piece: "r" },
    { square: "a2", piece: "P" },
    { square: "b2", piece: "P" },
    { square: "c2", piece: "P" },
    { square: "d2", piece: "P" },
    { square: "e2", piece: "P" },
    { square: "f2", piece: "P" },
    { square: "g2", piece: "P" },
    { square: "h2", piece: "P" },
    { square: "a7", piece: "p" },
    { square: "b7", piece: "p" },
    { square: "c7", piece: "p" },
    { square: "d7", piece: "p" },
    { square: "e7", piece: "p" },
  ];
}

test("daily minigame fast training quality gate", async () => {
  assert.equal(countPieces(buildFenFromPieces(denseTacticPieces() as never, "w")), 18);
  assert.equal(countPawns(buildFenFromPieces(denseTacticPieces() as never, "w")), 13);
  assert.equal(countSidePieces(buildFenFromPieces(denseTacticPieces() as never, "w"), "w"), 10);
  assert.equal(countSidePieces(buildFenFromPieces(denseTacticPieces() as never, "w"), "b"), 8);

  const sparseTactic = makeCandidate({
    miniGameId: "tactic_shots",
    source: "standalone_review",
    family: "knight_fork",
    motif: "knight fork",
    difficulty: "hard",
    pieces: denseTacticPieces().slice(0, 15),
    prompt: "Find the tactical shot.",
    instruction: "Choose the tactical shot.",
    goal: "Win material.",
    explanation: "Because the fork wins the queen after the jump and attacks the king.",
    from: "f3",
    to: "e5",
    targetSquares: ["d7", "g6"],
    keySquares: ["d7", "g6"],
    conceptTags: ["fork", "knight"],
    candidateCount: 2,
  });
  const sparseTacticResult = validateTrainingQuality(sparseTactic);
  assert.equal(sparseTacticResult.passed, false);
  assert.ok(sparseTacticResult.issues.some((issue) => issue.code === "sparse_tactic_board" || issue.code === "sparse_tactic_pawns"));

  const tacticSpoiler = makeCandidate({
    miniGameId: "tactic_shots",
    source: "standalone_review",
    family: "knight_fork",
    motif: "knight fork",
    difficulty: "hard",
    pieces: denseTacticPieces(),
    prompt: "Find the knight fork.",
    instruction: "Jump the knight to fork the targets.",
    goal: "Fork both targets.",
    explanation: "Because the fork wins the queen after the jump and attacks the king.",
    from: "f3",
    to: "e5",
    targetSquares: ["d7", "g6"],
    keySquares: ["d7", "g6"],
    conceptTags: ["fork", "knight"],
    candidateCount: 2,
  });
  const tacticSpoilerResult = validateTrainingQuality(tacticSpoiler);
  assert.equal(tacticSpoilerResult.passed, false);
  assert.ok(tacticSpoilerResult.issues.some((issue) => issue.code === "motif_spoiler"));

  const tacticOverlaySpoiler = makeCandidate({
    miniGameId: "tactic_shots",
    source: "standalone_review",
    family: "back_rank",
    motif: "back rank",
    difficulty: "medium",
    pieces: denseTacticPieces(),
    prompt: "Hit the back rank.",
    instruction: "Move the rook to the back rank.",
    goal: "Pressure the king.",
    explanation: "Because the rook attacks the king and creates pressure on the back rank.",
    from: "e1",
    to: "e8",
    targetSquares: ["g8"],
    keySquares: ["g8"],
    arrows: [{ from: "e1", to: "e8", type: "solution" }],
    conceptTags: ["back rank", "rook"],
    candidateCount: 2,
  });
  const tacticOverlaySpoilerResult = validateTrainingQuality(tacticOverlaySpoiler);
  assert.equal(tacticOverlaySpoilerResult.passed, false);
  assert.ok(tacticOverlaySpoilerResult.issues.some((issue) => issue.code === "pre_answer_spoiler"));
  assert.equal(hasPreAnswerSpoilerOverlays(tacticOverlaySpoiler), true);

  const structureSparse = makeCandidate({
    miniGameId: "structure_builder",
    source: "standalone_review",
    family: "iqp_advance",
    motif: "isolated queen pawn",
    difficulty: "medium",
    pieces: [
      { square: "g1", piece: "K" },
      { square: "g8", piece: "k" },
      { square: "d4", piece: "P" },
      { square: "b2", piece: "N" },
      { square: "c2", piece: "B" },
      { square: "e2", piece: "R" },
      { square: "f2", piece: "Q" },
      { square: "g2", piece: "N" },
      { square: "h2", piece: "B" },
      { square: "a7", piece: "Q" },
      { square: "b7", piece: "N" },
      { square: "c7", piece: "B" },
    ],
    prompt: "Advance the isolated queen pawn.",
    instruction: "Push the pawn.",
    goal: "Open the center.",
    explanation: "Because the pawn advances and opens the center for the rook.",
    from: "d4",
    to: "d5",
    targetSquares: ["d5"],
    keySquares: ["d5"],
    conceptTags: ["iqp", "pawn structure"],
    candidateCount: 2,
  });
  const structureSparseResult = validateTrainingQuality(structureSparse);
  assert.equal(structureSparseResult.passed, false);
  assert.ok(structureSparseResult.issues.some((issue) => issue.code === "sparse_structure_pawns"));

  const structureNoBeforeAfter = makeCandidate({
    miniGameId: "structure_builder",
    source: "standalone_review",
    family: "minority_attack",
    motif: "minority attack",
    difficulty: "medium",
    pieces: [
      { square: "g1", piece: "K" },
      { square: "g8", piece: "k" },
      { square: "b4", piece: "P" },
      { square: "c4", piece: "P" },
      { square: "d4", piece: "P" },
      { square: "e4", piece: "P" },
      { square: "f4", piece: "P" },
      { square: "g4", piece: "P" },
      { square: "a7", piece: "p" },
      { square: "b7", piece: "p" },
      { square: "c7", piece: "p" },
      { square: "d7", piece: "p" },
      { square: "e7", piece: "p" },
      { square: "f7", piece: "p" },
    ],
    prompt: "Start the minority attack.",
    instruction: "Push the pawn.",
    goal: "Open files on the queenside.",
    explanation: "Because the queenside pawn keeps the file tight, this creates pressure and supports the rook.",
    from: "b4",
    to: "b5",
    targetSquares: ["c6"],
    keySquares: ["c6"],
    conceptTags: ["minority attack", "pawn structure"],
    candidateCount: 2,
  });
  const structureNoBeforeAfterResult = validateTrainingQuality(structureNoBeforeAfter);
  assert.equal(structureNoBeforeAfterResult.passed, false);
  assert.ok(structureNoBeforeAfterResult.issues.some((issue) => issue.code === "structure_before_after_missing"));

  const genericImbalance = makeCandidate({
    miniGameId: "imbalance_arena",
    source: "standalone_review",
    family: "exchange_sac_compensation",
    motif: "exchange sacrifice compensation",
    difficulty: "hard",
    pieces: [
      { square: "g1", piece: "K" },
      { square: "g8", piece: "k" },
      { square: "d1", piece: "Q" },
      { square: "a1", piece: "R" },
      { square: "a8", piece: "r" },
      { square: "c4", piece: "B" },
      { square: "e4", piece: "b" },
      { square: "a2", piece: "P" },
      { square: "b2", piece: "P" },
      { square: "c2", piece: "P" },
      { square: "d2", piece: "P" },
      { square: "e2", piece: "P" },
      { square: "f2", piece: "P" },
      { square: "g2", piece: "P" },
    ],
    prompt: "Find the exchange sacrifice.",
    instruction: "Sacrifice the exchange.",
    goal: "Create compensation.",
    explanation: "This is the best move.",
    from: "a1",
    to: "a8",
    targetSquares: ["g8"],
    keySquares: ["g8"],
    conceptTags: ["exchange sac", "compensation"],
    candidateCount: 2,
  });
  const genericImbalanceResult = validateTrainingQuality(genericImbalance);
  assert.equal(genericImbalanceResult.passed, false);
  assert.ok(genericImbalanceResult.issues.some((issue) => issue.code === "generic_explanation"));

  const minimalTechnique = makeCandidate({
    miniGameId: "technique_lab",
    source: "daily_deck",
    family: "direct_opposition",
    motif: "direct opposition",
    difficulty: "easy",
    pieces: [
      { square: "e4", piece: "K" },
      { square: "e6", piece: "k" },
      { square: "e5", piece: "P" },
    ],
    prompt: "Take direct opposition.",
    instruction: "Move the king into direct opposition.",
    goal: "Hold the draw.",
    explanation: "The king uses opposition because it holds the draw after the key square.",
    from: "e4",
    to: "e5",
    targetSquares: ["e5"],
    keySquares: ["e5"],
    conceptTags: ["opposition", "king endgame"],
    candidateCount: 4,
  });
  const minimalTechniqueResult = validateTrainingQuality(minimalTechnique);
  assert.equal(minimalTechniqueResult.passed, true);

  const kingRace = makeCandidate({
    miniGameId: "king_race",
    source: "daily_deck",
    family: "king_catches_pawn",
    motif: "king catches pawn",
    difficulty: "medium",
    pieces: [
      { square: "e4", piece: "K" },
      { square: "e6", piece: "k" },
      { square: "d5", piece: "P" },
    ],
    prompt: "Win the king race.",
    instruction: "Move the king toward the key square.",
    goal: "Win the race.",
    explanation: "The king wins the race because distance and opposition decide the key square.",
    from: "e4",
    to: "e5",
    targetSquares: ["e5"],
    keySquares: ["e5"],
    conceptTags: ["king race", "distance"],
    candidateCount: 4,
  });
  const kingRaceResult = validateTrainingQuality(kingRace);
  assert.equal(kingRaceResult.passed, true);

  const pawnWarsReject = makeCandidate({
    miniGameId: "pawn_wars",
    source: "standalone_review",
    family: "basic_promotion_race",
    motif: "basic promotion race",
    difficulty: "easy",
    pieces: [
      { square: "e4", piece: "K" },
      { square: "e6", piece: "k" },
      { square: "e5", piece: "P" },
    ],
    prompt: "Win the promotion race.",
    instruction: "Push the pawn.",
    goal: "Promote first.",
    explanation: "The pawn push wins the race.",
    from: "e5",
    to: "e6",
    targetSquares: ["e6"],
    keySquares: ["e6"],
    conceptTags: ["promotion", "pawn race"],
    candidateCount: 1,
  });
  const pawnWarsRejectResult = validateTrainingQuality(pawnWarsReject);
  assert.equal(pawnWarsRejectResult.passed, false);
  assert.ok(pawnWarsRejectResult.issues.some((issue) => issue.code === "only_one_pawn" || issue.code === "sparse_pawn_count"));

  assert.equal(hasGenericExplanation("This is the best move."), true);
  assert.equal(hasGenericExplanation("The king wins the race because distance and opposition decide the key square."), false);
  assert.equal(hasMinimumPlausibleChoices(minimalTechnique), true);

  for (const definition of DAILY_MINI_GAME_REGISTRY) {
    let accepted = 0;
    for (let index = 0; index < 30; index += 1) {
      const scenario = await generateMiniGameScenarioAsync({
        miniGameId: definition.id,
        seed: `fast-training-quality-gate-${definition.id}-${index}`,
        difficulty: definition.recommendedFor[0] ?? "easy",
        source: "daily_deck",
        userBoardPreference: { boardOrientation: "white" as const },
        recentScenarioKeys: [],
        dateKey: "2026-07-09",
        userId: "fast-training-quality-gate-user",
      });
      if (scenario) {
        accepted += 1;
      }
    }
    assert.ok(accepted >= 5, `Expected at least 5 accepted scenarios for ${definition.id}, got ${accepted}`);
  }

  console.log("dailyMiniGameFastTrainingQualityGate.test.ts passed");
});
