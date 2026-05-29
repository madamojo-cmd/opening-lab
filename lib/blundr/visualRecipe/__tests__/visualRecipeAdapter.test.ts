import assert from "node:assert/strict";

import { adaptVisualRecipe } from "../visualRecipeAdapter";
import { compileVisualRecipe } from "../visualRecipeCompiler";

const FEN_START_4 = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -";
const FEN_START_6 = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const FEN_AFTER_E4_6 = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1";
const FEN_AFTER_E4_4 = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq -";

function mockRecipe(partial: Record<string, unknown>): any {
  return {
    recipeSchemaVersion: 1,
    id: "vr:test",
    visualRecipeId: "vr:test",
    patternId: "pattern:test",
    mode: "move_teaching",
    conceptId: "castle_for_safety",
    frameId: 10,
    fen: FEN_START_6,
    moveUci: "e1g1",
    moveSan: "O-O",
    beats: [
      {
        id: "beat1",
        order: 1,
        durationMs: 800,
        primitives: [{
          id: "p1",
          type: "move_arrow",
          lane: "persistent_teaching",
          effectFamily: "teaching_move",
          priority: 5,
          emphasis: "primary",
          from: "e1",
          to: "g1",
          purpose: "answer_move",
          opacityPolicy: { defaultOpacity: 1, hoverOpacity: 0.1, dragOpacity: 0.1, pieceLiftOpacity: 0.1, moveLandingOpacity: 1, suppressedOpacity: 0 },
        }],
      },
    ],
    endState: { persistPrimitives: [], clearOn: ["phase_change"] },
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
    learningAnchor: { patternId: "pattern:test", conceptId: "castle_for_safety", fen: FEN_START_6, keySquares: ["e1", "g1"], keyPieces: ["king"], reviewPromptKind: "find_move" },
    debug: {
      sourceMoveTrust: "engine_verified",
      sourceContextTrust: "safe_context",
      recipeFen: FEN_START_6,
      sourceMode: "move_teaching",
      primitiveCount: 1,
      suppressedPrimitives: [],
      permissionSummary: "{}",
      recipeLanes: ["persistent_teaching"],
      recipeEffectFamilies: ["teaching_move"],
      recipePrioritySummary: "move_arrow:5",
      recipeTimingProfile: { fadeInMs: 100, holdMs: 0, fadeOutMs: 100, totalMs: 0, persistent: true },
      recipeOpacityPolicy: { defaultOpacity: 1, hoverOpacity: 0.1, dragOpacity: 0.1, pieceLiftOpacity: 0.1, moveLandingOpacity: 1, suppressedOpacity: 0 },
      suppressedByPriority: [],
      suppressedByBudget: [],
      tacticalPrimitivesPresent: false,
      tacticalPrimitivesRendered: false,
      schemaSerializable: true,
    },
    ...partial,
  };
}

