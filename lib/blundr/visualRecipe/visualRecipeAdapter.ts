import {
  normalizeFenForVisualFrame,
  shouldIgnoreStaleOverlay,
  shouldRenderAssistedContextOverlay,
  shouldRenderMoveTeachingOverlay,
  visualFrameMatches,
} from "../teaching/overlayLifecycle";
import type { VisualPrimitive, VisualRecipe } from "./visualRecipeTypes";

export type VisualRecipeAdapterLine = {
  from: string;
  to: string;
  kind: "attack" | "defense" | "plan" | "opponent";
  label?: string;
};

export type VisualRecipeAdapterSquare = {
  square: string;
  kind: "origin" | "target" | "support" | "danger" | "opponent";
  role?: string;
};

export type VisualRecipeAdapterInput = {
  recipe?: VisualRecipe | null;
  phase: "ready_for_user" | "opponent_selecting" | "opponent_replying" | "opponent_animating" | "transitioning" | "line_complete" | "continuation_ready" | "terminal" | "error";
  userToMove: boolean;
  viewMode: "assisted" | "plain";
  boardFen: string;
  trainerFrameId: number;
  overlayFrameId: number;
  opponentCandidateRenderedInMainUi?: boolean;
};

export type VisualRecipeAdapterResult = {
  allowed: boolean;
  adapterAllowed: boolean;
  suppressedReason?: string;
  adapterSuppressedReason?: string;
  lines: VisualRecipeAdapterLine[];
  squares: VisualRecipeAdapterSquare[];
  staleOverlayIgnored: boolean;
  overlayFrameId: number;
  overlayFen?: string;
  overlaySource: "visual_recipe" | "suppressed";
  opponentCandidateRenderedInMainUi: false;
  tacticalPrimitivesPresent: boolean;
  tacticalPrimitivesRendered: boolean;
  recipeFenRaw?: string;
  boardFenRaw: string;
  recipeFenNormalized?: string;
  boardFenNormalized?: string;
  recipeFrameIdRaw?: number | string;
  boardFrameIdRaw: number | string;
  recipeFrameMatchesBoard: boolean;
  recipeFenMatchesBoard: boolean;
};

function asLine(primitive: VisualPrimitive): VisualRecipeAdapterLine | null {
  if (primitive.type === "move_arrow") return { from: primitive.from, to: primitive.to, kind: "plan", label: primitive.purpose };
  if (primitive.type === "pressure_line") return { from: primitive.from, to: primitive.to, kind: "attack", label: primitive.purpose };
  return null;
}

function asSquare(primitive: VisualPrimitive): VisualRecipeAdapterSquare | null {
  if (primitive.type === "target_ring") return { square: primitive.square, kind: "target", role: primitive.purpose ?? "target" };
  if (primitive.type === "square_highlight") {
    const role = primitive.role ?? "context";
    if (role === "danger") return { square: primitive.square, kind: "danger", role };
    if (role === "safe" || role === "support") return { square: primitive.square, kind: "support", role };
    return { square: primitive.square, kind: "target", role };
  }
  if (primitive.type === "ghost_piece") return { square: primitive.square, kind: "support", role: "ghost" };
  if (primitive.type === "king_safety_aura") return { square: primitive.square, kind: "support", role: "king_safety" };
  return null;
}

function tacticalPrimitive(primitive: VisualPrimitive): boolean {
  return primitive.lane === "transient_tactical_effect" || primitive.lane === "persistent_tactical_status";
}

