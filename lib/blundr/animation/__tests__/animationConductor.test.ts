import assert from "node:assert/strict";

import { AnimationConductor } from "../animationConductor";
import type { AnimationConductorContext } from "../animationTypes";
import type { VisualRecipe } from "../../visualRecipe/visualRecipeTypes";
import { TRANSIENT_TACTICAL_TIMING } from "../../visualRecipe/visualTimingProfiles";

const FEN_START_4 = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -";
const FEN_START_6 = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

function baseContext(partial: Partial<AnimationConductorContext> = {}): AnimationConductorContext {
  return {
    phase: "ready_for_user",
    viewMode: "assisted",
    boardFen: FEN_START_4,
    trainerFrameId: 7,
    overlayFrameId: 7,
    userToMove: true,
    adapterAllowed: true,
    ...partial,
  };
}

function recipe(mode: VisualRecipe["mode"] = "move_teaching"): VisualRecipe {
  const beats: VisualRecipe["beats"] = mode === "assisted_context"
    ? [
        {
          id: "beat-context",
          order: 1,
          durationMs: 400,
          delayMs: 0,
          primitives: [
            {
              id: "p-center",
              type: "square_highlight",
              square: "d4",
              role: "center",
              lane: "persistent_teaching",
              effectFamily: "center",
              priority: 5,
              emphasis: "primary",
            },
          ],
        },
      ]
    : [
        {
          id: "beat-1",
          order: 1,
          durationMs: 400,
          delayMs: 0,
          primitives: [
            {
              id: "p-move",
              type: "move_arrow",
              from: "f1",
              to: "c4",
              lane: "persistent_teaching",
              effectFamily: "teaching_move",
              priority: 5,
              emphasis: "primary",
            },
          ],
        },
        {
          id: "beat-2",
          order: 2,
          durationMs: 400,
          delayMs: 0,
          primitives: [
            {
              id: "p-pressure",
              type: "pressure_line",
              from: "c4",
              to: "f7",
              lane: "persistent_teaching",
              effectFamily: "pressure",
              priority: 5,
              emphasis: "supporting",
            },
          ],
        },
      ];

  return {
    recipeSchemaVersion: 1,
    id: "vr:v1:test",
    visualRecipeId: "vr:v1:test",
    patternId: "pattern:test",
    mode,
    conceptId: "develops_with_pressure",
    frameId: 7,
    fen: FEN_START_6,
    moveUci: "f1c4",
    moveSan: "Bc4",
    beats,
    endState: {
      persistPrimitives: ["p-pressure"],
      clearOn: ["phase_change", "fen_change", "view_mode_change", "user_move_submitted", "opponent_selecting", "opponent_animating"],
    },
    permissions: {
      canShowAnswerMove: true,
      canShowContext: true,
      canShowPressure: true,
      canShowTargets: true,
      canShowGhosts: false,
      canShowTacticalAssist: false,
      canPersistEndState: true,
      revealRequired: false,
      allowedViewModes: ["assisted"],
    },
    learningAnchor: {
      patternId: "pattern:test",
      conceptId: "develops_with_pressure",
      fen: FEN_START_6,
      moveUci: "f1c4",
      moveSan: "Bc4",
      keySquares: ["f1", "c4", "f7"],
      keyPieces: ["bishop"],
      reviewPromptKind: "find_move",
    },
    debug: {
      recipeFen: FEN_START_6,
      sourceMode: "move_teaching",
      primitiveCount: 2,
      suppressedPrimitives: [],
      permissionSummary: "{}",
      recipeLanes: ["persistent_teaching"],
      recipeEffectFamilies: ["teaching_move", "pressure"],
      recipePrioritySummary: "move_arrow:5,pressure_line:5",
      recipeTimingProfile: { fadeInMs: 100, holdMs: 0, fadeOutMs: 100, totalMs: 0, persistent: true },
      recipeOpacityPolicy: { defaultOpacity: 1, hoverOpacity: 0.1, dragOpacity: 0.1, pieceLiftOpacity: 0.1, moveLandingOpacity: 1, suppressedOpacity: 0 },
      suppressedByPriority: [],
      suppressedByBudget: [],
      tacticalPrimitivesPresent: false,
      tacticalPrimitivesRendered: false,
      schemaSerializable: true,
    },
  };
}

