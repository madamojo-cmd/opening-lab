import type { TrainingContextResult } from "../teaching/trainingContextTypes";
import { DEFAULT_VISUAL_OPACITY_POLICY } from "./visualOpacityPolicy";
import { DEFAULT_VISUAL_RECIPE_BUDGET, enforceVisualRecipeBudget } from "./visualRecipeBudget";
import {
  buildPatternId,
  buildVisualBeatId,
  buildVisualPrimitiveId,
  buildVisualRecipeId,
} from "./visualRecipeIds";
import { deriveVisualRecipePermissions } from "./visualRecipePermissions";
import { applyVisualPriorityPolicy } from "./visualPriorityPolicy";
import { PERSISTENT_TEACHING_TIMING, timingForLane } from "./visualTimingProfiles";
import {
  VISUAL_RECIPE_SCHEMA_VERSION,
  type VisualBeat,
  type VisualEffectFamily,
  type VisualLane,
  type VisualPrimitive,
  type VisualRecipe,
  type VisualRecipeCompileInput,
  type VisualRecipeDebug,
  type VisualRecipeMode,
} from "./visualRecipeTypes";

const CENTER_SQUARES = ["d4", "e4", "d5", "e5"];

function normalizeFen(fen: string): string {
  return fen.trim().replace(/\s+/g, " ");
}

function validSquare(square?: string): square is string {
  return Boolean(square && /^[a-h][1-8]$/.test(square));
}

function expectedMove(input: VisualRecipeCompileInput): { uci?: string; san?: string } {
  const uci = (input.expectedMoveUci ?? input.trainingContext?.cue.metadata.moveUci ?? "").toLowerCase();
  const san = input.expectedMoveSan ?? input.trainingContext?.cue.metadata.moveSan;
  return { uci: uci.length >= 4 ? uci : undefined, san };
}

function hasSevereSuppression(trainingContext?: TrainingContextResult | null): boolean {
  if (!trainingContext) return true;
  if (trainingContext.nextPlay?.suppressionReason && trainingContext.mode !== "assisted_context") return true;
  if (trainingContext.moveTrust === "untrusted" && trainingContext.mode !== "assisted_context") return true;
  return false;
}

function recipeSerializable(recipe: VisualRecipe): boolean {
  try {
    const json = JSON.stringify(recipe);
    if (!json.includes("visualRecipeId")) return false;
    const parsed = JSON.parse(json);
    return typeof parsed === "object" && parsed !== null;
  } catch {
    return false;
  }
}

function emptyDebug(input: {
  frameId?: number;
  fen: string;
  conceptId?: string;
  trainingContext?: TrainingContextResult | null;
  suppressedReason: string;
}): VisualRecipeDebug {
  return {
    recipeFrameId: input.frameId,
    recipeFen: input.fen,
    sourceMode: input.trainingContext?.mode ?? "none",
    sourceConceptId: input.conceptId,
    sourceMoveTrust: input.trainingContext?.moveTrust,
    sourceContextTrust: input.trainingContext?.contextTrust,
    primitiveCount: 0,
    suppressedPrimitives: [],
    recipeSuppressedReason: input.suppressedReason,
    permissionSummary: "noop",
    recipeLanes: [],
    recipeEffectFamilies: [],
    recipePrioritySummary: "none",
    recipeTimingProfile: PERSISTENT_TEACHING_TIMING,
    recipeOpacityPolicy: DEFAULT_VISUAL_OPACITY_POLICY,
    suppressedByPriority: [],
    suppressedByBudget: [],
    tacticalPrimitivesPresent: false,
    tacticalPrimitivesRendered: false,
    schemaSerializable: true,
  };
}

