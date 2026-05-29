import type { TrainingContextResult } from "../teaching/trainingContextTypes";
import type { TeachingConceptId } from "../teaching/teachingCueTypes";
import type { VisualOpacityPolicy } from "./visualOpacityPolicy";
import type { VisualTimingProfile } from "./visualTimingProfiles";

export const VISUAL_RECIPE_SCHEMA_VERSION = 1 as const;
export type VisualRecipeSchemaVersion = typeof VISUAL_RECIPE_SCHEMA_VERSION;

export type VisualRecipeMode =
  | "move_teaching"
  | "assisted_context"
  | "missed_pattern_replay"
  | "reveal_answer"
  | "noop";

export type VisualLane =
  | "persistent_teaching"
  | "transient_tactical_effect"
  | "persistent_tactical_status";

export type VisualEffectFamily =
  | "teaching_move"
  | "pressure"
  | "target"
  | "center"
  | "king_safety"
  | "ray_tracker"
  | "multi_hub_snap"
  | "danger_glow"
  | "escape_grid";

export type VisualPrimitiveType =
  | "move_arrow"
  | "pressure_line"
  | "target_ring"
  | "square_highlight"
  | "ghost_piece"
  | "king_safety_aura"
  | "ray_tracker"
  | "multi_hub_snap"
  | "danger_glow"
  | "escape_grid";

export type VisualPrimitivePriority = 1 | 2 | 3 | 4 | 5;

export type VisualPrimitiveBase = {
  id: string;
  type: VisualPrimitiveType;
  lane: VisualLane;
  effectFamily: VisualEffectFamily;
  priority: VisualPrimitivePriority;
  purpose?: string;
  emphasis?: "primary" | "supporting" | "status";
  opacityPolicy?: VisualOpacityPolicy;
};

export type MoveArrowPrimitive = VisualPrimitiveBase & {
  type: "move_arrow";
  from: string;
  to: string;
};

export type PressureLinePrimitive = VisualPrimitiveBase & {
  type: "pressure_line";
  from: string;
  to: string;
};

export type TargetRingPrimitive = VisualPrimitiveBase & {
  type: "target_ring";
  square: string;
};

export type SquareHighlightPrimitive = VisualPrimitiveBase & {
  type: "square_highlight";
  square: string;
  role?: "center" | "future_break" | "safe" | "support" | "context" | "danger";
};

export type GhostPiecePrimitive = VisualPrimitiveBase & {
  type: "ghost_piece";
  square: string;
  piece?: string;
};

export type KingSafetyAuraPrimitive = VisualPrimitiveBase & {
  type: "king_safety_aura";
  square: string;
};

export type RayTrackerPrimitive = VisualPrimitiveBase & {
  type: "ray_tracker";
  lane: "transient_tactical_effect";
  effectFamily: "ray_tracker";
  attackerSquare: string;
  primaryTargetSquare: string;
  behindTargetSquare?: string;
  lineStyle: "solid_then_dashed";
  dashPattern?: [number, number];
  priority: 3;
};

export type MultiHubSnapPrimitive = VisualPrimitiveBase & {
  type: "multi_hub_snap";
  lane: "transient_tactical_effect";
  effectFamily: "multi_hub_snap";
  hubSquare: string;
  targetSquares: string[];
  targetRingStyle?: "ring" | "pulse";
  priority: 2;
};

export type DangerGlowPrimitive = VisualPrimitiveBase & {
  type: "danger_glow";
  lane: "persistent_tactical_status";
  effectFamily: "danger_glow";
  square: string;
  piece?: string;
  pulse: "low_frequency";
  priority: 4;
};

export type EscapeGridPrimitive = VisualPrimitiveBase & {
  type: "escape_grid";
  lane: "transient_tactical_effect";
  effectFamily: "escape_grid";
  kingSquare: string;
  deniedSquares: string[];
  checkSourceSquare?: string;
  priority: 1;
};

export type VisualPrimitive =
  | MoveArrowPrimitive
  | PressureLinePrimitive
  | TargetRingPrimitive
  | SquareHighlightPrimitive
  | GhostPiecePrimitive
  | KingSafetyAuraPrimitive
  | RayTrackerPrimitive
  | MultiHubSnapPrimitive
  | DangerGlowPrimitive
  | EscapeGridPrimitive;