export function adaptVisualRecipe(input: VisualRecipeAdapterInput): VisualRecipeAdapterResult {
  const recipe = input.recipe;
  const boardFenRaw = input.boardFen;
  const recipeFenRaw = recipe?.fen;
  const boardFen = normalizeFenForVisualFrame(boardFenRaw);
  const overlayFen = normalizeFenForVisualFrame(recipeFenRaw);
  const recipeFrameIdRaw = recipe?.frameId;
  const boardFrameIdRaw = input.trainerFrameId;
  const recipeFrameMatchesBoard = visualFrameMatches(recipeFrameIdRaw, boardFrameIdRaw);
  const recipeFenMatchesBoard = Boolean(overlayFen && boardFen && overlayFen === boardFen);

  if (!recipe || recipe.mode === "noop") {
    return {
      allowed: false,
      adapterAllowed: false,
      suppressedReason: recipe?.debug?.recipeSuppressedReason ?? "no_recipe",
      adapterSuppressedReason: recipe?.debug?.recipeSuppressedReason ?? "no_recipe",
      lines: [],
      squares: [],
      staleOverlayIgnored: false,
      overlayFrameId: input.overlayFrameId,
      overlayFen,
      overlaySource: "suppressed",
      opponentCandidateRenderedInMainUi: false,
      tacticalPrimitivesPresent: false,
      tacticalPrimitivesRendered: false,
      recipeFenRaw,
      boardFenRaw,
      recipeFenNormalized: overlayFen,
      boardFenNormalized: boardFen,
      recipeFrameIdRaw,
      boardFrameIdRaw,
      recipeFrameMatchesBoard: false,
      recipeFenMatchesBoard: false,
    };
  }

  const allPrimitives = recipe.beats.flatMap((beat) => beat.primitives);
  const tacticalPrimitivesPresent = allPrimitives.some(tacticalPrimitive);

  if (input.opponentCandidateRenderedInMainUi) {
    return {
      allowed: false,
      adapterAllowed: false,
      suppressedReason: "opponent_candidate_blocked",
      adapterSuppressedReason: "opponent_candidate_blocked",
      lines: [],
      squares: [],
      staleOverlayIgnored: false,
      overlayFrameId: input.overlayFrameId,
      overlayFen,
      overlaySource: "suppressed",
      opponentCandidateRenderedInMainUi: false,
      tacticalPrimitivesPresent,
      tacticalPrimitivesRendered: false,
      recipeFenRaw,
      boardFenRaw,
      recipeFenNormalized: overlayFen,
      boardFenNormalized: boardFen,
      recipeFrameIdRaw,
      boardFrameIdRaw,
      recipeFrameMatchesBoard,
      recipeFenMatchesBoard,
    };
  }

  if (!recipeFrameMatchesBoard || !recipeFenMatchesBoard || !overlayFen || !boardFen) {
    return {
      allowed: false,
      adapterAllowed: false,
      suppressedReason: "stale_frame_or_fen_mismatch",
      adapterSuppressedReason: "stale_frame_or_fen_mismatch",
      lines: [],
      squares: [],
      staleOverlayIgnored: true,
      overlayFrameId: input.overlayFrameId,
      overlayFen,
      overlaySource: "suppressed",
      opponentCandidateRenderedInMainUi: false,
      tacticalPrimitivesPresent,
      tacticalPrimitivesRendered: false,
      recipeFenRaw,
      boardFenRaw,
      recipeFenNormalized: overlayFen,
      boardFenNormalized: boardFen,
      recipeFrameIdRaw,
      boardFrameIdRaw,
      recipeFrameMatchesBoard,
      recipeFenMatchesBoard,
    };
  }

  const staleOverlayIgnored = shouldIgnoreStaleOverlay({
    trainerFrameId: input.trainerFrameId,
    overlayFrameId: recipe.frameId,
    overlayFen,
    boardFen: boardFenRaw,
  });

  if (staleOverlayIgnored) {
    return {
      allowed: false,
      adapterAllowed: false,
      suppressedReason: "stale_frame_or_fen_mismatch",
      adapterSuppressedReason: "stale_frame_or_fen_mismatch",
      lines: [],
      squares: [],
      staleOverlayIgnored: true,
      overlayFrameId: input.overlayFrameId,
      overlayFen,
      overlaySource: "suppressed",
      opponentCandidateRenderedInMainUi: false,
      tacticalPrimitivesPresent,
      tacticalPrimitivesRendered: false,
      recipeFenRaw,
      boardFenRaw,
      recipeFenNormalized: overlayFen,
      boardFenNormalized: boardFen,
      recipeFrameIdRaw,
      boardFrameIdRaw,
      recipeFrameMatchesBoard,
      recipeFenMatchesBoard,
    };
  }

  let allowed = false;
  if (recipe.mode === "move_teaching") {
    allowed = shouldRenderMoveTeachingOverlay({
      phase: input.phase,
      userToMove: input.userToMove,
      viewMode: input.viewMode,
      mode: "move_teaching",
      expectedUserMoveUci: recipe.moveUci,
      moveTrust: recipe.debug?.sourceMoveTrust,
      contextFen: overlayFen,
      boardFen: boardFenRaw,
    });
  } else if (recipe.mode === "reveal_answer") {
    allowed = input.phase === "ready_for_user" && input.userToMove && input.viewMode === "assisted" && Boolean(recipe.moveUci) && recipeFenMatchesBoard;
  } else if (recipe.mode === "assisted_context") {
    const hasAnswerArrow = recipe.beats.some((beat) => beat.primitives.some((primitive) => primitive.type === "move_arrow"));
    allowed = shouldRenderAssistedContextOverlay({
      phase: input.phase,
      viewMode: input.viewMode,
      mode: "assisted_context",
      contextTrust: recipe.debug?.sourceContextTrust,
      hasAnswerArrow,
    });
  }

  if (!allowed) {
    return {
      allowed: false,
      adapterAllowed: false,
      suppressedReason: "lifecycle_gate_blocked",
      adapterSuppressedReason: "lifecycle_gate_blocked",
      lines: [],
      squares: [],
      staleOverlayIgnored: false,
      overlayFrameId: input.overlayFrameId,
      overlayFen,
      overlaySource: "suppressed",
      opponentCandidateRenderedInMainUi: false,
      tacticalPrimitivesPresent,
      tacticalPrimitivesRendered: false,
      recipeFenRaw,
      boardFenRaw,
      recipeFenNormalized: overlayFen,
      boardFenNormalized: boardFen,
      recipeFrameIdRaw,
      boardFrameIdRaw,
      recipeFrameMatchesBoard,
      recipeFenMatchesBoard,
    };
  }

  if (input.viewMode === "plain") {
    return {
      allowed: false,
      adapterAllowed: false,
      suppressedReason: "plain_view",
      adapterSuppressedReason: "plain_view",
      lines: [],
      squares: [],
      staleOverlayIgnored: false,
      overlayFrameId: input.overlayFrameId,
      overlayFen,
      overlaySource: "suppressed",
      opponentCandidateRenderedInMainUi: false,
      tacticalPrimitivesPresent,
      tacticalPrimitivesRendered: false,
      recipeFenRaw,
      boardFenRaw,
      recipeFenNormalized: overlayFen,
      boardFenNormalized: boardFen,
      recipeFrameIdRaw,
      boardFrameIdRaw,
      recipeFrameMatchesBoard,
      recipeFenMatchesBoard,
    };
  }

  const teachingPrimitives = allPrimitives.filter((primitive) => primitive.lane === "persistent_teaching");
  const lines = teachingPrimitives.map(asLine).filter((line): line is VisualRecipeAdapterLine => Boolean(line));
  const squares = teachingPrimitives.map(asSquare).filter((square): square is VisualRecipeAdapterSquare => Boolean(square));

  return {
    allowed: true,
    adapterAllowed: true,
    lines,
    squares,
    staleOverlayIgnored: false,
    overlayFrameId: input.overlayFrameId,
    overlayFen,
    overlaySource: "visual_recipe",
    opponentCandidateRenderedInMainUi: false,
    tacticalPrimitivesPresent,
    tacticalPrimitivesRendered: false,
    recipeFenRaw,
    boardFenRaw,
    recipeFenNormalized: overlayFen,
    boardFenNormalized: boardFen,
    recipeFrameIdRaw,
    boardFrameIdRaw,
    recipeFrameMatchesBoard,
    recipeFenMatchesBoard,
  };
}
