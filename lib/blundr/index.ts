/**
 * BlundrOneNet v0 Central Exports
 *
 * This module re-exports all types, enums, and helpers from the blundr package.
 * Consumers should import from this file for a clean, centralized API.
 */

// Core types
export type {
  Color,
  ExpectedActor,
  TrainingPhase,
  SelectedView,
  BlundrArrowRole,
  BlundrSquareRole,
  BlundrArrow,
  BlundrSquare,
  BlundrContext,
  BlundrVisualModelRequest,
  BlundrVisualModelOutput,
} from "./types";

// Animation packages
export { BLUNDR_ANIMATION_PACKAGES, isSupportedAnimationPackage } from "./animationPackages";
export type { BlundrAnimationPackage } from "./animationPackages";

// Concepts
export { BLUNDR_CONCEPTS, isSupportedConcept } from "./concepts";
export type { BlundrConcept } from "./concepts";

// Context templates
export { CONTEXT_TEMPLATES, renderContextTemplate } from "./contextTemplates";

// Square utilities
export {
  BOARD_SQUARE_RE,
  isBoardSquare,
  squareToId,
  idToSquare,
  arrowToId,
  idToArrow,
} from "./squareUtils";

// Training state machine
export {
  oppositeColor,
  expectedActorForPhase,
  expectedMoveColorForActor,
  isTrainingPhase,
  isExpectedActor,
  isColor,
  isPhaseModelEligible,
  isPhaseMoveRecommendationEligible,
  isUserMovePhase,
  isOpponentMovePhase,
  isExplanationPhase,
  validateTrainingState,
  decideVisualPhase,
} from "./trainingStateMachine";
export type { PhaseDecision, TrainingStateValidation } from "./trainingStateMachine";
