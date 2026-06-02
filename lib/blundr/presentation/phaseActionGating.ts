import type { CoachButton } from "../coach/coachTypes";
import { getVisibleCoachActions, type VisibleCoachAction } from "./visibleActionPolicy";

// v2.7.40: phase gating now defers to visibleActionPolicy for teaching frames.
// Legacy actions quarantined; EXPECTED set reduced to visible canonicals only (no forbidden labels).
const VISIBLE_TEACHING_ACTIONS = new Set<VisibleCoachAction>(["hint", "show_more"]);
const EXPECTED_MOVE_ACTIONS = new Set<CoachButton>([
  "hint",
  "show_more",
  "continue_from_here",
  "restart_line",
  // legacy (answer/show_*/etc) deleted from gate
]);

export interface TrainerPhaseActionGateInput {
  trainerPhase: string;
  isUserTurn: boolean;
  trainingMode: "restricted" | "continuation";
  expectedMoveSan?: string | null;
  expectedMoveUci?: string | null;
  trustedContinuationCandidateAvailable: boolean;
  coachShouldShow: boolean;
  coachButtons: CoachButton[];
}

export interface TrainerPhaseActionGateResult {
  shouldRenderCoach: boolean;
  filteredButtons: CoachButton[];
  revealButtonVisible: boolean;
  revealableExpectedMove: boolean;
  revealableContinuationCandidate: boolean;
  blockedReason?: string;
}

export function hasExpectedMove(input: Pick<TrainerPhaseActionGateInput, "expectedMoveSan" | "expectedMoveUci">): boolean {
  return Boolean(input.expectedMoveSan || input.expectedMoveUci);
}

export function decideTrainerPhaseActionGate(input: TrainerPhaseActionGateInput): TrainerPhaseActionGateResult {
  const expectedMovePresent = hasExpectedMove(input);
  const activeUserMoveFrame = input.trainerPhase === "ready_for_user" && input.isUserTurn;
  const waitingForOpponent = input.trainerPhase === "opponent_selecting" || !input.isUserTurn;
  const revealableExpectedMove = activeUserMoveFrame && input.trainingMode === "restricted" && expectedMovePresent;
  const revealableContinuationCandidate =
    activeUserMoveFrame && input.trainingMode === "continuation" && input.trustedContinuationCandidateAvailable;
  const revealButtonVisible = revealableExpectedMove || revealableContinuationCandidate;

  if (waitingForOpponent) {
    return {
      shouldRenderCoach: false,
      filteredButtons: [],
      revealButtonVisible: false,
      revealableExpectedMove: false,
      revealableContinuationCandidate: false,
      blockedReason: input.trainerPhase === "opponent_selecting" ? "opponent_selecting" : "not_user_turn",
    };
  }

  if (input.trainingMode === "restricted" && !expectedMovePresent) {
    return {
      shouldRenderCoach: false,
      filteredButtons: [],
      revealButtonVisible: false,
      revealableExpectedMove: false,
      revealableContinuationCandidate: false,
      blockedReason: "missing_expected_move",
    };
  }

  const filteredButtons = input.coachButtons.filter((button) => {
    // v2.7.40 strict: only allow visible policy actions in filtered output for teaching frames.
    // All legacy buttons (show_move/answer/show_plan/analyze_idea) dropped here.
    if (button === "show_more" || button === "hint") {
      // Plain teaching only; assisted already [] from policy
      return activeUserMoveFrame && (input.trainingMode === "restricted" || input.trainingMode === "continuation");
    }
    if (button === "continue_from_here") return true; // branch allowed
    if (button === "restart_line") return true; // branch allowed
    if (!activeUserMoveFrame && EXPECTED_MOVE_ACTIONS.has(button)) return false;
    // Drop any non-visible legacy at gate
    const vis = getVisibleCoachActions({
      trainerView: "plain", // conservative; caller context better but gate is legacy shim
      trainerPhase: input.trainerPhase,
      isUserTurn: input.isUserTurn,
      trainingMode: input.trainingMode,
      isBranchTransition: false,
      isTerminal: false,
      answerShown: false,
      hasActiveTarget: true,
    });
    return vis.actions.includes(button as VisibleCoachAction);
  });

  return {
    shouldRenderCoach: input.coachShouldShow,
    filteredButtons,
    revealButtonVisible,
    revealableExpectedMove,
    revealableContinuationCandidate,
  };
}

export interface LastMoveAttributionInput {
  lastMoveSan?: string | null;
  lastMoveUci?: string | null;
  lastMoveColor?: "w" | "b" | null;
  userColor: "w" | "b";
}

export interface LastMoveAttribution {
  lastUserMoveSan: string | null;
  lastUserMoveUci: string | null;
  lastOpponentMoveSan: string | null;
  lastOpponentMoveUci: string | null;
}

export function attributeLastMove(input: LastMoveAttributionInput): LastMoveAttribution {
  if (!input.lastMoveSan && !input.lastMoveUci) {
    return {
      lastUserMoveSan: null,
      lastUserMoveUci: null,
      lastOpponentMoveSan: null,
      lastOpponentMoveUci: null,
    };
  }

  const isUserMove = input.lastMoveColor === input.userColor;
  const isOpponentMove = input.lastMoveColor ? input.lastMoveColor !== input.userColor : false;
  return {
    lastUserMoveSan: isUserMove ? input.lastMoveSan ?? null : null,
    lastUserMoveUci: isUserMove ? input.lastMoveUci ?? null : null,
    lastOpponentMoveSan: isOpponentMove ? input.lastMoveSan ?? null : null,
    lastOpponentMoveUci: isOpponentMove ? input.lastMoveUci ?? null : null,
  };
}
