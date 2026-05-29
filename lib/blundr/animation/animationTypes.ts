import type { VisualPrimitive, VisualRecipe } from "../visualRecipe/visualRecipeTypes";

export type AnimationPlaybackState =
  | "idle"
  | "playing"
  | "held_end_state"
  | "skipped_to_end"
  | "cleared"
  | "suppressed";

export type AnimationClearReason =
  | "user_move"
  | "opponent_selecting"
  | "opponent_animating"
  | "fen_change"
  | "frame_change"
  | "view_mode_change"
  | "plain_view"
  | "recipe_suppressed"
  | "manual_clear";

export type AnimationSuppressionReason =
  | "no_recipe"
  | "adapter_suppressed"
  | "plain_view"
  | "stale_frame"
  | "stale_fen"
  | "phase_gate"
  | "opponent_candidate_blocked"
  | "lifecycle_mismatch"
  | "replay_unavailable";

export type ReducedMotionMode = "system" | "reduce" | "full";

export type ActiveVisualBeatState = {
  beatIndex: number;
  beatId?: string;
  primitives: VisualPrimitive[];
  startsAtMs: number;
  endsAtMs: number;
};

export type ActiveVisualRecipePlayback = {
  playbackState: AnimationPlaybackState;
  recipe?: VisualRecipe;
  recipeId?: string;
  patternId?: string;
  activeBeatIndex?: number;
  activeBeatId?: string;
  activePrimitiveIds: string[];
  visiblePrimitives: VisualPrimitive[];
  reducedMotion: boolean;
  skippedToEnd: boolean;
  clearedReason?: AnimationClearReason;
  suppressedReason?: AnimationSuppressionReason;
  replayAvailable: boolean;
  recipeFrameMatchesBoard: boolean;
  recipeFenMatchesBoard: boolean;
  tacticalPrimitivesRendered: false;
};

export type AnimationConductorContext = {
  phase: "ready_for_user" | "opponent_selecting" | "opponent_animating" | "transitioning";
  viewMode: "assisted" | "plain";
  boardFen: string;
  trainerFrameId: number;
  overlayFrameId: number;
  userToMove: boolean;
  adapterAllowed: boolean;
  adapterSuppressedReason?: string;
  opponentCandidateRenderedInMainUi?: boolean;
};
