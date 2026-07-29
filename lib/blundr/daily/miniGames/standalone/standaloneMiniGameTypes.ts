import type {
  DailyMiniGameId,
  DailyMiniGameState,
} from "../dailyMiniGameTypes";
import type { DeepMiniGameScenario, DeepMiniGameState } from "../deep";

export type StandaloneMiniGamePublicState = {
  instanceId: string;
  revision: number;
  miniGameId: DailyMiniGameId;
  source: "standalone_review";
  board: {
    fen: string;
    orientation: "white" | "black";
    sideToMove: "w" | "b";
  };
  prompt: string;
  instruction: string;
  goal: string;
  family: string;
  estimatedTimeSeconds: number;
  status:
    | "ready"
    | "in_progress"
    | "submitted"
    | "feedback"
    | "revealed"
    | "completed"
    | "expired";
  attemptCount: number;
  retryCount: number;
  firstAttempt: "correct" | "incorrect" | "reveal" | null;
  feedback: string | null;
};

export type StandaloneMiniGameServerRecord = {
  instanceId: string;
  revision: number;
  userId: string;
  kind?: "legacy" | "deep";
  card: unknown;
  state: DailyMiniGameState | DeepMiniGameState;
  scenario?: DeepMiniGameScenario;
  firstAttempt: "correct" | "incorrect" | "reveal" | null;
  retryCount: number;
  expiresAt: string;
};
