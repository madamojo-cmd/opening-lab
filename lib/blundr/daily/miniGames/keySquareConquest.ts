import type { StaticMiniGameScenario } from "./staticMiniGameHelpers";
import { buildBoardFenFromPieces } from "./staticMiniGameHelpers";
import { createStaticMiniGameDefinition } from "./staticMiniGameDefinitionFactory";

const KEY_SQUARE_CONQUEST_SCENARIOS: StaticMiniGameScenario[] = [
  {
    scenarioId: "outpost_e5",
    fen: buildBoardFenFromPieces(
      [
        { square: "g1", piece: "K" },
        { square: "d3", piece: "N" },
        { square: "e8", piece: "k" },
        { square: "d6", piece: "b" },
        { square: "c6", piece: "p" },
        { square: "f6", piece: "p" },
      ],
      "w",
    ),
    prompt: "Occupy the strong outpost that anchors the attack.",
    summary: "Outpost on e5",
    note: "Outpost on e5",
    expectedMoveUci: "d3e5",
    goalSquares: ["e5"],
    targetSquares: ["e5"],
    flagSquares: ["e5"],
    moveLimit: 1,
    bestKnownMoves: 1,
  },
  {
    scenarioId: "invasion_e7",
    fen: buildBoardFenFromPieces(
      [
        { square: "g1", piece: "K" },
        { square: "e1", piece: "R" },
        { square: "e8", piece: "k" },
        { square: "g7", piece: "p" },
        { square: "h7", piece: "p" },
      ],
      "w",
    ),
    prompt: "Invade the key square that opens the enemy position.",
    summary: "Rook invasion on e7",
    note: "Rook invasion on e7",
    expectedMoveUci: "e1e7",
    goalSquares: ["e7"],
    targetSquares: ["e7"],
    flagSquares: ["e7"],
    moveLimit: 1,
    bestKnownMoves: 1,
  },
  {
    scenarioId: "king_entry_d5",
    fen: buildBoardFenFromPieces(
      [
        { square: "e4", piece: "K" },
        { square: "e8", piece: "k" },
        { square: "c6", piece: "p" },
      ],
      "w",
    ),
    prompt: "Use the king to occupy the key entry square.",
    summary: "King entry on d5",
    note: "King entry on d5",
    expectedMoveUci: "e4d5",
    goalSquares: ["d5"],
    targetSquares: ["d5"],
    flagSquares: ["d5"],
    moveLimit: 1,
    bestKnownMoves: 1,
  },
];

export const keySquareConquestDefinition = createStaticMiniGameDefinition(
  {
    id: "key_square_conquest",
    title: "Key Square Conquest",
    summary: "Teach key-square control and entry squares.",
    displayName: "Key Square Conquest",
    shortDescription: "Occupy the square that changes the game.",
    skillIds: ["key_square_control", "outpost", "invasion_square", "king_entry", "blockade"],
    recommendedFor: ["intro", "beginner", "early_intermediate", "intermediate", "advanced", "expert"],
    instructions: "Choose the move that occupies or controls the decisive square.",
    estimatedSeconds: 45,
    tags: ["key_square", "control", "entry"],
    canAppearInDailyBlundr: true,
    canAppearInStandalonePractice: true,
    conceptIds: [
      "concept:key_squares:weak_square",
      "concept:key_squares:outpost_square",
      "concept:key_squares:invasion_square",
      "concept:key_squares:king_entry_square",
      "concept:key_squares:blockade_square",
    ],
    buildPrompt: (scenario) => scenario.prompt,
    buildSummary: (scenario) => scenario.summary,
  },
  KEY_SQUARE_CONQUEST_SCENARIOS,
);

