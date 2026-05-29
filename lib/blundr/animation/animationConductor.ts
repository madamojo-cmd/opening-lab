import type { VisualPrimitive, VisualRecipe } from "../visualRecipe/visualRecipeTypes";
import { buildAnimationTimeline, getActiveBeatEntry, getLastBeatEntry, type BeatTimelineEntry } from "./animationTimeline";
import { reduceAnimationPlayback } from "./animationStateMachine";
import { normalizeFenForVisualFrame, visualFrameMatches } from "../teaching/overlayLifecycle";
import type {
  ActiveVisualRecipePlayback,
  AnimationClearReason,
  AnimationConductorContext,
  AnimationSuppressionReason,
  ReducedMotionMode,
} from "./animationTypes";

function isTacticalPrimitive(primitive: VisualPrimitive): boolean {
  return primitive.lane !== "persistent_teaching";
}

function stripUnsupportedPrimitives(primitives: VisualPrimitive[]): VisualPrimitive[] {
  return primitives.filter((primitive) => !isTacticalPrimitive(primitive));
}

function endStatePrimitives(recipe: VisualRecipe): VisualPrimitive[] {
  const lastBeat = recipe.beats.slice().sort((a, b) => a.order - b.order).at(-1);
  if (!lastBeat) return [];
  const persistSet = new Set(recipe.endState.persistPrimitives);
  if (!persistSet.size) return stripUnsupportedPrimitives(lastBeat.primitives);
  return stripUnsupportedPrimitives(lastBeat.primitives.filter((primitive) => persistSet.has(primitive.id)));
}

function isLifecycleValid(context: AnimationConductorContext): { valid: boolean; suppress?: AnimationSuppressionReason; clear?: AnimationClearReason } {
  if (context.viewMode === "plain") return { valid: false, suppress: "plain_view" };
  if (context.phase === "opponent_selecting") return { valid: false, clear: "opponent_selecting" };
  if (context.phase === "opponent_animating") return { valid: false, clear: "opponent_animating" };
  if (context.phase === "transitioning") return { valid: false, clear: "user_move" };
  if (context.opponentCandidateRenderedInMainUi) return { valid: false, suppress: "opponent_candidate_blocked" };
  if (!context.adapterAllowed) return { valid: false, suppress: "adapter_suppressed" };
  return { valid: true };
}

export class AnimationConductor {
  private state: ActiveVisualRecipePlayback;
  private timeline: BeatTimelineEntry[] = [];
  private recipeStartMs = 0;
  private lastViewMode?: AnimationConductorContext["viewMode"];

  constructor() {
    this.state = {
      playbackState: "idle",
      activePrimitiveIds: [],
      visiblePrimitives: [],
      reducedMotion: false,
      skippedToEnd: false,
      replayAvailable: false,
      recipeFrameMatchesBoard: false,
      recipeFenMatchesBoard: false,
      tacticalPrimitivesRendered: false,
    };
  }

  snapshot(): ActiveVisualRecipePlayback {
    return this.state;
  }

  private setSuppressed(reason: AnimationSuppressionReason): ActiveVisualRecipePlayback {
    this.state = reduceAnimationPlayback(this.state, { type: "suppress", reason });
    this.state = {
      ...this.state,
      tacticalPrimitivesRendered: false,
    };
    return this.state;
  }

  private setCleared(reason: AnimationClearReason): ActiveVisualRecipePlayback {
    this.state = reduceAnimationPlayback(this.state, { type: "clear", reason });
    this.state = {
      ...this.state,
      tacticalPrimitivesRendered: false,
    };
    return this.state;
  }

  private applyBeat(recipe: VisualRecipe, beatEntry: BeatTimelineEntry, playbackState: ActiveVisualRecipePlayback["playbackState"]): ActiveVisualRecipePlayback {
    const visiblePrimitives = stripUnsupportedPrimitives(beatEntry.beat.primitives);
    this.state = {
      ...this.state,
      playbackState,
      recipe,
      recipeId: recipe.visualRecipeId,
      patternId: recipe.patternId,
      activeBeatIndex: beatEntry.beatIndex,
      activeBeatId: beatEntry.beatId,
      visiblePrimitives,
      activePrimitiveIds: visiblePrimitives.map((primitive) => primitive.id),
      clearedReason: undefined,
      suppressedReason: undefined,
      replayAvailable: true,
      tacticalPrimitivesRendered: false,
    };
    return this.state;
  }

  private applyEndState(recipe: VisualRecipe, playbackState: ActiveVisualRecipePlayback["playbackState"]): ActiveVisualRecipePlayback {
    const visiblePrimitives = endStatePrimitives(recipe);
    const lastEntry = getLastBeatEntry(this.timeline);
    this.state = {
      ...this.state,
      playbackState,
      recipe,
      recipeId: recipe.visualRecipeId,
      patternId: recipe.patternId,
      activeBeatIndex: lastEntry?.beatIndex,
      activeBeatId: lastEntry?.beatId,
      visiblePrimitives,
      activePrimitiveIds: visiblePrimitives.map((primitive) => primitive.id),
      clearedReason: undefined,
      suppressedReason: undefined,
      replayAvailable: true,
      tacticalPrimitivesRendered: false,
    };
    return this.state;
  }

