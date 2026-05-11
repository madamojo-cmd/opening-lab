/**
 * BlundrOneNet v0 Context Templates
 *
 * This module provides safe, template-based coaching text.
 * No free-form model generation. All context is bounded to known templates.
 */

import type { BlundrContext } from "./types";

export const CONTEXT_TEMPLATES: Record<string, BlundrContext> = {
  quiet_development: {
    headline: "Develop your piece",
    mainExplanation:
      "This move improves your position by bringing a piece into the game.",
    visualExplanation:
      "The highlighted path shows the piece leaving its starting square and moving to an active square.",
    planExplanation:
      "Keep developing and prepare to castle before opening the center.",
    nextPlan: "Develop another piece and get your king safe.",
  },

  develop_with_pressure: {
    headline: "Develop with pressure",
    mainExplanation:
      "This develops a piece to an active square while creating pressure.",
    visualExplanation:
      "The key visual is the line from your piece toward the target square.",
    planExplanation:
      "Keep developing and prepare to castle before opening the center.",
    nextPlan: "Castle next, then prepare your central plan.",
  },

  knight_pressure_center: {
    headline: "Develop and pressure the center",
    mainExplanation:
      "This knight move develops a piece and adds pressure to the center.",
    visualExplanation:
      "The highlighted squares show the knight's influence near the center.",
    planExplanation:
      "Protect your center and continue developing your minor pieces.",
    nextPlan: "Develop the next piece and get your king safe.",
  },

  castle_for_safety: {
    headline: "Get your king safe",
    mainExplanation:
      "Castling improves king safety and helps connect your rooks.",
    visualExplanation:
      "The safety highlight shows where your king is moving and why that area becomes safer.",
    planExplanation:
      "After castling, you can shift attention to the center or a pawn break.",
    nextPlan: "Finish development and prepare your central plan.",
  },

  prepare_center_break: {
    headline: "Prepare the center break",
    mainExplanation: "This move supports a future central pawn push.",
    visualExplanation:
      "The highlighted center squares show where the position may open next.",
    planExplanation: "Do not rush the break until your pieces are ready.",
    nextPlan: "Complete development, then challenge the center.",
  },

  continuation_plan: {
    headline: "Follow your plan",
    mainExplanation:
      "This move aligns with the continuation strategy in your opening.",
    visualExplanation: "The highlighted move is part of your prepared plan.",
    planExplanation:
      "Use this continuation to maintain your advantage in this line.",
    nextPlan: "Look ahead and prepare your next move.",
  },

  generic_stockfish_best_move: {
    headline: "Best continuation",
    mainExplanation:
      "This is the engine-backed recommendation for the current position.",
    visualExplanation:
      "The highlighted move shows the recommended path from source to destination.",
    planExplanation:
      "Use this move to keep the position stable and continue developing your plan.",
    nextPlan:
      "Look for the opponent's most common response and continue from there.",
  },
};

/**
 * Retrieve a context template by ID.
 * Falls back to generic_stockfish_best_move if the template ID is not found.
 */
export function renderContextTemplate(templateId: string): BlundrContext {
  return (
    CONTEXT_TEMPLATES[templateId] ??
    CONTEXT_TEMPLATES.generic_stockfish_best_move
  );
}
