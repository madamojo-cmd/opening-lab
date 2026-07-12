import { Chess, type PieceSymbol, type Square as ChessSquare } from "chess.js";
import type { DailyBlundrMiniGameCard, DailyMiniGameAdvanceAttempt, DailyMiniGameAdvanceResult, DailyMiniGameScenario, DailyMiniGameState } from "../dailyMiniGameTypes";
import type { DailyBlundrDifficulty } from "../../dailyBlundrTypes";
import type { RuntimeMiniGameScenario } from "./minigameContentLoader";
import { inferConceptTagsForMiniGame } from "../../concepts/dailyConceptTagging";

function mapDifficulty(value: string): DailyBlundrDifficulty {
  if (value === "intro") return "intro";
  if (value === "easy") return "beginner";
  if (value === "medium") return "intermediate";
  if (value === "hard") return "advanced";
  if (value === "expert") return "expert";
  if (value === "beginner") return "beginner";
  if (value === "early_intermediate") return "early_intermediate";
  if (value === "advanced") return "advanced";
  return "intermediate";
}

export function adaptProductionScenarioToCard(input: {
  scenario: RuntimeMiniGameScenario;
  source?: "daily_deck" | "standalone_review";
  deckRank?: number;
}): DailyBlundrMiniGameCard {
  const scenario = input.scenario;
  const difficulty = mapDifficulty(scenario.difficultyBand);
  const source = input.source ?? "standalone_review";
  const conceptIds = inferConceptTagsForMiniGame(scenario.miniGameId, []);
  const scenarioModel: DailyMiniGameScenario = {
    id: scenario.id,
    miniGameId: scenario.miniGameId,
    source,
    seed: scenario.id,
    generatedAt: new Date(0).toISOString(),
    createdAt: new Date(0).toISOString(),
    fen: scenario.fen,
    sideToMove: scenario.sideToMove,
    prompt: scenario.prompt.title,
    instructions: scenario.prompt.instruction,
    goal: scenario.prompt.instruction,
    acceptedMoves: [...scenario.solution.acceptedMoves],
    solution: { uci: scenario.solution.primaryMoveUci, san: null },
    explanation: scenario.explanation?.detailed ?? scenario.explanation?.short ?? "Review the key idea in this position.",
    conceptTags: [scenario.concept],
    difficulty,
    estimatedTimeSeconds: 60,
    validation: { checkedAt: new Date(0).toISOString(), valid: true, attempts: 1, issues: [] },
    scoring: { mode: "single_move", maxAttempts: 2, revealPenalty: 0.5, canRetry: true, correctMoveReward: 1 },
    retryBehavior: { allowRetry: true, refreshSeedOnRetry: false, nextLabel: "Next" },
    revealBehavior: { revealLabel: "Reveal", continueLabel: "Next" },
    novelty: { scenarioKey: scenario.quality.noveltyKey, cooldownGroup: scenario.miniGameId, recentScenarioKeys: [], avoidedRepeat: true },
    theme: scenario.concept,
  };
  const state: DailyMiniGameState = {
    miniGameId: scenario.miniGameId,
    scenarioId: scenario.id,
    scenario: scenarioModel,
    skillIds: [],
    difficulty,
    startFen: scenario.fen,
    currentFen: scenario.fen,
    sideToMove: scenario.sideToMove,
    learnerSide: scenario.orientation,
    moveLimit: Math.max(1, scenario.solution.line.length),
    plyCount: 0,
    completed: false,
    won: false,
    formationHash: scenario.quality.noveltyKey,
    noveltyKey: scenario.quality.noveltyKey,
    lastMoveUci: null,
    lastMoveSan: null,
  };
  return {
    id: `production-${scenario.id}`,
    kind: "mini_game",
    source: "daily_attempt",
    cardKey: `production-${scenario.id}`,
    positionKey: scenario.fen,
    fen: scenario.fen,
    expectedMoveUci: scenario.solution.primaryMoveUci,
    expectedMoveSan: null,
    playedMoveUci: null,
    playedMoveSan: null,
    openingId: null,
    openingName: null,
    patternId: scenario.concept,
    concept: scenario.concept,
    count: 1,
    weight: 1,
    lastSeenAt: null,
    note: scenario.prompt.instruction,
    signals: [scenario.concept],
    masteryTargets: [],
    confidence: "medium",
    difficulty,
    title: scenario.prompt.title,
    prompt: scenario.prompt.instruction,
    deckRank: input.deckRank ?? 0,
    priority: 0,
    masteryKey: `mini:${scenario.miniGameId}:${scenario.concept}`,
    sourceCount: 1,
    summary: scenario.explanation?.short ?? scenario.prompt.instruction,
    miniGame: state,
    conceptIds,
    primaryConceptId: conceptIds[0] ?? null,
  };
}

export function advanceProductionMiniGame(state: DailyMiniGameState, attempt: DailyMiniGameAdvanceAttempt): DailyMiniGameAdvanceResult {
  const scenario = state.scenario;
  if (!scenario) throw new Error("Production minigame state is missing its scenario");
  const attemptedMoveUci = attempt.uci.toLowerCase();
  const accepted = new Set([scenario.solution.uci.toLowerCase(), ...scenario.acceptedMoves.map((move) => move.toLowerCase())]);
  let legal = attempt.legal;
  let nextFen = state.currentFen;
  const from = attempt.from.toLowerCase();
  const to = attempt.to.toLowerCase();
  const promotion = attemptedMoveUci.slice(4, 5);
  const isSquare = (value: string): value is ChessSquare => /^[a-h][1-8]$/.test(value);
  const isPromotion = (value: string): value is PieceSymbol => value === "n" || value === "b" || value === "r" || value === "q";
  const parsedFrom: ChessSquare | null = isSquare(from) ? from : null;
  const parsedTo: ChessSquare | null = isSquare(to) ? to : null;
  const parsedPromotion: PieceSymbol | undefined = promotion && isPromotion(promotion) ? promotion : undefined;
  if (legal) {
    if (!parsedFrom || !parsedTo || (promotion && !parsedPromotion)) legal = false;
  }
  if (legal) {
    if (!parsedFrom || !parsedTo || (promotion && !parsedPromotion)) {
      legal = false;
    } else try {
      const chess = new Chess(state.currentFen);
      const move = chess.move({
        from: parsedFrom,
        to: parsedTo,
        promotion: parsedPromotion,
      });
      legal = Boolean(move);
      if (move) nextFen = chess.fen();
    } catch {
      legal = false;
    }
  }
  const won = legal && accepted.has(attemptedMoveUci);
  const nextState: DailyMiniGameState = {
    ...state,
    currentFen: nextFen,
    plyCount: state.plyCount + 1,
    completed: won,
    won,
    lastMoveUci: attempt.uci,
    lastMoveSan: attempt.san,
  };
  return {
    state: nextState,
    completed: won,
    won,
    legal,
    reason: !legal ? "illegal_move_attempt" : won ? "production_scenario_complete" : "incorrect_move",
    attemptedMoveUci: attempt.uci,
    attemptedMoveSan: attempt.san,
    moveCount: nextState.plyCount,
    illegalMoveCount: legal ? 0 : 1,
    scoreInput: {
      card: null,
      completed: won,
      won,
      moveCount: nextState.plyCount,
      moveLimit: state.moveLimit,
      illegalMoveCount: legal ? 0 : 1,
      blocked: false,
      perfectPath: won && nextState.plyCount === 1,
      objectiveCount: 1,
      objectivesCompleted: won ? 1 : 0,
      reason: !legal ? "illegal_move_attempt" : won ? "production_scenario_complete" : "incorrect_move",
    },
  };
}
