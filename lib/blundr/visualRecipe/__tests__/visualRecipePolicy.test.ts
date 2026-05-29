import assert from "node:assert/strict";

import { buildTrainingContext } from "../../teaching/trainingContextEngine";
import { adaptVisualRecipe } from "../visualRecipeAdapter";
import { compileVisualRecipe } from "../visualRecipeCompiler";
import { DEFAULT_VISUAL_OPACITY_POLICY, opacityForInteraction } from "../visualOpacityPolicy";
import { applyVisualPriorityPolicy } from "../visualPriorityPolicy";
import { TRANSIENT_TACTICAL_TIMING } from "../visualTimingProfiles";
import type { DangerGlowPrimitive, EscapeGridPrimitive, MultiHubSnapPrimitive, RayTrackerPrimitive, VisualPrimitive } from "../visualRecipeTypes";

export function testVisualRecipePolicy(): void {
  const ray: RayTrackerPrimitive = {
    id: "ray1",
    type: "ray_tracker",
    lane: "transient_tactical_effect",
    effectFamily: "ray_tracker",
    attackerSquare: "b1",
    primaryTargetSquare: "e4",
    behindTargetSquare: "g6",
    lineStyle: "solid_then_dashed",
    dashPattern: [4, 2],
    priority: 3,
    emphasis: "primary",
    purpose: "pin",
    opacityPolicy: DEFAULT_VISUAL_OPACITY_POLICY,
  };
  assert.equal(ray.priority, 3);
  assert.equal(ray.lane, "transient_tactical_effect");

  const hub: MultiHubSnapPrimitive = {
    id: "hub1",
    type: "multi_hub_snap",
    lane: "transient_tactical_effect",
    effectFamily: "multi_hub_snap",
    hubSquare: "e5",
    targetSquares: ["f7", "d7"],
    targetRingStyle: "ring",
    priority: 2,
    emphasis: "primary",
    opacityPolicy: DEFAULT_VISUAL_OPACITY_POLICY,
  };
  assert.equal(hub.targetSquares.length, 2);
  assert.equal(hub.priority, 2);

  const escape: EscapeGridPrimitive = {
    id: "esc1",
    type: "escape_grid",
    lane: "transient_tactical_effect",
    effectFamily: "escape_grid",
    kingSquare: "g8",
    deniedSquares: ["g7", "h7"],
    checkSourceSquare: "g6",
    priority: 1,
    emphasis: "primary",
    opacityPolicy: DEFAULT_VISUAL_OPACITY_POLICY,
  };
  assert.equal(escape.priority, 1);
  assert.equal(escape.deniedSquares.includes("g7"), true);

  const danger: DangerGlowPrimitive = {
    id: "d1",
    type: "danger_glow",
    lane: "persistent_tactical_status",
    effectFamily: "danger_glow",
    square: "e5",
    piece: "queen",
    pulse: "low_frequency",
    priority: 4,
    emphasis: "status",
    opacityPolicy: DEFAULT_VISUAL_OPACITY_POLICY,
  };
  assert.equal(danger.lane, "persistent_tactical_status");
  assert.equal(opacityForInteraction(DEFAULT_VISUAL_OPACITY_POLICY, "hover"), 0.1);
  assert.equal(opacityForInteraction(DEFAULT_VISUAL_OPACITY_POLICY, "drag"), 0.1);
  assert.equal(opacityForInteraction(DEFAULT_VISUAL_OPACITY_POLICY, "piece_lift"), 0.1);

  const priorityResult = applyVisualPriorityPolicy([ray, hub, escape] as VisualPrimitive[]);
  assert.equal(priorityResult.kept.some((primitive) => primitive.id === "esc1"), true);
  assert.equal(priorityResult.kept.some((primitive) => primitive.id === "hub1"), false);
  assert.equal(priorityResult.suppressedByPriority.includes("hub1"), true);
  assert.equal(priorityResult.suppressedByPriority.includes("ray1"), true);

  assert.equal(TRANSIENT_TACTICAL_TIMING.totalMs, 1000);

  const laneResult = applyVisualPriorityPolicy([
    { ...escape },
    {
      id: "teach1",
      type: "move_arrow",
      lane: "persistent_teaching",
      effectFamily: "teaching_move",
      from: "e2",
      to: "e4",
      priority: 5,
      emphasis: "primary",
      opacityPolicy: DEFAULT_VISUAL_OPACITY_POLICY,
    },
  ] as VisualPrimitive[]);
  assert.equal(laneResult.kept.some((primitive) => primitive.id === "teach1"), true);
  assert.equal(laneResult.kept.some((primitive) => primitive.id === "esc1"), true);

  const fen = "r1bqk2r/ppp2ppp/2np1n2/2b1p3/2B1P3/2PP1N2/PP3PPP/RNBQK2R w KQkq - 0 6";
  const tc = buildTrainingContext({
    fenBefore: fen,
    expectedMoveUci: "e1g1",
    expectedMoveSan: "O-O",
    moveQuality: { status: "verified_top2", topMoves: [{ rank: 1, uci: "a2a4", san: "a4", scoreCp: 21 }, { rank: 2, uci: "e1g1", san: "O-O", scoreCp: 20 }] },
    bookSupport: { hasBookSupport: true, confidence: 0.85, reason: "in_book" },
    repertoireSupport: true,
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: true,
    showAnswer: false,
  });

  const assistedRecipe = compileVisualRecipe({
    trainingContext: tc,
    fen,
    viewMode: "assisted",
    revealState: "hidden",
    openingId: "italian",
    lineId: "italian",
    expectedMoveUci: "e1g1",
    expectedMoveSan: "O-O",
    frameId: 20,
  });
  const plainRecipe = compileVisualRecipe({
    trainingContext: tc,
    fen,
    viewMode: "plain",
    revealState: "hidden",
    openingId: "italian",
    lineId: "italian",
    expectedMoveUci: "e1g1",
    expectedMoveSan: "O-O",
    frameId: 20,
  });
  assert.equal(plainRecipe.mode, "noop");

  const roundTrip = JSON.parse(JSON.stringify(assistedRecipe));
  assert.equal(roundTrip.visualRecipeId, assistedRecipe.visualRecipeId);

  const assistedRecipeAgain = compileVisualRecipe({
    trainingContext: tc,
    fen,
    viewMode: "assisted",
    revealState: "hidden",
    openingId: "italian",
    lineId: "italian",
    expectedMoveUci: "e1g1",
    expectedMoveSan: "O-O",
    frameId: 20,
  });
  assert.equal(assistedRecipe.visualRecipeId, assistedRecipeAgain.visualRecipeId);
  assert.equal(assistedRecipe.patternId, assistedRecipeAgain.patternId);

  assert.equal(Boolean(assistedRecipe.learningAnchor.patternId), true);
  assert.equal(Boolean(assistedRecipe.learningAnchor.conceptId), true);
  assert.equal(Boolean(assistedRecipe.learningAnchor.fen), true);
  assert.equal(Boolean(assistedRecipe.learningAnchor.moveUci), true);
  assert.equal(assistedRecipe.learningAnchor.keySquares.length > 0, true);
  assert.equal(Boolean(assistedRecipe.learningAnchor.reviewPromptKind), true);

  const tacticalRecipe = {
    ...assistedRecipe,
    beats: [{
      id: "tactical-beat",
      order: 1,
      durationMs: 500,
      primitives: [escape],
      timingProfile: TRANSIENT_TACTICAL_TIMING,
    }],
  };
  const adapted = adaptVisualRecipe({
    recipe: tacticalRecipe,
    phase: "ready_for_user",
    userToMove: true,
    viewMode: "assisted",
    boardFen: fen,
    trainerFrameId: 20,
    overlayFrameId: 20,
  });
  assert.equal(adapted.tacticalPrimitivesPresent, true);
  assert.equal(adapted.tacticalPrimitivesRendered, false);
  assert.equal(adapted.lines.length, 0);
  assert.equal(adapted.squares.length, 0);
}
