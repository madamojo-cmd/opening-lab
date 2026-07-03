import type { DailyMiniGameScoreInput, DailyMiniGameScoreResult } from "./dailyMiniGameTypes";

function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function resolveMiniGameReason(input: DailyMiniGameScoreInput): string {
  if (!input.completed) return input.reason || "mini_game_incomplete";
  if (input.reason) return input.reason;
  if (input.blocked) return "blocked_route";
  if (input.won) return input.perfectPath ? "best_known_route" : "solved_route";
  return "route_lost";
}

export function scoreDailyMiniGameAttempt(input: DailyMiniGameScoreInput): DailyMiniGameScoreResult {
  const moveCount = Math.max(0, Number(input.moveCount) || 0);
  const moveLimit = Math.max(1, Number(input.moveLimit) || 1);
  const bestKnownMoves = typeof input.bestKnownMoves === "number" && Number.isFinite(input.bestKnownMoves) ? Math.max(0, input.bestKnownMoves) : null;
  const illegalMoveCount = Math.max(0, Number(input.illegalMoveCount ?? 0) || 0);
  const objectiveCount = Math.max(1, Number(input.objectiveCount ?? 1) || 1);
  const objectivesCompleted = Math.max(0, Math.min(objectiveCount, Number(input.objectivesCompleted ?? (input.won ? objectiveCount : 0)) || 0));

  if (illegalMoveCount > 0 || normalizeText(input.reason).includes("illegal")) {
    return {
      score: 5,
      correct: false,
      partialCredit: 0.05,
      usedReveal: false,
      outcome: "incorrect",
      reason: input.reason || "illegal_move_attempt",
      summary: "illegal_move_attempt",
    };
  }

  if (input.won) {
    if (bestKnownMoves !== null && moveCount <= bestKnownMoves) {
      return {
        score: 100,
        correct: true,
        partialCredit: 1,
        usedReveal: false,
        outcome: "correct",
        reason: resolveMiniGameReason({ ...input, reason: input.reason ?? "best_known_route" }),
        summary: "best_known_route",
      };
    }

    const excessMoves = Math.max(0, moveCount - (bestKnownMoves ?? moveLimit));
    const efficiency = bestKnownMoves !== null ? clamp01(bestKnownMoves / Math.max(1, moveCount)) : clamp01(1 - excessMoves / Math.max(1, moveLimit));
    const score = clampScore(78 + efficiency * 22);
    return {
      score,
      correct: true,
      partialCredit: score / 100,
      usedReveal: false,
      outcome: "correct",
      reason: resolveMiniGameReason({ ...input, reason: input.reason ?? "solved_route" }),
      summary: score >= 95 ? "best_known_route" : "solved_route",
    };
  }

  if (!input.completed) {
    return {
      score: 0,
      correct: false,
      partialCredit: 0,
      usedReveal: false,
      outcome: "skip",
      reason: resolveMiniGameReason({ ...input, reason: input.reason ?? "mini_game_incomplete" }),
      summary: "mini_game_incomplete",
    };
  }

  const overLimit = Math.max(0, moveCount - moveLimit);
  const baseLoss = input.blocked ? 16 : 20;
  const objectivePenalty = objectivesCompleted > 0 && objectiveCount > 0 ? (objectivesCompleted / objectiveCount) * 4 : 0;
  const score = clampScore(baseLoss - overLimit * 4 + objectivePenalty);

  return {
    score,
    correct: false,
    partialCredit: score / 100,
    usedReveal: false,
    outcome: "incorrect",
    reason: resolveMiniGameReason({ ...input, reason: input.reason ?? (input.blocked ? "blocked_route" : "route_lost") }),
    summary: input.blocked ? "blocked_route" : "route_lost",
  };
}