export type VisualBeat = {
  id: string;
  order: number;
  durationMs: number;
  delayMs?: number;
  primitives: VisualPrimitive[];
  narrationKey?: string;
  timingProfile?: VisualTimingProfile;
};

export type VisualRecipeEndState = {
  persistPrimitives: string[];
  clearOn: Array<
    | "phase_change"
    | "fen_change"
    | "view_mode_change"
    | "user_move_submitted"
    | "opponent_selecting"
    | "opponent_animating"
    | "manual_clear"
  >;
};

export type VisualRecipePermissions = {
  canShowAnswerMove: boolean;
  canShowContext: boolean;
  canShowPressure: boolean;
  canShowTargets: boolean;
  canShowGhosts: boolean;
  canShowTacticalAssist: boolean;
  canPersistEndState: boolean;
  revealRequired: boolean;
  allowedViewModes: Array<"assisted" | "plain">;
};

export type VisualLearningAnchor = {
  patternId: string;
  conceptId: string;
  openingId?: string;
  lineId?: string;
  fen: string;
  moveUci?: string;
  moveSan?: string;
  keySquares: string[];
  keyPieces: string[];
  primaryTargetSquare?: string;
  reviewPromptKind: "find_move" | "tap_key_square" | "assisted_replay" | "speed_solve" | "context_only";
  explanationKey?: string;
};

export type VisualRecipeDebug = {
  recipeFrameId?: number;
  recipeFen: string;
  sourceMode: string;
  sourceConceptId?: string;
  sourceMoveTrust?: string;
  sourceContextTrust?: string;
  primitiveCount: number;
  suppressedPrimitives: string[];
  recipeSuppressedReason?: string;
  permissionSummary: string;
  recipeLanes: VisualLane[];
  recipeEffectFamilies: VisualEffectFamily[];
  recipePrioritySummary: string;
  recipeTimingProfile: VisualTimingProfile;
  recipeOpacityPolicy: VisualOpacityPolicy;
  suppressedByPriority: string[];
  suppressedByBudget: string[];
  tacticalPrimitivesPresent: boolean;
  tacticalPrimitivesRendered: boolean;
  schemaSerializable: boolean;
};

export type VisualRecipe = {
  recipeSchemaVersion: VisualRecipeSchemaVersion;
  id: string;
  visualRecipeId: string;
  patternId: string;
  mode: VisualRecipeMode;
  conceptId: string;
  frameId?: number;
  fen: string;
  moveUci?: string;
  moveSan?: string;
  beats: VisualBeat[];
  endState: VisualRecipeEndState;
  permissions: VisualRecipePermissions;
  learningAnchor: VisualLearningAnchor;
  debug?: VisualRecipeDebug;
};

export type VisualRecipeCompileInput = {
  trainingContext?: TrainingContextResult | null;
  expectedMoveUci?: string;
  expectedMoveSan?: string;
  openingId?: string;
  lineId?: string;
  fen: string;
  frameId?: number;
  viewMode: "assisted" | "plain";
  revealState: "hidden" | "revealed";
  trainerPhase?: "ready_for_user" | "opponent_selecting" | "opponent_animating" | "transitioning";
  userToMove?: boolean;
  visualBudgetOverride?: Partial<VisualRecipeBudget>;
};

export type VisualRecipeBudget = {
  maxPrimaryPrimitives: number;
  maxSupportingPrimitives: number;
  maxLines: number;
  maxTargets: number;
  maxGhosts: number;
  maxTotalPrimitives: number;
};

export type VisualRecipePermissionInput = {
  trainingContext?: TrainingContextResult | null;
  viewMode: "assisted" | "plain";
  revealState: "hidden" | "revealed";
  isStale?: boolean;
  lifecycleGatePassed?: boolean;
};

export type VisualRecipePermissionDecision = {
  mode: VisualRecipeMode;
  permissions: VisualRecipePermissions;
  suppressedReason?: string;
  sourceMoveTrust?: string;
  sourceContextTrust?: string;
};

export function asConceptId(value?: string): TeachingConceptId | undefined {
  return value as TeachingConceptId | undefined;
}
