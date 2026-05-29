import type { TeachingCue } from "./teachingCueTypes";
import type { TeachingPermission } from "./teachingPermissions";
import type { TeachingStoryCandidate } from "./storyTypes";

export type VisualRevealLevel = "answer" | "context" | "plan";
export type VisualEmphasis = "subtle" | "normal" | "strong";
export type VisualConceptCategory =
  | "answer_move"
  | "piece_activity"
  | "active_square"
  | "center"
  | "loose_piece"
  | "king_safety"
  | "open_file"
  | "weak_square"
  | "endgame_activity"
  | "minimal";

export type TeachingVisualOverlayDecision = {
  visualLines: Array<{ from: string; to: string; kind: "plan" | "attack" | "defense" | "opponent"; label?: string }>;
  visualSquares: Array<{ square: string; kind: "target" | "support" | "danger" | "origin" | "opponent"; role?: string }>;
  answerVisualsShown: boolean;
  contextVisualsShown: boolean;
  planVisualsShown: boolean;
  suppressedReasons: string[];
  visualBudgetUsed: { primaryIdea: number; supportingHighlights: number; lines: number };
  selectedVisualStory?: string;
  revealLevel: VisualRevealLevel;
  emphasis: VisualEmphasis;
  visualConceptAlignment?: "aligned" | "visual_concept_mismatch" | "minimal";
};

export function routeTeachingVisuals(input: {
  cue: TeachingCue;
  permission: TeachingPermission;
  selectedStory: TeachingStoryCandidate | null;
  trainerView: "assisted" | "plain";
  showAnswer: boolean;
}): TeachingVisualOverlayDecision {
  const suppressedReasons: string[] = [];
  const expectedCategory: VisualConceptCategory =
    input.cue.conceptId.includes("loose") ? "loose_piece" :
    input.cue.conceptId.includes("center") ? "center" :
    input.cue.conceptId.includes("king") ? "king_safety" :
    input.cue.conceptId.includes("file") || input.cue.conceptId.includes("rook") ? "open_file" :
    input.cue.conceptId.includes("weak") || input.cue.conceptId.includes("outpost") ? "weak_square" :
    input.cue.conceptId.includes("development") || input.cue.conceptId.includes("piece") || input.cue.conceptId.includes("activity") ? "piece_activity" :
    "minimal";
  if (input.trainerView === "plain" && !input.showAnswer) {
    return {
      visualLines: [],
      visualSquares: [],
      answerVisualsShown: false,
      contextVisualsShown: false,
      planVisualsShown: false,
      suppressedReasons: ["plain_view_no_hints"],
      visualBudgetUsed: { primaryIdea: 0, supportingHighlights: 0, lines: 0 },
      selectedVisualStory: input.selectedStory?.id,
      revealLevel: "context",
      emphasis: "subtle",
      visualConceptAlignment: "minimal",
    };
  }

  const canAnswer = input.permission.canShowAnswerOverlays;
  const canContext = input.permission.canShowContextOverlays;
  const canPlan = input.permission.canShowPlanIndicators;

  const revealLevel: VisualRevealLevel = canAnswer ? "answer" : canContext ? "context" : "plan";
  const emphasis: VisualEmphasis = canAnswer ? "strong" : canContext ? "normal" : "subtle";

  let lines: Array<{ from: string; to: string; kind: "plan" | "attack" | "defense" | "opponent"; label?: string }> = input.cue.visual.relationshipLines
    .map((line) => ({ from: line.from, to: line.to, kind: (line.kind === "defense" ? "defense" : "attack") as "defense" | "attack", label: undefined }))
    .slice(0, canAnswer ? 1 : 0);

  if (canAnswer && input.cue.visual.primaryArrow && input.permission.canShowMoveArrow) {
    lines = [{ from: input.cue.visual.primaryArrow.from, to: input.cue.visual.primaryArrow.to, kind: "plan" as const, label: undefined }, ...lines].slice(0, 2);
  } else if (!canAnswer && input.cue.visual.primaryArrow) {
    suppressedReasons.push("answer_arrow_blocked");
  }

  if (!canContext && !canAnswer) {
    suppressedReasons.push("context_overlays_blocked");
    return {
      visualLines: [],
      visualSquares: [],
      answerVisualsShown: false,
      contextVisualsShown: false,
      planVisualsShown: false,
      suppressedReasons,
      visualBudgetUsed: { primaryIdea: 0, supportingHighlights: 0, lines: 0 },
      selectedVisualStory: input.selectedStory?.id,
      revealLevel,
      emphasis,
      visualConceptAlignment: "minimal",
    };
  }

  const squares: Array<{ square: string; kind: "origin" | "target" | "support" | "danger" | "opponent"; role?: string }> = [
    ...input.cue.visual.keySquares.map((sq) => ({ square: sq.square, kind: (sq.kind === "support" ? "support" : sq.kind === "danger" ? "danger" : "target") as "support" | "danger" | "target", role: sq.kind })),
    ...input.cue.visual.dangerSquares.map((sq) => ({ square: sq.square, kind: "danger" as const, role: sq.kind })),
  ].slice(0, 3);

  const alignment = expectedCategory === "minimal" || squares.length || lines.length ? "aligned" : "visual_concept_mismatch";
  if (alignment === "visual_concept_mismatch") suppressedReasons.push("visual_concept_mismatch");

  return {
    visualLines: lines,
    visualSquares: squares,
    answerVisualsShown: canAnswer,
    contextVisualsShown: canContext,
    planVisualsShown: canPlan,
    suppressedReasons,
    visualBudgetUsed: { primaryIdea: input.cue.visual.primaryArrow ? 1 : 0, supportingHighlights: squares.length, lines: lines.length },
    selectedVisualStory: input.selectedStory?.id,
    revealLevel,
    emphasis,
    visualConceptAlignment: alignment,
  };
}
