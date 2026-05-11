/**
 * BlundrOneNet v0 Context Templates
 *
 * This module provides safe, template-based coaching text.
 * No free-form model generation. All context is bounded to known templates.
 */

import type { BlundrConcept } from "./concepts";
import type { BlundrContext } from "./types";

type ContextTemplateId = BlundrConcept | "generic_stockfish_best_move";

export const CONTEXT_TEMPLATES: Record<ContextTemplateId, BlundrContext> = {
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

  development_with_f7_pressure: {
    headline: "Develop with pressure on f7",
    mainExplanation:
      "This develops a piece to an active square while adding pressure toward f7.",
    visualExplanation:
      "The key visual is the line from your piece toward the target square.",
    planExplanation:
      "Keep developing and prepare to castle before opening the center.",
    nextPlan: "Castle next, then prepare your central plan.",
  },

  development_with_f2_pressure: {
    headline: "Develop with pressure on f2",
    mainExplanation:
      "This develops a piece to an active square while adding pressure toward f2.",
    visualExplanation:
      "The key visual is the line from your piece toward the target square.",
    planExplanation:
      "Keep developing and prepare to castle before opening the center.",
    nextPlan: "Castle next, then prepare your central plan.",
  },

  knight_center_pressure: {
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

  occupy_center: {
    headline: "Occupy the center",
    mainExplanation:
      "This move claims central space and gives your pieces more room to work.",
    visualExplanation:
      "The highlighted center squares show the space your move controls.",
    planExplanation: "Use the extra space to finish development smoothly.",
    nextPlan: "Support the center and get your king safe.",
  },

  defend_center: {
    headline: "Defend the center",
    mainExplanation:
      "This move reinforces your central control and makes your position harder to challenge.",
    visualExplanation:
      "The highlighted squares show the center points being protected.",
    planExplanation:
      "Keep your center stable while improving your least active piece.",
    nextPlan: "Develop, castle, and be ready for a central break.",
  },

  pin_pressure: {
    headline: "Build pin pressure",
    mainExplanation:
      "This move increases pressure along a line where a piece is pinned.",
    visualExplanation:
      "The highlighted line shows the pressure running through the pinned piece.",
    planExplanation:
      "Add support before converting the pressure into a concrete gain.",
    nextPlan: "Develop another piece and keep the pinned target under pressure.",
  },

  open_file_pressure: {
    headline: "Use the open file",
    mainExplanation:
      "This move increases activity along a file where your pieces can apply pressure.",
    visualExplanation:
      "The highlighted file shows the path where your piece activity matters.",
    planExplanation:
      "Coordinate your heavy pieces before looking for a breakthrough.",
    nextPlan: "Improve your rook or queen activity on the open file.",
  },

  queen_activity_warning: {
    headline: "Watch queen activity",
    mainExplanation:
      "This position has queen activity that can become dangerous if ignored.",
    visualExplanation:
      "The highlighted path shows where the queen can create pressure.",
    planExplanation:
      "Develop calmly and avoid weakening squares near your king.",
    nextPlan: "Answer the threat while improving your position.",
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
    CONTEXT_TEMPLATES[templateId as ContextTemplateId] ??
    CONTEXT_TEMPLATES.generic_stockfish_best_move
  );
}
