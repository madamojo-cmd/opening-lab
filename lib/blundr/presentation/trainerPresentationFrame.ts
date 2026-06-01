// v2.7.40 Agent 5: brain for coach intelligence in chain (skeletal ok)
import type { BlundrBrainAnalysis } from "../brain/types";

export type TrainerVisualSource = "none" | "visual_recipe" | "continuation_candidate" | "guided_target_fallback" | "legacy";
export type TrainerVisualOwner = "none" | "visual_recipe" | "instruction_target" | "legacy";
export type TrainerCoachOwner = "none" | "coach_decision" | "branch_transition_surface" | "brain_skeleton";

type Line = { from: string; to: string; kind?: string; label?: string };
type TrainerVisualFrame = {
  owner: TrainerVisualOwner;
  source: TrainerVisualSource;
  shouldRender: boolean;
  lines: Line[];
  blockedReason: string;
  visualRecipeId: string | null;
  activePrimitiveIds: string[];
  overlayFrameId: number | string | null;
};
type TrainerCoachFrame = {
  owner: TrainerCoachOwner;
  shouldRender: boolean;
  title: string | null;
  body: string | null;
  buttons: string[];
  suppressedReason: string | null;
  intent: string | null;
  utteranceFamily: string | null;
  templateId: string | null;
  selectedTheme?: string | null;
  coachQuality?: unknown;
  moveFactPacket?: unknown;
  positionDeltaPacket?: unknown;
  featurePacket?: unknown;
  planPacket?: unknown;
  opportunityPacket?: unknown;
  safetyResult?: unknown;
};

type ComputeTrainerPresentationFrameInput = {
  frameId: number | string;
  fen: string;
  activeBoard: boolean;
  trainerView: "assisted" | "plain" | string;
  trainerPhase: string;
  trainingMode: "restricted" | "continuation" | string;
  isUserTurn: boolean;
  answerShown?: boolean;
  visualRecipeId?: string | null;
  visualRecipeLines?: Line[];
  continuationCandidateLines?: Line[];
  safeMoveArrowLines?: Line[];
  legacyLines?: Line[];
  activePrimitiveIds?: string[];
  recipeFrameMatchesBoard?: boolean;
  recipeFenMatchesBoard?: boolean;
  adapterAllowed?: boolean;
  overlayFrameId?: number | string;
  playbackReady?: boolean;
  coachShouldShow?: boolean;
  coachHiddenForFrame?: boolean;
  coachIntent?: string | null;
  coachTitle?: string | null;
  coachBody?: string | null;
  coachButtons?: string[] | readonly string[] | null;
  coachSuppressedReason?: string | null;
  coachUtteranceFamily?: string | null;
  coachTemplateId?: string | null;
  coachSelectedTheme?: string | null;
  coachQuality?: unknown;
  moveFactPacket?: unknown;
  positionDeltaPacket?: unknown;
  featurePacket?: unknown;
  planPacket?: unknown;
  opportunityPacket?: unknown;
  safetyResult?: unknown;
  branchTransitionSurface?: boolean;
  branchTransitionTitle?: string | null;
  branchTransitionBody?: string | null;
  branchTransitionButtons?: string[] | readonly string[] | null;
  coachSurfacePolicy?: unknown;
  // v2.7.40 Agent 5: pass brainAnalysis (from analyzeBlundrPosition) so coach copy derives from CurrentInstructionFrame.target via Brain -> PresentationFrame
  brainAnalysis?: BlundrBrainAnalysis | null;
};

function cleanLines(lines?: Line[] | null) {
  return (Array.isArray(lines) ? lines : []).filter((line) => /^[a-h][1-8]$/.test(String(line.from)) && /^[a-h][1-8]$/.test(String(line.to))).slice(0, 4);
}