  private startRecipe(recipe: VisualRecipe, nowMs: number, reducedMotion: boolean): ActiveVisualRecipePlayback {
    this.recipeStartMs = nowMs;
    this.timeline = buildAnimationTimeline(recipe, nowMs);
    if (!this.timeline.length) return this.applyEndState(recipe, "held_end_state");
    if (reducedMotion) {
      this.state = {
        ...this.state,
        reducedMotion: true,
      };
      return this.applyEndState(recipe, "held_end_state");
    }
    this.state = {
      ...this.state,
      reducedMotion: false,
      skippedToEnd: false,
    };
    const first = this.timeline[0];
    if (nowMs < first.startsAtMs) {
      return this.applyBeat(recipe, first, "playing");
    }
    return this.applyBeat(recipe, first, "playing");
  }

  private validateRecipeFrameFen(recipe: VisualRecipe, context: AnimationConductorContext): { frameOk: boolean; fenOk: boolean } {
    const frameOk = visualFrameMatches(recipe.frameId, context.trainerFrameId);
    const recipeFen = normalizeFenForVisualFrame(recipe.fen);
    const boardFen = normalizeFenForVisualFrame(context.boardFen);
    const fenOk = Boolean(recipeFen && boardFen && recipeFen === boardFen);
    return { frameOk, fenOk };
  }

  sync(input: {
    recipe?: VisualRecipe | null;
    context: AnimationConductorContext;
    nowMs: number;
    reducedMotionMode?: ReducedMotionMode;
  }): ActiveVisualRecipePlayback {
    const reducedMotion = input.reducedMotionMode === "reduce";
    const { recipe, context, nowMs } = input;

    if (!recipe || recipe.mode === "noop") {
      this.lastViewMode = context.viewMode;
      this.state = {
        ...this.state,
        recipe: undefined,
        recipeId: undefined,
        patternId: undefined,
        recipeFrameMatchesBoard: false,
        recipeFenMatchesBoard: false,
      };
      return this.setSuppressed("no_recipe");
    }

    if (this.lastViewMode && this.lastViewMode !== context.viewMode && this.state.recipeId) {
      this.lastViewMode = context.viewMode;
      return this.setCleared("view_mode_change");
    }

    const lifecycle = isLifecycleValid(context);
    this.lastViewMode = context.viewMode;
    if (!lifecycle.valid) {
      this.state = {
        ...this.state,
        recipe,
        recipeId: recipe.visualRecipeId,
        patternId: recipe.patternId,
      };
      if (lifecycle.clear) return this.setCleared(lifecycle.clear);
      return this.setSuppressed(lifecycle.suppress ?? "lifecycle_mismatch");
    }

    const frameFen = this.validateRecipeFrameFen(recipe, context);
    this.state = {
      ...this.state,
      recipeFrameMatchesBoard: frameFen.frameOk,
      recipeFenMatchesBoard: frameFen.fenOk,
    };
    const recipeChanged = this.state.recipeId !== recipe.visualRecipeId;
    if (!frameFen.frameOk) {
      if (recipeChanged || this.state.playbackState === "idle" || this.state.playbackState === "suppressed" || this.state.playbackState === "cleared") {
        return this.setSuppressed("stale_frame");
      }
      return this.setCleared("frame_change");
    }
    if (!frameFen.fenOk) {
      if (recipeChanged || this.state.playbackState === "idle" || this.state.playbackState === "suppressed" || this.state.playbackState === "cleared") {
        return this.setSuppressed("stale_fen");
      }
      return this.setCleared("fen_change");
    }
    if (recipeChanged || this.state.playbackState === "idle" || this.state.playbackState === "suppressed" || this.state.playbackState === "cleared") {
      return this.startRecipe(recipe, nowMs, reducedMotion);
    }

    if (this.state.playbackState === "held_end_state" || this.state.playbackState === "skipped_to_end") {
      return this.state;
    }

    const active = getActiveBeatEntry(this.timeline, nowMs);
    if (active) return this.applyBeat(recipe, active, "playing");

    const last = getLastBeatEntry(this.timeline);
    if (last && nowMs >= last.endsAtMs) {
      return this.applyEndState(recipe, "held_end_state");
    }

    return this.state;
  }

  clear(reason: AnimationClearReason): ActiveVisualRecipePlayback {
    return this.setCleared(reason);
  }

  skipToEnd(): ActiveVisualRecipePlayback {
    const recipe = this.state.recipe;
    if (!recipe) return this.setSuppressed("no_recipe");
    this.state = {
      ...this.state,
      skippedToEnd: true,
      reducedMotion: false,
    };
    return this.applyEndState(recipe, "skipped_to_end");
  }

  replay(input: { context: AnimationConductorContext; nowMs: number; reducedMotionMode?: ReducedMotionMode }): ActiveVisualRecipePlayback {
    const recipe = this.state.recipe;
    if (!recipe) return this.setSuppressed("replay_unavailable");
    const lifecycle = isLifecycleValid(input.context);
    const frameFen = this.validateRecipeFrameFen(recipe, input.context);
    if (!lifecycle.valid || !frameFen.frameOk || !frameFen.fenOk) return this.setSuppressed("replay_unavailable");
    return this.startRecipe(recipe, input.nowMs, input.reducedMotionMode === "reduce");
  }
}
