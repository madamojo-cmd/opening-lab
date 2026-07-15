import { createActivityAttemptState } from "@/lib/blundr/daily/core/dailyActivityConformance";
import { advanceDeepMiniGame } from "./deepObjectiveEngine";
import type {
  DeepMiniGameScenario,
  DeepMiniGameState,
  DeepMiniGameResult,
} from "./deepMiniGameTypes";

export function createDeepMiniGameState(
  scenario: DeepMiniGameScenario,
): DeepMiniGameState {
  return {
    ...createActivityAttemptState(),
    state: "ready",
    currentFen: scenario.startFen,
    userMoveIndex: 0,
    opponentReplyIndex: 0,
    moves: [],
    targetsReached: [],
    terminalResult: null,
  };
}
export function reduceDeepMiniGame(
  state: DeepMiniGameState,
  scenario: DeepMiniGameScenario,
  event:
    | { type: "move"; uci: string; now: string }
    | { type: "reveal"; now: string }
    | { type: "retry"; now: string }
    | { type: "reset" },
): DeepMiniGameResult {
  if (event.type === "reset")
    return {
      kind: "legal_progress",
      state: createDeepMiniGameState(scenario),
      message: "Reset.",
    };
  if (event.type === "retry")
    return {
      kind: "legal_progress",
      state: {
        ...state,
        state: "in_progress",
        retryCount: state.retryCount + 1,
      },
      message: "Retry is unscored.",
    };
  if (event.type === "reveal")
    return {
      kind: "objective_failed",
      state:
        state.firstAttempt === null
          ? {
              ...state,
              state: "revealed",
              firstAttempt: "reveal",
              firstAttemptRecordedAt: event.now,
              feedback: "Solution revealed.",
            }
          : state,
      message: "Solution revealed.",
    };
  return advanceDeepMiniGame(state, scenario, event.uci, event.now);
}
