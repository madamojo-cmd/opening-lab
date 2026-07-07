import type { StaticMiniGameScenario } from "./staticMiniGameHelpers";
import { buildBoardFenFromPieces } from "./staticMiniGameHelpers";
import { createStaticMiniGameDefinition } from "./staticMiniGameDefinitionFactory";

const TECHNIQUE_LAB_SCENARIOS: StaticMiniGameScenario[] = [
  {
    scenarioId: "opposition_kd3",
    fen: buildBoardFenFromPieces(
      [
        { square: "e2", piece: "K" },
        { square: "e5", piece: "k" },
        { square: "h2", piece: "P" },
      ],
      "w",
    ),
    prompt: "Use opposition to step into the key square.",
    summary: "Opposition with Kd3",
    note: "Opposition with Kd3",
    expectedMoveUci: "e2d3",
    goalSquares: ["d3"],
    targetSquares: ["d3"],
    flagSquares: ["d3"],
    moveLimit: 1,
    bestKnownMoves: 1,
  },
  {
    scenarioId: "triangulation_kf2",
    fen: buildBoardFenFromPieces(
      [
        { square: "e2", piece: "K" },
        { square: "e4", piece: "k" },
        { square: "h2", piece: "P" },
      ],
      "w",
    ),
    prompt: "Triangulate the king to gain the tempo you need.",
    summary: "Triangulation with Kf2",
    note: "Triangulation with Kf2",
    expectedMoveUci: "e2f2",
    goalSquares: ["f2"],
    targetSquares: ["f2"],
    flagSquares: ["f2"],
    moveLimit: 1,
    bestKnownMoves: 1,
  },
  {
    scenarioId: "rook_endgame_ra8",
    fen: buildBoardFenFromPieces(
      [
        { square: "e4", piece: "K" },
        { square: "a1", piece: "R" },
        { square: "e8", piece: "k" },
        { square: "a7", piece: "p" },
      ],
      "w",
    ),
    prompt: "Use rook activity to convert the endgame cleanly.",
    summary: "Rook endgame with Ra8",
    note: "Rook endgame with Ra8",
    expectedMoveUci: "a1a8",
    goalSquares: ["a8"],
    targetSquares: ["a8"],
    flagSquares: ["a8"],
    moveLimit: 1,
    bestKnownMoves: 1,
  },
];

export const techniqueLabDefinition = createStaticMiniGameDefinition(
  {
    id: "technique_lab",
    title: "Technique Lab",
    summary: "Practice special chess techniques and conversion patterns.",
    displayName: "Technique Lab",
    shortDescription: "Train endgame technique and conversion plans.",
    skillIds: ["conversion", "zugzwang", "triangulation", "rook_endgame", "mating_net"],
    recommendedFor: ["intro", "beginner", "early_intermediate", "intermediate", "advanced", "expert"],
    instructions: "Choose the move or plan that best applies the technique in the position.",
    estimatedSeconds: 55,
    tags: ["technique", "endgame", "conversion"],
    canAppearInDailyBlundr: true,
    canAppearInStandalonePractice: true,
    conceptIds: [
      "concept:special_techniques:opposition",
      "concept:special_techniques:triangulation",
      "concept:special_techniques:zugzwang",
      "concept:special_techniques:outside_passed_pawn",
      "concept:special_techniques:corresponding_squares",
      "concept:special_techniques:fortress_building",
    ],
    buildPrompt: (scenario) => scenario.prompt,
    buildSummary: (scenario) => scenario.summary,
  },
  TECHNIQUE_LAB_SCENARIOS,
);