export function computeTrainerPresentationFrame(input: ComputeTrainerPresentationFrameInput) {
  const canShowTeachingVisual = Boolean(
    input.activeBoard &&
    input.trainerPhase === "ready_for_user" &&
    input.isUserTurn &&
    input.trainerView === "assisted",
  );

  const recipeLines = cleanLines(input.visualRecipeLines);
  const continuationLines = cleanLines(input.continuationCandidateLines);
  const safeMoveLines = cleanLines(input.safeMoveArrowLines);
  const legacyLines = cleanLines(input.legacyLines);

  let visual: TrainerVisualFrame = {
    owner: "none",
    source: "none" as TrainerVisualSource,
    shouldRender: false,
    lines: [] as Line[],
    blockedReason: canShowTeachingVisual ? "no_authorized_visual_lines" : "visual_surface_not_allowed",
    visualRecipeId: input.visualRecipeId ?? null,
    activePrimitiveIds: input.activePrimitiveIds ?? [],
    overlayFrameId: input.overlayFrameId ?? null,
  };

  if (canShowTeachingVisual) {
    const recipeReady = Boolean(
      input.visualRecipeId &&
      recipeLines.length &&
      input.adapterAllowed &&
      input.recipeFrameMatchesBoard &&
      input.recipeFenMatchesBoard &&
      input.playbackReady,
    );

    if (recipeReady) {
      visual = { ...visual, owner: "visual_recipe", source: "visual_recipe", shouldRender: true, lines: recipeLines, blockedReason: "none" };
    } else if (input.trainingMode === "continuation" && continuationLines.length) {
      visual = { ...visual, owner: "instruction_target", source: "continuation_candidate", shouldRender: true, lines: continuationLines, blockedReason: "none" };
    } else if (safeMoveLines.length) {
      visual = { ...visual, owner: "instruction_target", source: "guided_target_fallback", shouldRender: true, lines: safeMoveLines, blockedReason: "none" };
    } else if (legacyLines.length) {
      visual = { ...visual, owner: "legacy", source: "legacy", shouldRender: true, lines: legacyLines, blockedReason: "none" };
    }
  }

  let coach: TrainerCoachFrame = {
    owner: "none",
    shouldRender: false,
    title: null as string | null,
    body: null as string | null,
    buttons: [] as string[],
    suppressedReason: input.coachSuppressedReason ?? null,
    intent: input.coachIntent ?? null,
    utteranceFamily: input.coachUtteranceFamily ?? null,
    templateId: input.coachTemplateId ?? null,
    selectedTheme: input.coachSelectedTheme ?? null,
    coachQuality: input.coachQuality ?? null,
    moveFactPacket: input.moveFactPacket ?? null,
    positionDeltaPacket: input.positionDeltaPacket ?? null,
    featurePacket: input.featurePacket ?? null,
    planPacket: input.planPacket ?? null,
    opportunityPacket: input.opportunityPacket ?? null,
    safetyResult: input.safetyResult ?? null,
  };

  if (input.coachShouldShow && !input.coachHiddenForFrame) {
    coach = {
      ...coach,
      owner: "coach_decision",
      shouldRender: true,
      title: input.coachTitle ?? null,
      body: input.coachBody ?? null,
      buttons: [...(input.coachButtons ?? [])],
      suppressedReason: null,
    };
  } else if (input.branchTransitionSurface) {
    coach = {
      ...coach,
      owner: "branch_transition_surface",
      shouldRender: true,
      title: input.branchTransitionTitle ?? "Continue from here",
      body: input.branchTransitionBody ?? "This branch is beyond the guided line. Continue from here to practice adapting.",
      buttons: [...(input.branchTransitionButtons ?? ["continue_from_here"])],
      suppressedReason: null,
    };
  }

  // v2.7.40 Agent 5: Brain provides the coach copy content for the canonical chain
  // CurrentInstructionFrame.target -> BlundrBrainAnalysis.safeFallbackCopy (piece-matched, evidence-backed, no halluc) -> TrainerPresentationFrame -> VisibleTeachingSurface
  // Legacy coachDecision / liveCoach text remains input-only for debug/bypass; brain copy used for visible coach title/body on teaching frames.
  const brainCopy = input.brainAnalysis?.safeFallbackCopy;
  const useBrainForCoach = Boolean(
    brainCopy &&
    brainCopy.isSafe &&
    input.trainerPhase === "ready_for_user" &&
    input.isUserTurn &&
    !input.branchTransitionSurface
  );
  if (useBrainForCoach && brainCopy) {
    // Defense: pieceType always from target via brain; surface will also cross-check vs instructionTarget
    coach = {
      ...coach,
      owner: "brain_skeleton" as any,
      shouldRender: true,
      title: brainCopy.title,
      body: brainCopy.body,
      buttons: [], // actions come exclusively from visibleActionPolicy in surface (Gate2+)
      suppressedReason: null,
      intent: "brain_safe_fallback",
      // coachPieceType implicitly brainCopy.pieceType (matches target)
    };
  }

  return {
    frameId: input.frameId,
    fen: input.fen,
    trainerPhase: input.trainerPhase,
    trainingMode: input.trainingMode,
    trainerView: input.trainerView,
    isUserTurn: input.isUserTurn,
    visual,
    coach,
    legacy: {
      allowTrainingCard: Boolean(legacyLines.length),
      allowAnswerCard: Boolean(input.answerShown),
      allowMoveImpact: Boolean(input.answerShown),
      allowNextMoveText: Boolean(input.answerShown),
      legacySuppressedReason: legacyLines.length ? null : "legacy_not_available",
    },
    health: {
      recipeEligible: Boolean(input.visualRecipeId && recipeLines.length),
      recipeMatched: Boolean(input.recipeFrameMatchesBoard && input.recipeFenMatchesBoard),
      adapterAllowed: Boolean(input.adapterAllowed),
      directFallbackAvailable: Boolean(continuationLines.length || safeMoveLines.length),
      directFallbackRendered: visual.source === "continuation_candidate" || visual.source === "guided_target_fallback",
      branchTransitionSurface: Boolean(input.branchTransitionSurface),
      coachSurfacePolicy: input.coachSurfacePolicy ?? null,
    },
  };
}
