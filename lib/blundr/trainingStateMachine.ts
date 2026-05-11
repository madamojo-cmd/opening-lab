/**
 * BlundrOneNet v0 Training State Machine
 *
 * This module formalizes the training phase logic to prevent:
 * - Wrong-side recommendations
 * - Stale Brain/model output overwriting current FEN
 * - Invalid phase/actor combinations
 *
 * All phase transitions and actor validations are deterministic and type-safe.
 */

import type { Color, ExpectedActor, TrainingPhase } from "./types";

/**
 * Phase decision result: describes whether the model should be called and why.
 */
export type PhaseDecision = {
  trainingPhase: TrainingPhase;
  expectedActor: ExpectedActor;
  expectedMoveColor: Color | null;
  shouldRequestVisualModel: boolean;
  reason: string;
};

/**
 * Training state validation result: detailed report of all checks.
 *
 * CRITICAL DISTINCTIONS:
 * - shouldRequestVisualModel: BlundrOneNet may be called for visual/context output only.
 *   This NEVER authorizes legal move selection.
 * - shouldRequestMoveRecommendation: The phase authorizes a user-facing move recommendation.
 *   This must be false for explanation phases and opponent_to_move.
 * - shouldExplainOnly: The phase is explanation-only. The model may refine context,
 *   but must NOT recommend a new move.
 */
export type TrainingStateValidation = {
  valid: boolean;
  warnings: string[];
  errors: string[];
  expectedActor: ExpectedActor;
  expectedMoveColor: Color | null;
  /**
   * True if BlundrOneNet may be called for visual/context output.
   * False for opponent_to_move (stays book/explorer/Stockfish-backed in v0).
   * Note: This does NOT authorize legal move selection.
   */
  shouldRequestVisualModel: boolean;
  /**
   * True only if a user-facing move recommendation is authorized.
   * False for:
   * - opponent_to_move (no model move selection in v0)
   * - showing_user_move_feedback (explanation-only)
   * - showing_opponent_context (explanation-only)
   * This is the critical guard for preventing wrong-side or invalid recommendations.
   */
  shouldRequestMoveRecommendation: boolean;
  /**
   * True for explanation phases: showing_user_move_feedback, showing_opponent_context.
   * Signals that the model may refine context/explanation but must NOT authorize a new move.
   */
  shouldExplainOnly: boolean;
};

/**
 * Flip a chess color: w → b, b → w
 */
export function oppositeColor(color: Color): Color {
  return color === "w" ? "b" : "w";
}

/**
 * Given a training phase, return the expected actor.
 *
 * awaiting_user_move → user
 * showing_user_move_feedback → system
 * opponent_to_move → opponent
 * showing_opponent_context → system
 * awaiting_user_continuation_choice → user
 * guided_continuation → user
 */
export function expectedActorForPhase(phase: TrainingPhase): ExpectedActor {
  switch (phase) {
    case "awaiting_user_move":
    case "awaiting_user_continuation_choice":
    case "guided_continuation":
      return "user";
    case "opponent_to_move":
      return "opponent";
    case "showing_user_move_feedback":
    case "showing_opponent_context":
      return "system";
    default:
      const exhaustive: never = phase;
      throw new Error(`Unknown training phase: ${exhaustive}`);
  }
}

/**
 * Given an expected actor and the user's color, determine the expected move color.
 *
 * - user → userColor
 * - opponent → opposite of userColor
 * - system → null (no move authorization)
 *
 * Returns null instead of undefined so it serializes clearly in debug/JSON output.
 * null means no move color is authorized; system phases are explanation-only.
 */
export function expectedMoveColorForActor(
  expectedActor: ExpectedActor,
  userColor: Color
): Color | null {
  if (expectedActor === "user") return userColor;
  if (expectedActor === "opponent") return oppositeColor(userColor);
  // system phase: no move authorization
  return null;
}

/**
 * Type guard: check if a value is a valid TrainingPhase.
 */
export function isTrainingPhase(value: unknown): value is TrainingPhase {
  if (typeof value !== "string") return false;
  const validPhases: TrainingPhase[] = [
    "awaiting_user_move",
    "showing_user_move_feedback",
    "opponent_to_move",
    "showing_opponent_context",
    "awaiting_user_continuation_choice",
    "guided_continuation",
  ];
  return validPhases.includes(value as TrainingPhase);
}

/**
 * Type guard: check if a value is a valid ExpectedActor.
 */
export function isExpectedActor(value: unknown): value is ExpectedActor {
  return typeof value === "string" && ["user", "opponent", "system"].includes(value);
}

/**
 * Type guard: check if a value is a valid chess Color.
 */
export function isColor(value: unknown): value is Color {
  return typeof value === "string" && ["w", "b"].includes(value);
}

