import type { StaticMiniGameScenario } from "./staticMiniGameHelpers";
import { buildBoardFenFromPieces } from "./staticMiniGameHelpers";
import { createStaticMiniGameDefinition } from "./staticMiniGameDefinitionFactory";

const IMBALANCE_ARENA_SCENARIOS: StaticMiniGameScenario[] = [
  {
    scenarioId: "knight_wins_on_e7",
    fen: buildBoardFenFromPieces(
      [
        { square: "g1", piece: "K" },
        { square: "f5", piece: "N" },
        { square: "e7", piece: "n" },
        { square: "g8", piece: "k" },
      ],
      "w",
    ),
    prompt: "Use the knight to exploit the closed-center imbalance.",
    summary: "Knight wins on e7",
    note: "Knight wins on e7",
    expectedMoveUci: "f5e7",
    goalSquares: ["e7"],
    targetSquares: ["e7"],
    flagSquares: ["e7"],
    moveLimit: 1,
    bestKnownMoves: 1,
  },
  {
    scenarioId: "rook_activity_e8",
    fen: buildBoardFenFromPieces(
      [
        { square: "g1", piece: "K" },
        { square: "e1", piece: "R" },
        { square: "e8", piece: "r" },
        { square: "g8", piece: "k" },
      ],
      "w",
    ),
    prompt: "Activate the rook on the open file and win the exchange race.",
    summary: "Rook activity on e8",
    note: "Rook activity on e8",
    expectedMoveUci: "e1e8",
    goalSquares: ["e8"],
    targetSquares: ["e8"],
    flagSquares: ["e8"],
    moveLimit: 1,
    bestKnownMoves: 1,
  },
  {
    scenarioId: "bishop_attack_f7",
    fen: buildBoardFenFromPieces(
      [
        { square: "g1", piece: "K" },
        { square: "c4", piece: "B" },
        { square: "d3", piece: "Q" },
        { square: "f7", piece: "p" },
        { square: "g7", piece: "p" },
        { square: "h7", piece: "p" },
        { square: "g8", piece: "k" },
      ],
      "w",
    ),
    prompt: "Use the piece imbalance to crack the king shelter.",
    summary: "Bishop attack on f7",
    note: "Bishop attack on f7",
    expectedMoveUci: "c4f7",
    goalSquares: ["f7"],
    targetSquares: ["f7"],
    flagSquares: ["f7"],
    moveLimit: 1,
    bestKnownMoves: 1,
  },
];

export const imbalanceArenaDefinition = createStaticMiniGameDefinition(
  {
    id: "imbalance_arena",
    title: "Imbalance Arena",
    summary: "Teach how to handle piece imbalances.",
    displayName: "Imbalance Arena",
    shortDescription: "Play the position by leaning into the imbalance.",
    skillIds: ["bishop_vs_knight", "rook_activity", "exchange_value", "material_imbalance", "color_complex"],
    recommendedFor: ["intro", "beginner", "early_intermediate", "intermediate", "advanced", "expert"],
    instructions: "Choose the move that best exploits the imbalance in the position.",
    estimatedSeconds: 50,
    tags: ["imbalance", "activity", "conversion"],
    canAppearInDailyBlundr: true,
    canAppearInStandalonePractice: true,
    conceptIds: [
      "concept:piece_imbalances:knight_vs_bishop_closed_center",
      "concept:piece_imbalances:rook_on_open_file",
      "concept:piece_imbalances:exchange_sacrifice_compensation",
      "concept:piece_imbalances:material_vs_initiative",
      "concept:piece_imbalances:good_bishop_vs_bad_bishop",
    ],
    buildPrompt: (scenario) => scenario.prompt,
    buildSummary: (scenario) => scenario.summary,
  },
  IMBALANCE_ARENA_SCENARIOS,
);

