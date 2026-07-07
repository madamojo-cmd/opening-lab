import type { StaticMiniGameScenario } from "./staticMiniGameHelpers";
import { buildBoardFenFromPieces } from "./staticMiniGameHelpers";
import { createStaticMiniGameDefinition } from "./staticMiniGameDefinitionFactory";

const TACTIC_SHOTS_SCENARIOS: StaticMiniGameScenario[] = [
  {
    scenarioId: "fork_c8",
    fen: buildBoardFenFromPieces(
      [
        { square: "g1", piece: "K" },
        { square: "d6", piece: "N" },
        { square: "e8", piece: "k" },
        { square: "c8", piece: "q" },
      ],
      "w",
    ),
    prompt: "Find the fork that wins the queen and keeps the king under pressure.",
    summary: "Knight fork on c8",
    note: "Knight fork on c8",
    expectedMoveUci: "d6c8",
    goalSquares: ["c8", "e8"],
    targetSquares: ["c8"],
    flagSquares: ["c8"],
    moveLimit: 1,
    bestKnownMoves: 1,
  },
  {
    scenarioId: "back_rank_e8",
    fen: buildBoardFenFromPieces(
      [
        { square: "g1", piece: "K" },
        { square: "e1", piece: "R" },
        { square: "f2", piece: "P" },
        { square: "g2", piece: "P" },
        { square: "h2", piece: "P" },
        { square: "g8", piece: "k" },
        { square: "f7", piece: "p" },
        { square: "g7", piece: "p" },
        { square: "h7", piece: "p" },
      ],
      "w",
    ),
    prompt: "Hit the back rank before Tempo's defense settles.",
    summary: "Back-rank hit on e8",
    note: "Back-rank shot on e8",
    expectedMoveUci: "e1e8",
    goalSquares: ["e8", "g8"],
    flagSquares: ["e8"],
    moveLimit: 1,
    bestKnownMoves: 1,
  },
  {
    scenarioId: "queen_skewer_d8",
    fen: buildBoardFenFromPieces(
      [
        { square: "g1", piece: "K" },
        { square: "d4", piece: "Q" },
        { square: "e8", piece: "k" },
        { square: "e7", piece: "q" },
      ],
      "w",
    ),
    prompt: "Find the skewer that wins the loose queen and checks the king.",
    summary: "Queen skewer on d8",
    note: "Queen skewer on d8",
    expectedMoveUci: "d4d8",
    goalSquares: ["d8"],
    targetSquares: ["e7"],
    flagSquares: ["e7"],
    moveLimit: 1,
    bestKnownMoves: 1,
  },
];

export const tacticShotsDefinition = createStaticMiniGameDefinition(
  {
    id: "tactic_shots",
    title: "Tactic Shots",
    summary: "Fast tactical recognition from compact positions.",
    displayName: "Tactic Shots",
    shortDescription: "Spot the best tactical shot.",
    skillIds: ["forks", "pins", "skewers", "discovered_attack", "back_rank", "overloaded_piece"],
    recommendedFor: ["intro", "beginner", "early_intermediate", "intermediate", "advanced", "expert"],
    instructions: "Choose the tactical shot that best wins material or forces the king to react.",
    estimatedSeconds: 40,
    tags: ["tactical", "shot", "pattern"],
    canAppearInDailyBlundr: true,
    canAppearInStandalonePractice: true,
    conceptIds: [
      "concept:tactical_ideas:fork",
      "concept:tactical_ideas:pin",
      "concept:tactical_ideas:skewer",
      "concept:tactical_ideas:discovered_attack",
      "concept:tactical_ideas:back_rank_motif",
      "concept:tactical_ideas:overloaded_piece",
    ],
    buildPrompt: (scenario) => scenario.prompt,
    buildSummary: (scenario) => scenario.summary,
  },
  TACTIC_SHOTS_SCENARIOS,
);