function createNoopRecipe(input: {
  fen: string;
  frameId?: number;
  openingId?: string;
  lineId?: string;
  conceptId?: string;
  moveUci?: string;
  moveSan?: string;
  suppressedReason: string;
  trainingContext?: TrainingContextResult | null;
}): VisualRecipe {
  const patternId = buildPatternId({
    openingId: input.openingId,
    lineId: input.lineId,
    conceptId: input.conceptId,
    moveUci: input.moveUci,
    fen: input.fen,
  });
  const visualRecipeId = buildVisualRecipeId({
    schemaVersion: VISUAL_RECIPE_SCHEMA_VERSION,
    openingId: input.openingId,
    lineId: input.lineId,
    conceptId: input.conceptId,
    moveUci: input.moveUci,
    mode: "noop",
    fen: input.fen,
  });
  const debug = emptyDebug({
    frameId: input.frameId,
    fen: input.fen,
    conceptId: input.conceptId,
    trainingContext: input.trainingContext,
    suppressedReason: input.suppressedReason,
  });
  const recipe: VisualRecipe = {
    recipeSchemaVersion: VISUAL_RECIPE_SCHEMA_VERSION,
    id: visualRecipeId,
    visualRecipeId,
    patternId,
    mode: "noop",
    conceptId: input.conceptId ?? "context_only",
    frameId: input.frameId,
    fen: input.fen,
    moveUci: input.moveUci,
    moveSan: input.moveSan,
    beats: [],
    endState: {
      persistPrimitives: [],
      clearOn: ["phase_change", "fen_change", "view_mode_change", "user_move_submitted", "opponent_selecting", "opponent_animating"],
    },
    permissions: {
      canShowAnswerMove: false,
      canShowContext: false,
      canShowPressure: false,
      canShowTargets: false,
      canShowGhosts: false,
      canShowTacticalAssist: false,
      canPersistEndState: false,
      revealRequired: false,
      allowedViewModes: ["assisted", "plain"],
    },
    learningAnchor: {
      patternId,
      conceptId: input.conceptId ?? "context_only",
      openingId: input.openingId,
      lineId: input.lineId,
      fen: input.fen,
      moveUci: input.moveUci,
      moveSan: input.moveSan,
      keySquares: [],
      keyPieces: [],
      reviewPromptKind: "context_only",
    },
    debug,
  };
  recipe.debug = { ...debug, schemaSerializable: recipeSerializable(recipe) };
  return recipe;
}

type BeatDraft = {
  order: number;
  durationMs: number;
  delayMs?: number;
  tag: string;
  narrationKey?: string;
  primitives: VisualPrimitive[];
};

function teachingPrimitiveBase(family: VisualEffectFamily, emphasis: "primary" | "supporting" | "status", purpose?: string): Pick<VisualPrimitive, "id" | "lane" | "effectFamily" | "priority" | "emphasis" | "opacityPolicy" | "purpose"> {
  return {
    id: "",
    lane: "persistent_teaching",
    effectFamily: family,
    priority: 5,
    emphasis,
    opacityPolicy: DEFAULT_VISUAL_OPACITY_POLICY,
    purpose,
  };
}

function addMoveArrow(draft: BeatDraft, from: string, to: string, emphasis: "primary" | "supporting", purpose: string): void {
  if (!validSquare(from) || !validSquare(to)) return;
  draft.primitives.push({
    ...teachingPrimitiveBase("teaching_move", emphasis, purpose),
    type: "move_arrow",
    from,
    to,
  });
}

function addPressureLine(draft: BeatDraft, from: string, to: string, purpose = "diagonal_pressure"): void {
  if (!validSquare(from) || !validSquare(to)) return;
  draft.primitives.push({
    ...teachingPrimitiveBase("pressure", "supporting", purpose),
    type: "pressure_line",
    from,
    to,
  });
}

function addTargetRing(draft: BeatDraft, square?: string, emphasis: "primary" | "supporting" = "supporting", purpose = "target"): void {
  if (!validSquare(square)) return;
  draft.primitives.push({
    ...teachingPrimitiveBase("target", emphasis, purpose),
    type: "target_ring",
    square,
  });
}

function addSquareHighlight(
  draft: BeatDraft,
  square?: string,
  role: "center" | "future_break" | "safe" | "support" | "context" | "danger" = "context",
  emphasis: "primary" | "supporting" = "supporting",
  purpose = "context",
): void {
  if (!validSquare(square)) return;
  const family: VisualEffectFamily = role === "safe" ? "king_safety" : role === "center" || role === "future_break" ? "center" : "target";
  draft.primitives.push({
    ...teachingPrimitiveBase(family, emphasis, purpose),
    type: "square_highlight",
    square,
    role,
  });
}

function addKingSafetyAura(draft: BeatDraft, square?: string): void {
  if (!validSquare(square)) return;
  draft.primitives.push({
    ...teachingPrimitiveBase("king_safety", "supporting", "king_safety"),
    type: "king_safety_aura",
    square,
  });
}

function conceptMatches(conceptId: string | undefined, options: string[]): boolean {
  const value = (conceptId ?? "").toLowerCase();
  return options.some((opt) => value === opt || value.includes(opt));
}

