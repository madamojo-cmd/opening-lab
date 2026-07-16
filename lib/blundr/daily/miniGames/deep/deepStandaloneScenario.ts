import type { DeepMiniGameScenario } from "./deepMiniGameTypes";
import { validateDeepMiniGameScenario } from "./deepMiniGameValidator";

const SCENARIOS: Record<string, DeepMiniGameScenario> = {
  tactic_shots_deep: {
    id: "standalone-deep-tactic-v1",
    miniGameId: "tactic_shots_deep",
    startFen: "4k3/8/8/8/8/8/4N3/4K3 w - - 0 1",
    sideToMove: "white",
    solution: {
      userMoves: ["e2c3", "c3e4"],
      opponentReplies: ["e8e7", "e7f7"],
    },
    schemaVersion: "deep-schema-v1",
    generatorVersion: "standalone-deep-generator-v1",
    validatorVersion: "standalone-deep-validator-v1",
    evidenceVersion: "curated-standalone-v1",
  },
  knight_gymnasium_deep: {
    id: "standalone-deep-knight-v1",
    miniGameId: "knight_gymnasium_deep",
    startFen: "7k/8/8/8/8/8/1N6/K7 w - - 0 1",
    sideToMove: "white",
    solution: {
      userMoves: ["b2c4", "c4e5"],
      opponentReplies: ["h8g8", "g8h7"],
      requiredTargets: ["c4", "e5"],
    },
    schemaVersion: "deep-schema-v1",
    generatorVersion: "standalone-deep-generator-v1",
    validatorVersion: "standalone-deep-validator-v1",
    evidenceVersion: "curated-standalone-v1",
  },
  king_pawn_lab: {
    id: "standalone-deep-king-pawn-v1",
    miniGameId: "king_pawn_lab",
    startFen: "7k/8/8/8/8/8/4K2P/8 w - - 0 1",
    sideToMove: "white",
    solution: {
      userMoves: ["e2d3", "d3e4"],
      opponentReplies: ["h8g8", "g8f8"],
      terminalResult: "win",
    },
    schemaVersion: "deep-schema-v1",
    generatorVersion: "standalone-deep-generator-v1",
    validatorVersion: "standalone-deep-validator-v1",
    evidenceVersion: "curated-standalone-v1",
  },
};

export function getDeepStandaloneScenario(
  id: string,
): DeepMiniGameScenario | null {
  const scenario = SCENARIOS[id];
  if (!scenario) return null;
  return validateDeepMiniGameScenario(scenario).ok ? scenario : null;
}