/**
 * Check whether a training phase should request the BlundrOneNet visual model.
 *
 * true: awaiting_user_move, showing_user_move_feedback, showing_opponent_context,
 *       awaiting_user_continuation_choice, guided_continuation
 * false: opponent_to_move (opponent moves remain book/explorer/Stockfish-backed in v0)
 *
 * Note: For explanation phases, model requests are allowed for refining explanations,
 * but shouldExplainOnly will be set to true and shouldRequestMoveRecommendation will be false.
 */
export function isPhaseModelEligible(trainingPhase: TrainingPhase): boolean {
  switch (trainingPhase) {
    case "awaiting_user_move":
    case "showing_user_move_feedback":
    case "showing_opponent_context":
    case "awaiting_user_continuation_choice":
    case "guided_continuation":
      return true;
    case "opponent_to_move":
      return false;
    default:
      const exhaustive: never = trainingPhase;
      throw new Error(`Unknown training phase: ${exhaustive}`);
  }
}

/**
 * Check whether a training phase should authorize a user-facing move recommendation.
 *
 * true: awaiting_user_move, awaiting_user_continuation_choice, guided_continuation
 * false: opponent_to_move, showing_user_move_feedback, showing_opponent_context
 *
 * This distinguishes between:
 * - Explanation phases (can refine context but not recommend new moves)
 * - Opponent phases (no model-based move selection)
 * - User phases (can recommend moves)
 */
export function isPhaseMoveRecommendationEligible(trainingPhase: TrainingPhase): boolean {
  switch (trainingPhase) {
    case "awaiting_user_move":
    case "awaiting_user_continuation_choice":
    case "guided_continuation":
      return true;
    case "opponent_to_move":
    case "showing_user_move_feedback":
    case "showing_opponent_context":
      return false;
    default:
      const exhaustive: never = trainingPhase;
      throw new Error(`Unknown training phase: ${exhaustive}`);
  }
}

/**
 * Check if a phase is a user-move phase.
 * true for: awaiting_user_move, awaiting_user_continuation_choice, guided_continuation
 */
export function isUserMovePhase(trainingPhase: TrainingPhase): boolean {
  return (
    trainingPhase === "awaiting_user_move" ||
    trainingPhase === "awaiting_user_continuation_choice" ||
    trainingPhase === "guided_continuation"
  );
}

/**
 * Check if a phase is an opponent-move phase.
 * true for: opponent_to_move
 */
export function isOpponentMovePhase(trainingPhase: TrainingPhase): boolean {
  return trainingPhase === "opponent_to_move";
}

/**
 * Check if a phase is an explanation phase.
 * true for: showing_user_move_feedback, showing_opponent_context
 */
export function isExplanationPhase(trainingPhase: TrainingPhase): boolean {
  return (
    trainingPhase === "showing_user_move_feedback" ||
    trainingPhase === "showing_opponent_context"
  );
}

/**
 * Validate the entire training state.
 *
 * Checks:
 * - trainingPhase is valid
 * - expectedActor matches phase
 * - sideToMove and userColor are valid colors
 * - wrong-side recommendations are prevented
 * - phase/color mismatches are caught
 * - explanation phases are marked as explanation-only
 * - opponent_to_move does not request model recommendations
 *
 * Returns two critical fields:
 * - shouldRequestVisualModel: BlundrOneNet may be called for visual/context.
 * - shouldRequestMoveRecommendation: Phase authorizes a user-facing move.
 * - shouldExplainOnly: Phase is explanation-only (no move recommendation).
 */