export function testVisualRecipeAdapter(): void {
  const trusted = mockRecipe({});
  const allowed = adaptVisualRecipe({
    recipe: trusted,
    phase: "ready_for_user",
    userToMove: true,
    viewMode: "assisted",
    boardFen: FEN_START_4,
    trainerFrameId: 10,
    overlayFrameId: 10,
    opponentCandidateRenderedInMainUi: false,
  });
  assert.equal(allowed.adapterAllowed, true);
  assert.equal(allowed.recipeFenMatchesBoard, true);
  assert.equal(allowed.recipeFrameMatchesBoard, true);
  assert.equal(allowed.recipeFenRaw, FEN_START_6);
  assert.equal(allowed.boardFenRaw, FEN_START_4);

  const staleFrame = adaptVisualRecipe({
    recipe: trusted,
    phase: "ready_for_user",
    userToMove: true,
    viewMode: "assisted",
    boardFen: FEN_START_4,
    trainerFrameId: 11,
    overlayFrameId: 10,
  });
  assert.equal(staleFrame.adapterAllowed, false);
  assert.equal(staleFrame.adapterSuppressedReason, "stale_frame_or_fen_mismatch");

  const staleFen = adaptVisualRecipe({
    recipe: trusted,
    phase: "ready_for_user",
    userToMove: true,
    viewMode: "assisted",
    boardFen: FEN_AFTER_E4_4,
    trainerFrameId: 10,
    overlayFrameId: 10,
  });
  assert.equal(staleFen.adapterAllowed, false);
  assert.equal(staleFen.adapterSuppressedReason, "stale_frame_or_fen_mismatch");

  const selecting = adaptVisualRecipe({
    recipe: trusted,
    phase: "opponent_selecting",
    userToMove: true,
    viewMode: "assisted",
    boardFen: FEN_START_4,
    trainerFrameId: 10,
    overlayFrameId: 10,
  });
  assert.equal(selecting.adapterAllowed, false);

  const plain = adaptVisualRecipe({
    recipe: trusted,
    phase: "ready_for_user",
    userToMove: true,
    viewMode: "plain",
    boardFen: FEN_START_4,
    trainerFrameId: 10,
    overlayFrameId: 10,
  });
  assert.equal(plain.adapterAllowed, false);

  const candidateBlocked = adaptVisualRecipe({
    recipe: trusted,
    phase: "ready_for_user",
    userToMove: true,
    viewMode: "assisted",
    boardFen: FEN_START_4,
    trainerFrameId: 10,
    overlayFrameId: 10,
    opponentCandidateRenderedInMainUi: true,
  });
  assert.equal(candidateBlocked.adapterAllowed, false);
  assert.equal(candidateBlocked.adapterSuppressedReason, "opponent_candidate_blocked");

  const assistedContextRecipe = compileVisualRecipe({
    trainingContext: {
      mode: "assisted_context",
      moveTrust: "untrusted",
      contextTrust: "safe_context",
      cue: { conceptId: "center_tension", metadata: { moveUci: "c2c3", moveSan: "c3", fenBefore: FEN_START_6, compilerVersion: "2.7.35d", createdAt: "now" } },
      selectedStory: { visualIntent: { squares: [{ square: "d4", kind: "target" }, { square: "e4", kind: "target" }] } },
      nextPlay: { allowed: false },
    } as any,
    fen: FEN_START_6,
    viewMode: "assisted",
    revealState: "hidden",
    expectedMoveUci: "c2c3",
    expectedMoveSan: "c3",
    frameId: 12,
  });
  const assistedContext = adaptVisualRecipe({
    recipe: assistedContextRecipe,
    phase: "ready_for_user",
    userToMove: true,
    viewMode: "assisted",
    boardFen: FEN_START_4,
    trainerFrameId: 12,
    overlayFrameId: 12,
  });
  assert.equal(assistedContext.adapterAllowed, true);
  assert.equal(assistedContext.lines.length, 0);
  assert.equal(assistedContext.squares.length > 0, true);

  const tacticalRecipe = mockRecipe({
    beats: [
      {
        id: "beat1",
        order: 1,
        durationMs: 800,
        primitives: [
          {
            id: "t1",
            type: "escape_grid",
            lane: "transient_tactical_effect",
            effectFamily: "escape_grid",
            priority: 1,
            emphasis: "primary",
            kingSquare: "e8",
            deniedSquares: ["e7", "f7"],
            opacityPolicy: { defaultOpacity: 1, hoverOpacity: 0.1, dragOpacity: 0.1, pieceLiftOpacity: 0.1, moveLandingOpacity: 1, suppressedOpacity: 0 },
          },
        ],
      },
    ],
    debug: {
      ...trusted.debug,
      tacticalPrimitivesPresent: true,
      recipeLanes: ["transient_tactical_effect"],
      recipeEffectFamilies: ["escape_grid"],
    },
  });
  const tacticalAdapted = adaptVisualRecipe({
    recipe: tacticalRecipe,
    phase: "ready_for_user",
    userToMove: true,
    viewMode: "assisted",
    boardFen: FEN_START_4,
    trainerFrameId: 10,
    overlayFrameId: 10,
  });
  assert.equal(tacticalAdapted.tacticalPrimitivesPresent, true);
  assert.equal(tacticalAdapted.tacticalPrimitivesRendered, false);
  assert.equal(tacticalAdapted.lines.length, 0);
  assert.equal(tacticalAdapted.squares.length, 0);

  const frameStringMatch = adaptVisualRecipe({
    recipe: trusted,
    phase: "ready_for_user",
    userToMove: true,
    viewMode: "assisted",
    boardFen: FEN_START_4,
    trainerFrameId: "10" as any,
    overlayFrameId: 10,
  });
  assert.equal(frameStringMatch.adapterAllowed, true);

  const differentSide = adaptVisualRecipe({
    recipe: { ...trusted, fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1" },
    phase: "ready_for_user",
    userToMove: true,
    viewMode: "assisted",
    boardFen: FEN_START_4,
    trainerFrameId: 10,
    overlayFrameId: 10,
  });
  assert.equal(differentSide.adapterAllowed, false);

  const differentCastling = adaptVisualRecipe({
    recipe: { ...trusted, fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQ - 0 1" },
    phase: "ready_for_user",
    userToMove: true,
    viewMode: "assisted",
    boardFen: FEN_START_4,
    trainerFrameId: 10,
    overlayFrameId: 10,
  });
  assert.equal(differentCastling.adapterAllowed, false);

  const differentEnPassant = adaptVisualRecipe({
    recipe: { ...trusted, fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq e3 0 1" },
    phase: "ready_for_user",
    userToMove: true,
    viewMode: "assisted",
    boardFen: FEN_START_4,
    trainerFrameId: 10,
    overlayFrameId: 10,
  });
  assert.equal(differentEnPassant.adapterAllowed, false);

  const e2e4 = mockRecipe({
    visualRecipeId: "vr:e2e4",
    id: "vr:e2e4",
    patternId: "pattern:e2e4",
    frameId: 70,
    conceptId: "develop_and_control",
    fen: FEN_START_6,
    moveUci: "e2e4",
    moveSan: "e4",
    beats: [
      {
        id: "beat-e4",
        order: 1,
        durationMs: 500,
        primitives: [
          { id: "arrow-e2e4", type: "move_arrow", lane: "persistent_teaching", effectFamily: "teaching_move", priority: 5, emphasis: "primary", from: "e2", to: "e4" },
          { id: "sq-e4", type: "square_highlight", lane: "persistent_teaching", effectFamily: "center", priority: 5, emphasis: "supporting", square: "e4", role: "center" },
        ],
      },
    ],
    debug: { ...trusted.debug, sourceMoveTrust: "engine_verified" },
  });
  const e2e4Adapted = adaptVisualRecipe({
    recipe: e2e4,
    phase: "ready_for_user",
    userToMove: true,
    viewMode: "assisted",
    boardFen: FEN_START_4,
    trainerFrameId: 70,
    overlayFrameId: 70,
  });
  assert.equal(e2e4Adapted.adapterAllowed, true);
  assert.equal(e2e4Adapted.lines.some((line) => line.from === "e2" && line.to === "e4"), true);

  const trueStaleMismatch = adaptVisualRecipe({
    recipe: { ...e2e4, fen: FEN_AFTER_E4_6 },
    phase: "ready_for_user",
    userToMove: true,
    viewMode: "assisted",
    boardFen: FEN_START_4,
    trainerFrameId: 70,
    overlayFrameId: 70,
  });
  assert.equal(trueStaleMismatch.adapterAllowed, false);
  assert.equal(trueStaleMismatch.adapterSuppressedReason, "stale_frame_or_fen_mismatch");
}
