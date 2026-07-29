import type { DailyBlundrMiniGameCard } from "../dailyMiniGameTypes";
import type {
  StandaloneMiniGamePublicState,
  StandaloneMiniGameServerRecord,
} from "./standaloneMiniGameTypes";
import type { DeepMiniGameState } from "../deep";

export function projectStandaloneMiniGame(
  record: StandaloneMiniGameServerRecord,
): StandaloneMiniGamePublicState {
  if (record.kind === "deep" && record.scenario) {
    const state = record.state as DeepMiniGameState;
    return {
      instanceId: record.instanceId,
      revision: record.revision,
      miniGameId: record.scenario.miniGameId,
      source: "standalone_review",
      board: {
        fen: state.currentFen,
        orientation: record.scenario.sideToMove,
        sideToMove: state.currentFen.split(" ")[1] === "b" ? "b" : "w",
      },
      prompt:
        record.scenario.miniGameId === "tactic_shots_deep"
          ? "Deep Tactic Shots"
          : record.scenario.miniGameId === "knight_gymnasium_deep"
            ? "Knight Gymnasium"
            : "King & Pawn Lab",
      instruction: "Play the verified multi-step route.",
      goal: "Complete the objective without revealing the solution.",
      family: "deep_minigame",
      estimatedTimeSeconds: 90,
      status:
        record.expiresAt <= new Date().toISOString()
          ? "expired"
          : record.firstAttempt === "reveal"
            ? "revealed"
            : state.state === "completed"
              ? "completed"
              : state.moves.length
                ? "in_progress"
                : "ready",
      attemptCount: state.moves.length,
      retryCount: record.retryCount,
      firstAttempt: record.firstAttempt,
      feedback: state.feedback,
    };
  }
  const legacyState =
    record.state as import("../dailyMiniGameTypes").DailyMiniGameState;
  const card = record.card as DailyBlundrMiniGameCard;
  const game = card.miniGame;
  const status =
    record.expiresAt <= new Date().toISOString()
      ? "expired"
      : record.firstAttempt === "reveal"
        ? "revealed"
        : legacyState.completed
          ? "completed"
          : legacyState.plyCount > 0
            ? "in_progress"
            : "ready";
  return {
    instanceId: record.instanceId,
    revision: record.revision,
    miniGameId: game.miniGameId,
    source: "standalone_review",
    board: {
      fen: legacyState.currentFen || game.startFen,
      orientation: game.learnerSide,
      sideToMove: game.sideToMove,
    },
    prompt: card.title,
    instruction: card.summary,
    goal: "Play the best move for this position.",
    family: card.title,
    estimatedTimeSeconds: 40,
    status,
    attemptCount: legacyState.plyCount,
    retryCount: record.retryCount,
    firstAttempt: record.firstAttempt,
    feedback: legacyState.lastMoveSan ?? null,
  };
}

export function publicFeedback(
  record: StandaloneMiniGameServerRecord,
  revealed: boolean,
): string | null {
  if (record.kind === "deep" && record.scenario)
    return revealed
      ? `Verified route: ${record.scenario.solution.userMoves.join(" ")}`
      : (record.state as DeepMiniGameState).feedback;
  if (!revealed)
    return (record.state as import("../dailyMiniGameTypes").DailyMiniGameState)
      .completed
      ? "Completed."
      : (record.state as import("../dailyMiniGameTypes").DailyMiniGameState)
            .plyCount
        ? "The server is checking that line."
        : null;
  const card = record.card as DailyBlundrMiniGameCard;
  return (
    card.miniGame.scenario?.explanation ?? "The verified solution was revealed."
  );
}