export function validateTrainingState(input: {
  trainingPhase: TrainingPhase;
  sideToMove: Color;
  userColor: Color;
}): TrainingStateValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate phase
  if (!isTrainingPhase(input.trainingPhase)) {
    errors.push(
      `Invalid training phase: ${input.trainingPhase}. Must be one of: awaiting_user_move, showing_user_move_feedback, opponent_to_move, showing_opponent_context, awaiting_user_continuation_choice, guided_continuation.`
    );
  }

  // Validate colors
  if (!isColor(input.sideToMove)) {
    errors.push(`Invalid sideToMove: ${input.sideToMove}. Must be "w" or "b".`);
  }
  if (!isColor(input.userColor)) {
    errors.push(`Invalid userColor: ${input.userColor}. Must be "w" or "b".`);
  }

  // If colors are invalid, stop here
  if (errors.length > 0) {
    return {
      valid: false,
      warnings,
      errors,
      expectedActor: "system",
      expectedMoveColor: null,
      shouldRequestVisualModel: false,
      shouldRequestMoveRecommendation: false,
      shouldExplainOnly: false,
    };
  }

  const expectedActor = expectedActorForPhase(input.trainingPhase);
  const expectedMoveColor = expectedMoveColorForActor(expectedActor, input.userColor);

  // Validate phase/color alignment
  if (expectedActor !== "system" && expectedMoveColor !== null && expectedMoveColor !== input.sideToMove) {
    errors.push(
      `Phase/color mismatch: phase "${input.trainingPhase}" expects ${expectedActor}-side (${expectedMoveColor}), but sideToMove is ${input.sideToMove}.`
    );
  }

  // Prevent wrong-side recommendations
  if (input.trainingPhase === "awaiting_user_move" && input.sideToMove !== input.userColor) {
    errors.push(
      `awaiting_user_move cannot happen on opponent's turn. userColor=${input.userColor}, sideToMove=${input.sideToMove}.`
    );
  }

  if (input.trainingPhase === "opponent_to_move" && input.sideToMove === input.userColor) {
    errors.push(
      `opponent_to_move cannot happen on user's turn. userColor=${input.userColor}, sideToMove=${input.sideToMove}.`
    );
  }

  // Warn about explanation phases selecting new moves
  if (
    isExplanationPhase(input.trainingPhase) &&
    input.sideToMove === input.userColor
  ) {
    warnings.push(
      `${input.trainingPhase} is an explanation phase. It should not select a new user recommendation; it should explain the current position or recent move.`
    );
  }

  const valid = errors.length === 0;
  // shouldRequestVisualModel: can BlundrOneNet be called for visual/context output?
  const shouldRequestVisualModel = valid && isPhaseModelEligible(input.trainingPhase);
  // shouldRequestMoveRecommendation: is a user-facing move recommendation authorized?
  const shouldRequestMoveRecommendation = valid && isPhaseMoveRecommendationEligible(input.trainingPhase);
  // shouldExplainOnly: is this explanation-only (no move recommendation)?
  const shouldExplainOnly = valid && isExplanationPhase(input.trainingPhase);

  return {
    valid,
    warnings,
    errors,
    expectedActor,
    expectedMoveColor: valid ? expectedMoveColor : null,
    shouldRequestVisualModel,
    shouldRequestMoveRecommendation,
    shouldExplainOnly,
  };
}

/**
 * Advanced phase decision: incorporates additional context like book completion
 * and checks whether the model should be called.
 *
 * This is used by app/page.tsx to decide if a Visual model request should proceed.
 *
 * Key decisions:
 * - opponent_to_move: false in v0 (opponent moves remain book/explorer/Stockfish-backed)
 * - explanation phases: false (no new move recommendation)
 * - user move phases: true if phase/color alignment is correct
 */
export function decideVisualPhase(input: {
  fenSideToMove: Color;
  userColor: Color;
  trainingPhase: TrainingPhase;
  bookComplete?: boolean;
  hasExpectedUserMove?: boolean;
}): PhaseDecision {
  const expectedActor = expectedActorForPhase(input.trainingPhase);
  const expectedMoveColor = expectedMoveColorForActor(expectedActor, input.userColor);

  // Phase/color alignment check (except for system phases)
  if (expectedActor !== "system" && expectedMoveColor !== null && expectedMoveColor !== input.fenSideToMove) {
    return {
      trainingPhase: input.trainingPhase,
      expectedActor,
      expectedMoveColor,
      shouldRequestVisualModel: false,
      reason: `Phase/color mismatch: phase expects ${expectedMoveColor}, FEN has ${input.fenSideToMove}`,
    };
  }

  // opponent_to_move: no model-based move selection in v0
  if (input.trainingPhase === "opponent_to_move") {
    return {
      trainingPhase: input.trainingPhase,
      expectedActor,
      expectedMoveColor,
      shouldRequestVisualModel: false,
      reason: `opponent_to_move: opponent moves remain book/explorer/Stockfish-backed in v0.`,
    };
  }

  // Book completion transition
  if (
    input.trainingPhase === "awaiting_user_move" &&
    input.bookComplete &&
    !input.hasExpectedUserMove
  ) {
    return {
      trainingPhase: "awaiting_user_continuation_choice",
      expectedActor: "user",
      expectedMoveColor: input.userColor,
      shouldRequestVisualModel: true,
      reason: "Book complete; ask user whether to continue.",
    };
  }

  // Explanation phases: do not request new move recommendations
  if (isExplanationPhase(input.trainingPhase)) {
    return {
      trainingPhase: input.trainingPhase,
      expectedActor,
      expectedMoveColor,
      shouldRequestVisualModel: false,
      reason: `${input.trainingPhase} is explanation-only; do not request move recommendation.`,
    };
  }

  // User move phases: model is eligible
  return {
    trainingPhase: input.trainingPhase,
    expectedActor,
    expectedMoveColor,
    shouldRequestVisualModel: true,
    reason: "Phase is aligned with FEN. User move eligible.",
  };
}