function compileBeats(input: {
  mode: VisualRecipeMode;
  conceptId: string;
  moveUci?: string;
  trainingContext?: TrainingContextResult | null;
}): BeatDraft[] {
  const beats: BeatDraft[] = [];
  const from = input.moveUci?.slice(0, 2);
  const to = input.moveUci?.slice(2, 4);

  if (input.mode === "noop") return beats;

  if (input.mode === "assisted_context") {
    const storySquares = input.trainingContext?.selectedStory?.visualIntent.squares?.map((item) => item.square) ?? [];
    const groundedCenters = storySquares.filter((square) => CENTER_SQUARES.includes(square));
    const selectedSquares = groundedCenters.length ? groundedCenters : storySquares.slice(0, 4);
    if (!selectedSquares.length) return beats;
    const beat: BeatDraft = {
      order: 1,
      durationMs: 820,
      tag: "assisted_context",
      narrationKey: "context_only",
      primitives: [],
    };
    selectedSquares.forEach((square, index) => {
      addSquareHighlight(beat, square, CENTER_SQUARES.includes(square) ? "center" : "context", index === 0 ? "primary" : "supporting", "context");
    });
    beats.push(beat);
    return beats;
  }

  if (!validSquare(from) || !validSquare(to)) return beats;

  const lowerMove = `${from}${to}`;
  const concept = input.conceptId;
  const safeCenterSquares =
    input.trainingContext?.selectedStory?.visualIntent?.squares
      ?.map((item) => item.square)
      .filter((square) => CENTER_SQUARES.includes(square)) ?? [];

  if (lowerMove === "f1c4" && conceptMatches(concept, ["develop", "pressure", "development_with_pressure", "develops_with_pressure"])) {
    const beat1: BeatDraft = { order: 1, durationMs: 900, tag: "bc4_answer", narrationKey: "find_move", primitives: [] };
    addMoveArrow(beat1, "f1", "c4", "primary", "answer_move");
    const beat2: BeatDraft = { order: 2, durationMs: 780, delayMs: 120, tag: "bc4_pressure", narrationKey: "pressure", primitives: [] };
    addPressureLine(beat2, "c4", "f7", "diagonal_pressure");
    addTargetRing(beat2, "f7", "supporting", "pressure_target");
    beats.push(beat1, beat2);
    return beats;
  }

  if ((lowerMove === "e1g1" || lowerMove === "e8g8" || lowerMove === "e1c1" || lowerMove === "e8c8") && conceptMatches(concept, ["castle_for_safety", "king_safety"])) {
    const beat1: BeatDraft = { order: 1, durationMs: 860, tag: "castle_move", narrationKey: "find_move", primitives: [] };
    addMoveArrow(beat1, from, to, "primary", "answer_move");
    const beat2: BeatDraft = { order: 2, durationMs: 720, delayMs: 100, tag: "castle_safety", narrationKey: "king_safety", primitives: [] };
    addKingSafetyAura(beat2, to);
    addSquareHighlight(beat2, to, "safe", "supporting", "safe_king_square");
    beats.push(beat1, beat2);
    return beats;
  }

  if (lowerMove === "c2c3" && conceptMatches(concept, ["prepare_center_break", "center_tension", "pawn_break", "center"])) {
    const beat1: BeatDraft = { order: 1, durationMs: 860, tag: "c3_answer", narrationKey: "find_move", primitives: [] };
    addMoveArrow(beat1, "c2", "c3", "primary", "answer_move");
    const beat2: BeatDraft = { order: 2, durationMs: 760, delayMs: 120, tag: "c3_center", narrationKey: "center_break", primitives: [] };
    addSquareHighlight(beat2, "d4", "future_break", "supporting", "future_break");
    addTargetRing(beat2, "d4", "supporting", "future_break_target");
    beats.push(beat1, beat2);
    return beats;
  }

  if (lowerMove === "f1e1") {
    const beat1: BeatDraft = { order: 1, durationMs: 860, tag: "re1_answer", narrationKey: "find_move", primitives: [] };
    addMoveArrow(beat1, "f1", "e1", "primary", "answer_move");
    const beat2: BeatDraft = { order: 2, durationMs: 720, delayMs: 120, tag: "re1_context", narrationKey: "context", primitives: [] };
    const grounded = safeCenterSquares[0];
    if (grounded) addSquareHighlight(beat2, grounded, "center", "supporting", "grounded_center_context");
    beats.push(beat1);
    if (beat2.primitives.length) beats.push(beat2);
    return beats;
  }

  const beat: BeatDraft = { order: 1, durationMs: 820, tag: "generic_move", narrationKey: "find_move", primitives: [] };
  if (input.mode === "move_teaching" || input.mode === "reveal_answer") addMoveArrow(beat, from, to, "primary", "answer_move");
  if (safeCenterSquares.length) addSquareHighlight(beat, safeCenterSquares[0], "center", "supporting", "grounded_context");
  if (beat.primitives.length) beats.push(beat);
  return beats;
}

