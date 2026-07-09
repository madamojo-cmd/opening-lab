import type { Square } from "@/lib/blundr/geometry/boardTypes";

export type MiniGameRunnerScenario = {
  scenarioKey: string;
  miniGameId: string;
  source: "daily_deck" | "standalone_review";
  family: string;
  motif?: string;
  estimatedTimeSeconds?: number;
  board: {
    fen: string;
    orientation: "white" | "black";
    sideToMove: "w" | "b";
    lockedOrientation: true;
  };
  prompt: string;
  instruction: string;
  goal: string;
  explanation: string;
  solution: {
    primaryMoveUci: string;
    acceptedMoves: string[];
    from: Square;
    to: Square;
    promotion?: "q" | "r" | "b" | "n";
    verification?: {
      verified: true;
      verifier: string;
      objectiveScore?: number;
      notes?: string[];
    };
  };
  overlays: {
    selectedSquares?: Square[];
    targetSquares?: Square[];
    keySquares?: Square[];
    dangerSquares?: Square[];
    arrows?: Array<{ from: Square; to: Square; type: string }>;
    route?: Square[];
    lastMove?: { from: Square; to: Square };
  };
  conceptTags: string[];
};

export type MiniGameRunnerStatus = "idle" | "piece_selected" | "submitted" | "correct" | "incorrect" | "revealed";

export type MiniGameRunnerAttempt = {
  from: string;
  to: string;
  uci: string;
  san: string | null;
};

export type MiniGameRunnerFeedbackTone = "neutral" | "success" | "warning" | "complete";

export type MiniGameRunnerFeedback = {
  message: string;
  tone: MiniGameRunnerFeedbackTone;
};

export type MiniGameRunnerState = {
  scenario: MiniGameRunnerScenario | null;
  status: MiniGameRunnerStatus;
  boardFen: string;
  selectedSquare: string | null;
  attemptedMove: MiniGameRunnerAttempt | null;
  feedback: MiniGameRunnerFeedback | null;
  revealed: boolean;
  disabledDuringValidation: boolean;
  attemptCount: number;
  lastValidationReason: string | null;
};

export type MiniGameRunnerEvent =
  | { type: "LOAD_SCENARIO"; scenario: MiniGameRunnerScenario }
  | { type: "USER_SELECT_SQUARE"; square: string }
  | { type: "USER_CLEAR_SELECTION" }
  | { type: "USER_SUBMIT_MOVE"; from: string; to: string; uci: string; san: string | null }
  | { type: "VALIDATION_RESULT"; status: "correct" | "incorrect"; boardFen?: string | null; feedback?: MiniGameRunnerFeedback | null; reason?: string | null }
  | { type: "USER_REVEAL" }
  | { type: "USER_NEXT_SCENARIO" }
  | { type: "USER_TRY_AGAIN" }
  | { type: "BOARD_ANIMATION_COMPLETE" };

function normalizeSquare(value: string): string {
  return String(value ?? "").trim().toLowerCase();
}

export function createInitialMiniGameRunnerState(scenario: MiniGameRunnerScenario | null): MiniGameRunnerState {
  return {
    scenario,
    status: "idle",
    boardFen: scenario?.board.fen ?? "",
    selectedSquare: null,
    attemptedMove: null,
    feedback: null,
    revealed: false,
    disabledDuringValidation: false,
    attemptCount: 0,
    lastValidationReason: null,
  };
}

export function canSubmitMove(state: MiniGameRunnerState): boolean {
  return state.status === "piece_selected" && !state.disabledDuringValidation && Boolean(state.selectedSquare);
}

export function shouldShowReveal(state: MiniGameRunnerState): boolean {
  return state.status === "idle" || state.status === "correct" || state.status === "incorrect";
}

export function shouldAllowRetry(state: MiniGameRunnerState): boolean {
  return state.status === "incorrect";
}

function resetToInitialState(state: MiniGameRunnerState, nextScenario: MiniGameRunnerScenario | null): MiniGameRunnerState {
  return {
    ...createInitialMiniGameRunnerState(nextScenario ?? state.scenario),
    attemptCount: 0,
  };
}

export function miniGameRunnerReducer(state: MiniGameRunnerState, event: MiniGameRunnerEvent): MiniGameRunnerState {
  switch (event.type) {
    case "LOAD_SCENARIO":
      return createInitialMiniGameRunnerState(event.scenario);

    case "USER_SELECT_SQUARE": {
      if (!state.scenario || state.disabledDuringValidation || state.status === "submitted" || state.status === "correct" || state.status === "revealed") {
        return state;
      }
      const square = normalizeSquare(event.square);
      if (!square) return state;
      return {
        ...state,
        status: "piece_selected",
        selectedSquare: square,
        attemptedMove: null,
        feedback: null,
        revealed: false,
        disabledDuringValidation: false,
        lastValidationReason: null,
      };
    }

    case "USER_CLEAR_SELECTION":
      if (state.status !== "piece_selected") return state;
      return {
        ...state,
        status: "idle",
        selectedSquare: null,
        attemptedMove: null,
        feedback: null,
        revealed: false,
        disabledDuringValidation: false,
      };

    case "USER_SUBMIT_MOVE": {
      if (!canSubmitMove(state)) return state;
      const from = normalizeSquare(event.from);
      const to = normalizeSquare(event.to);
      if (!from || !to || from !== state.selectedSquare) {
        return state;
      }
      const uci = normalizeSquare(event.uci);
      return {
        ...state,
        status: "submitted",
        selectedSquare: null,
        attemptedMove: {
          from,
          to,
          uci: uci || `${from}${to}`,
          san: event.san ?? null,
        },
        feedback: null,
        revealed: false,
        disabledDuringValidation: true,
        attemptCount: state.attemptCount + 1,
        lastValidationReason: null,
      };
    }

    case "VALIDATION_RESULT":
      if (state.status !== "submitted" || !state.disabledDuringValidation) return state;
      return {
        ...state,
        status: event.status,
        boardFen: String(event.boardFen ?? "").trim() || state.boardFen,
        feedback: event.feedback ?? null,
        revealed: false,
        disabledDuringValidation: false,
        selectedSquare: null,
        lastValidationReason: event.reason ?? null,
      };

    case "USER_REVEAL":
      if (!shouldShowReveal(state)) return state;
      return {
        ...state,
        status: "revealed",
        revealed: true,
        disabledDuringValidation: false,
        selectedSquare: null,
      };

    case "USER_NEXT_SCENARIO":
      return resetToInitialState(state, state.scenario);

    case "USER_TRY_AGAIN":
      if (!shouldAllowRetry(state)) return state;
      return {
        ...createInitialMiniGameRunnerState(state.scenario),
        attemptCount: state.attemptCount,
      };

    case "BOARD_ANIMATION_COMPLETE":
      return state;

    default:
      return state;
  }
}
