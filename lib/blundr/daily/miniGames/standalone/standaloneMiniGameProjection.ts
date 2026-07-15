import type { DailyBlundrMiniGameCard } from "../dailyMiniGameTypes";
import type {
  StandaloneMiniGamePublicState,
  StandaloneMiniGameServerRecord,
} from "./standaloneMiniGameTypes";

export function projectStandaloneMiniGame(
  record: StandaloneMiniGameServerRecord,
): StandaloneMiniGamePublicState {
  const card = record.card as DailyBlundrMiniGameCard;
  const game = card.miniGame;
  const status =
    record.expiresAt <= new Date().toISOString()
      ? "expired"
      : record.firstAttempt === "reveal"
        ? "revealed"
        : record.state.completed
          ? "completed"
          : record.state.plyCount > 0
            ? "in_progress"
            : "ready";
  return {
    instanceId: record.instanceId,
    miniGameId: game.miniGameId,
    source: "standalone_review",
    board: {
      fen: record.state.currentFen || game.startFen,
      orientation: game.learnerSide,
      sideToMove: game.sideToMove,
    },
    prompt: card.title,
    instruction: card.summary,
    goal: "Play the best move for this position.",
    family: card.title,
    estimatedTimeSeconds: 40,
    status,
    attemptCount: record.state.plyCount,
    retryCount: record.retryCount,
    firstAttempt: record.firstAttempt,
    feedback: record.state.lastMoveSan ?? null,
  };
}

export function publicFeedback(
  record: StandaloneMiniGameServerRecord,
  revealed: boolean,
): string | null {
  if (!revealed)
    return record.state.completed
      ? "Completed."
      : record.state.plyCount
        ? "The server is checking that line."
        : null;
  const card = record.card as DailyBlundrMiniGameCard;
  return (
    card.miniGame.scenario?.explanation ?? "The verified solution was revealed."
  );
}