function flattenBeats(beats: BeatDraft[]): Array<{ beatOrder: number; primitive: VisualPrimitive }> {
  return beats.flatMap((beat) => beat.primitives.map((primitive) => ({ beatOrder: beat.order, primitive })));
}

export function compileVisualRecipe(input: VisualRecipeCompileInput): VisualRecipe {
  const fen = normalizeFen(input.fen);
  const conceptId = input.trainingContext?.cue?.conceptId ?? "context_only";
  const move = expectedMove(input);

  if (input.viewMode === "plain") {
    return createNoopRecipe({
      fen,
      frameId: input.frameId,
      openingId: input.openingId,
      lineId: input.lineId,
      conceptId,
      moveUci: move.uci,
      moveSan: move.san,
      suppressedReason: "plain_view",
      trainingContext: input.trainingContext,
    });
  }

  const permissionDecision = deriveVisualRecipePermissions({
    trainingContext: input.trainingContext,
    viewMode: input.viewMode,
    revealState: input.revealState,
    lifecycleGatePassed: input.trainerPhase === undefined ? true : input.trainerPhase === "ready_for_user",
  });

  if (permissionDecision.mode === "noop" || hasSevereSuppression(input.trainingContext)) {
    return createNoopRecipe({
      fen,
      frameId: input.frameId,
      openingId: input.openingId,
      lineId: input.lineId,
      conceptId,
      moveUci: move.uci,
      moveSan: move.san,
      suppressedReason: permissionDecision.suppressedReason ?? "suppressed_untrusted_or_no_context",
      trainingContext: input.trainingContext,
    });
  }

  const patternId = buildPatternId({
    openingId: input.openingId,
    lineId: input.lineId,
    conceptId,
    moveUci: move.uci,
    fen,
  });
  const visualRecipeId = buildVisualRecipeId({
    schemaVersion: VISUAL_RECIPE_SCHEMA_VERSION,
    openingId: input.openingId,
    lineId: input.lineId,
    conceptId,
    moveUci: move.uci,
    mode: permissionDecision.mode,
    fen,
  });

  const beatsDraft = compileBeats({
    mode: permissionDecision.mode,
    conceptId,
    moveUci: move.uci,
    trainingContext: input.trainingContext,
  });

  const flattened = flattenBeats(beatsDraft).map(({ beatOrder, primitive }) => ({
    beatOrder,
    primitive: {
      ...primitive,
      id: buildVisualPrimitiveId({
        visualRecipeId,
        beatOrder,
        type: primitive.type,
        from: "from" in primitive ? primitive.from : undefined,
        to: "to" in primitive ? primitive.to : undefined,
        square:
          "square" in primitive
            ? primitive.square
            : "hubSquare" in primitive
              ? primitive.hubSquare
              : "kingSquare" in primitive
                ? primitive.kingSquare
                : undefined,
        purpose: primitive.purpose,
      }),
    },
  }));

  const priorityPolicy = applyVisualPriorityPolicy(flattened.map((item) => item.primitive));
  const budget = { ...DEFAULT_VISUAL_RECIPE_BUDGET, ...(input.visualBudgetOverride ?? {}) };
  const budgeted = enforceVisualRecipeBudget(priorityPolicy.kept, budget);
  const keepSet = new Set(budgeted.kept.map((item) => item.id));

  const beats: VisualBeat[] = beatsDraft
    .map((beat) => {
      const primitives = flattened
        .filter((item) => item.beatOrder === beat.order && keepSet.has(item.primitive.id))
        .map((item) => item.primitive);
      const lane: VisualLane = primitives[0]?.lane ?? "persistent_teaching";
      return {
        id: buildVisualBeatId(visualRecipeId, beat.order, beat.tag),
        order: beat.order,
        durationMs: beat.durationMs,
        delayMs: beat.delayMs,
        narrationKey: beat.narrationKey,
        timingProfile: timingForLane(lane),
        primitives,
      };
    })
    .filter((beat) => beat.primitives.length > 0)
    .sort((a, b) => a.order - b.order);

  const keySquares = Array.from(
    new Set(
      beats
        .flatMap((beat) => beat.primitives)
        .flatMap((primitive) => {
          if (primitive.type === "move_arrow" || primitive.type === "pressure_line") return [primitive.from, primitive.to];
          if ("square" in primitive) return [primitive.square];
          if ("hubSquare" in primitive) return [primitive.hubSquare, ...primitive.targetSquares];
          if ("kingSquare" in primitive) return [primitive.kingSquare, ...primitive.deniedSquares];
          if ("attackerSquare" in primitive) return [primitive.attackerSquare, primitive.primaryTargetSquare, primitive.behindTargetSquare ?? ""];
          return [];
        })
        .filter((square): square is string => validSquare(square)),
    ),
  );

  const firstTarget = beats
    .flatMap((beat) => beat.primitives)
    .find((primitive) => primitive.type === "target_ring" && validSquare((primitive as { square?: string }).square));
  const primaryTargetSquare = (firstTarget && "square" in firstTarget ? firstTarget.square : undefined) ?? keySquares.find((square) => CENTER_SQUARES.includes(square));

  const reviewPromptKind =
    permissionDecision.mode === "assisted_context"
      ? "context_only"
      : permissionDecision.mode === "reveal_answer"
        ? "assisted_replay"
        : "find_move";

  const suppressedReason = beats.length ? undefined : permissionDecision.suppressedReason ?? "recipe_empty_after_budget";
  const suppressedByPriority = priorityPolicy.suppressed.map((item) => `${item.id}:${item.reason}`);
  const suppressedByBudget = budgeted.suppressed.map((item) => `${item.id}:${item.reason}`);
  const allSuppressed = [...suppressedByPriority, ...suppressedByBudget];
  const primitives = beats.flatMap((beat) => beat.primitives);
  const lanes = Array.from(new Set(primitives.map((primitive) => primitive.lane)));
  const families = Array.from(new Set(primitives.map((primitive) => primitive.effectFamily)));
  const tacticalPrimitivesPresent = primitives.some((primitive) => primitive.lane !== "persistent_teaching");

  const debug: VisualRecipeDebug = {
    recipeFrameId: input.frameId,
    recipeFen: fen,
    sourceMode: input.trainingContext?.mode ?? "none",
    sourceConceptId: conceptId,
    sourceMoveTrust: permissionDecision.sourceMoveTrust,
    sourceContextTrust: permissionDecision.sourceContextTrust,
    primitiveCount: primitives.length,
    suppressedPrimitives: allSuppressed,
    recipeSuppressedReason: suppressedReason,
    permissionSummary: JSON.stringify(permissionDecision.permissions),
    recipeLanes: lanes,
    recipeEffectFamilies: families,
    recipePrioritySummary: primitives.map((primitive) => `${primitive.type}:${primitive.priority}`).join(",") || "none",
    recipeTimingProfile: timingForLane(primitives[0]?.lane ?? "persistent_teaching"),
    recipeOpacityPolicy: DEFAULT_VISUAL_OPACITY_POLICY,
    suppressedByPriority,
    suppressedByBudget,
    tacticalPrimitivesPresent,
    tacticalPrimitivesRendered: false,
    schemaSerializable: true,
  };

  const recipe: VisualRecipe = {
    recipeSchemaVersion: VISUAL_RECIPE_SCHEMA_VERSION,
    id: visualRecipeId,
    visualRecipeId,
    patternId,
    mode: permissionDecision.mode,
    conceptId,
    frameId: input.frameId,
    fen,
    moveUci: move.uci,
    moveSan: move.san,
    beats,
    endState: {
      persistPrimitives: permissionDecision.permissions.canPersistEndState ? beats.flatMap((beat) => beat.primitives.map((primitive) => primitive.id)) : [],
      clearOn: ["phase_change", "fen_change", "view_mode_change", "user_move_submitted", "opponent_selecting", "opponent_animating"],
    },
    permissions: permissionDecision.permissions,
    learningAnchor: {
      patternId,
      conceptId,
      openingId: input.openingId,
      lineId: input.lineId,
      fen,
      moveUci: move.uci,
      moveSan: move.san,
      keySquares,
      keyPieces: conceptMatches(conceptId, ["castle", "king"]) ? ["king"] : [],
      primaryTargetSquare,
      reviewPromptKind,
      explanationKey: conceptId,
    },
    debug,
  };

  recipe.debug = {
    ...debug,
    schemaSerializable: recipeSerializable(recipe),
  };

  return recipe;
}
