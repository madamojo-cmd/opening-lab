/**
 * BlundrOneNet v0 Core Contract Types
 *
 * This module defines the formal shared contract that bridges:
 * - Current trainer UI (app/page.tsx)
 * - Feature packet builder
 * - Verifier
 * - Rule-based visual selector fallback
 * - Future model service
 * - Frontend board overlays and coaching panel
 *
 * All types are bounded and safe. Models select from known IDs.
 * No free-form prose, tactics, or unsupported animation/concept names allowed.
 */

export type Color = "w" | "b";

export type ExpectedActor = "user" | "opponent" | "system";

export type TrainingPhase =
  | "awaiting_user_move"
  | "showing_user_move_feedback"
  | "opponent_to_move"
  | "showing_opponent_context"
  | "awaiting_user_continuation_choice"
  | "guided_continuation";

export type SelectedView =
  | "move"
  | "attack"
  | "defense"
  | "plan"
  | "continuation"
  | "mistake";

export type BlundrArrowRole =
  | "move"
  | "pressure"
  | "defense"
  | "future"
  | "threat"
  | "capture"
  | "retreat";

export type BlundrSquareRole =
  | "source"
  | "destination"
  | "weakness"
  | "center"
  | "defense"
  | "danger"
  | "future"
  | "soft_target";

export type BlundrArrow = {
  from: string;
  to: string;
  role: BlundrArrowRole;
  intensity: number;
};

export type BlundrSquare = {
  square: string;
  role: BlundrSquareRole;
  animation: string;
};

export type BlundrContext = {
  headline: string;
  mainExplanation: string;
  visualExplanation: string;
  planExplanation: string;
  nextPlan: string;
  threatNote?: string;
};

export type BlundrVisualModelRequest = {
  fen: string;
  moveHistory: string[];
  userColor: Color;
  userRatingBucket: string;
  trainingPhase: TrainingPhase;
  lastMove?: string;
  lastMoveBy?: ExpectedActor;
  expectedActor?: ExpectedActor;
  openingName?: string;
};

export type BlundrVisualModelOutput = {
  selectedMove: string;
  selectedView: SelectedView;
  primaryConcept: string;
  animationPackage: string;
  keySquares: string[];
  arrows: BlundrArrow[];
  squares: BlundrSquare[];
  context: BlundrContext;
  suppress: string[];
  confidence: number;
  debug?: {
    source:
      | "rule"
      | "gpt_synthetic"
      | "blundr_one_net_v0"
      | "fallback"
      | "model_unavailable";
    verified: boolean;
    fallbackUsed: boolean;
    warnings?: string[];
    stockfishEvalCp?: number;
    stockfishBestMove?: string;
    openingName?: string;
    trainingPhase?: TrainingPhase;
    expectedActor?: ExpectedActor;
    sideToMove?: Color;
    userColor?: Color;
    normalizedFen?: string;
    requestId?: string;
  };
};

/**
 * BlundrFeaturePacket: Placeholder for phase 1
 * The feature packet builder will define the full shape in handoff 02.
 * For now, this is a marker type for future expansion.
 */
export type BlundrFeaturePacket = {
  // To be expanded in handoff 02
  requestId?: string;
  source?: string;
};