export function testAnimationConductor(): void {
  const conductor = new AnimationConductor();
  const r = recipe();

  const t0 = conductor.sync({ recipe: r, context: baseContext(), nowMs: 1000, reducedMotionMode: "full" });
  assert.equal(t0.playbackState, "playing");
  assert.equal(t0.activeBeatIndex, 0);
  const t0b = conductor.sync({ recipe: r, context: baseContext(), nowMs: 1050, reducedMotionMode: "full" });
  assert.equal(t0b.playbackState, "playing");
  assert.equal(t0b.activeBeatIndex, 0);

  const t1 = conductor.sync({ recipe: r, context: baseContext(), nowMs: 1500, reducedMotionMode: "full" });
  assert.equal(t1.activeBeatIndex, 1);

  const t2 = conductor.sync({ recipe: r, context: baseContext(), nowMs: 2200, reducedMotionMode: "full" });
  assert.equal(t2.playbackState, "held_end_state");
  assert.equal(t2.activePrimitiveIds.includes("p-pressure"), true);

  const staleIncomingFrame = conductor.sync({
    recipe: { ...r, visualRecipeId: "vr:v1:test:stale-frame", id: "vr:v1:test:stale-frame", frameId: 99 },
    context: baseContext(),
    nowMs: 2250,
    reducedMotionMode: "full",
  });
  assert.equal(staleIncomingFrame.playbackState, "suppressed");
  assert.equal(staleIncomingFrame.suppressedReason, "stale_frame");

  const staleIncomingFen = conductor.sync({
    recipe: { ...r, visualRecipeId: "vr:v1:test:stale-fen", id: "vr:v1:test:stale-fen", fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1" },
    context: baseContext(),
    nowMs: 2260,
    reducedMotionMode: "full",
  });
  assert.equal(staleIncomingFen.playbackState, "suppressed");
  assert.equal(staleIncomingFen.suppressedReason, "stale_fen");

  const resumed = conductor.sync({ recipe: r, context: baseContext(), nowMs: 2270, reducedMotionMode: "full" });
  assert.equal(resumed.playbackState, "playing");

  const fenCleared = conductor.sync({ recipe: r, context: baseContext({ boardFen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq -" }), nowMs: 2300, reducedMotionMode: "full" });
  assert.equal(fenCleared.playbackState, "cleared");
  assert.equal(fenCleared.clearedReason, "fen_change");

  const restartedAfterFenClear = conductor.sync({ recipe: r, context: baseContext(), nowMs: 2350, reducedMotionMode: "full" });
  assert.equal(restartedAfterFenClear.playbackState, "playing");

  const frameCleared = conductor.sync({ recipe: r, context: baseContext({ trainerFrameId: 8 }), nowMs: 2400, reducedMotionMode: "full" });
  assert.equal(frameCleared.playbackState, "cleared");
  assert.equal(frameCleared.clearedReason, "frame_change");

  const restartedAfterFrameClear = conductor.sync({ recipe: r, context: baseContext(), nowMs: 2420, reducedMotionMode: "full" });
  assert.equal(restartedAfterFrameClear.playbackState, "playing");

  const selectingCleared = conductor.sync({ recipe: r, context: baseContext({ phase: "opponent_selecting" }), nowMs: 2450, reducedMotionMode: "full" });
  assert.equal(selectingCleared.playbackState, "cleared");
  assert.equal(selectingCleared.clearedReason, "opponent_selecting");

  const animatingCleared = conductor.sync({ recipe: r, context: baseContext({ phase: "opponent_animating" }), nowMs: 2475, reducedMotionMode: "full" });
  assert.equal(animatingCleared.playbackState, "cleared");
  assert.equal(animatingCleared.clearedReason, "opponent_animating");

  const restartedAfterPhaseClear = conductor.sync({ recipe: r, context: baseContext(), nowMs: 2490, reducedMotionMode: "full" });
  assert.equal(restartedAfterPhaseClear.playbackState, "playing");

  const plainSuppressed = conductor.sync({ recipe: r, context: baseContext({ viewMode: "plain" }), nowMs: 2500, reducedMotionMode: "full" });
  assert.equal(plainSuppressed.playbackState, "cleared");
  assert.equal(plainSuppressed.clearedReason, "view_mode_change");

  const plainBlocked = conductor.sync({ recipe: r, context: baseContext({ viewMode: "plain" }), nowMs: 2510, reducedMotionMode: "full" });
  assert.equal(plainBlocked.playbackState, "suppressed");
  assert.equal(plainBlocked.suppressedReason, "plain_view");

  const assistedRestart = conductor.sync({ recipe: r, context: baseContext({ viewMode: "assisted" }), nowMs: 2520, reducedMotionMode: "full" });
  assert.equal(assistedRestart.playbackState, "cleared");
  assert.equal(assistedRestart.clearedReason, "view_mode_change");

  const reduced = conductor.sync({ recipe: r, context: baseContext(), nowMs: 2600, reducedMotionMode: "reduce" });
  assert.equal(reduced.playbackState, "held_end_state");

  const replayed = conductor.replay({ context: baseContext(), nowMs: 2700, reducedMotionMode: "full" });
  assert.equal(replayed.playbackState, "playing");

  const replayBlocked = conductor.replay({ context: baseContext({ boardFen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq -" }), nowMs: 2800, reducedMotionMode: "full" });
  assert.equal(replayBlocked.playbackState, "suppressed");

  const restarted = conductor.sync({ recipe: r, context: baseContext(), nowMs: 2900, reducedMotionMode: "full" });
  assert.equal(restarted.playbackState, "playing");
  const skipped = conductor.skipToEnd();
  assert.equal(skipped.playbackState, "skipped_to_end");

  const tacticalRecipe = {
    ...recipe(),
    id: "vr:v1:test:tactical",
    visualRecipeId: "vr:v1:test:tactical",
    beats: [
      {
        id: "tactical-beat",
        order: 1,
        durationMs: 500,
        timingProfile: TRANSIENT_TACTICAL_TIMING,
        primitives: [
          {
            id: "escape",
            type: "escape_grid",
            lane: "transient_tactical_effect",
            effectFamily: "escape_grid",
            kingSquare: "e8",
            deniedSquares: ["e7"],
            priority: 1,
            emphasis: "primary",
          },
        ],
      },
    ],
  } as VisualRecipe;
  const tactical = conductor.sync({ recipe: tacticalRecipe, context: baseContext(), nowMs: 3000, reducedMotionMode: "full" });
  assert.equal(tactical.tacticalPrimitivesRendered, false);
  assert.equal(tactical.visiblePrimitives.length, 0);

  const candidateBlocked = conductor.sync({ recipe: r, context: baseContext({ opponentCandidateRenderedInMainUi: true }), nowMs: 3100, reducedMotionMode: "full" });
  assert.equal(candidateBlocked.playbackState, "suppressed");

  const assistedContextNoArrow = conductor.sync({ recipe: recipe("assisted_context"), context: baseContext(), nowMs: 3200, reducedMotionMode: "full" });
  assert.equal(assistedContextNoArrow.visiblePrimitives.some((primitive) => primitive.type === "move_arrow"), false);

  const revealBlocked = conductor.sync({ recipe: recipe("reveal_answer"), context: baseContext({ adapterAllowed: false }), nowMs: 3300, reducedMotionMode: "full" });
  assert.equal(revealBlocked.playbackState, "suppressed");

  const e2e4 = conductor.sync({
    recipe: {
      ...r,
      visualRecipeId: "vr:v1:e2e4",
      id: "vr:v1:e2e4",
      patternId: "pattern:e2e4",
      moveUci: "e2e4",
      moveSan: "e4",
      beats: [
        {
          id: "beat-e4",
          order: 1,
          durationMs: 400,
          primitives: [
            { id: "arrow-e2e4", type: "move_arrow", from: "e2", to: "e4", lane: "persistent_teaching", effectFamily: "teaching_move", priority: 5, emphasis: "primary" },
            { id: "sq-e4", type: "square_highlight", square: "e4", role: "center", lane: "persistent_teaching", effectFamily: "center", priority: 5, emphasis: "supporting" },
          ],
        },
      ],
    } as VisualRecipe,
    context: baseContext(),
    nowMs: 3400,
    reducedMotionMode: "full",
  });
  assert.equal(e2e4.activePrimitiveIds.includes("arrow-e2e4"), true);
}
