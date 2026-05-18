import type { TeachingStoryCandidate } from "./storyTypes";
import type { TeachingEvidence } from "./evidenceCollector";
import type { TeachingCue } from "./teachingCueTypes";
import { TEACHING_CUE_COMPILER_VERSION } from "./teachingCueTypes";
import { renderTeachingTemplate } from "./conceptTemplates";

function cueId(prefix: string, moveUci: string): string {
  return `${prefix}-${Date.now().toString(36)}-${moveUci || "none"}`;
}

function baseCue(evidence: TeachingEvidence, story: TeachingStoryCandidate | null, mode: TeachingCue["cueMode"]): TeachingCue {
  return {
    id: cueId("tc", evidence.expectedMoveUci ?? "none"),
    conceptId: story?.conceptId ?? "context_only",
    cueMode: mode,
    teachingPermissionTier: undefined,
    primaryFocus: undefined,
    selectedStoryId: story?.id,
    storyScore: story?.score.total,
    themesShown: [],
    answerVisualsShown: false,
    contextVisualsShown: false,
    confidence: story?.score.confidence ?? 0.4,
    userFacing: {
      title: "Move not verified",
      snippet: "Blundr will not invent a plan here.",
    },
    visual: {
      primaryArrow: story?.visualPlan.primaryArrow,
      relationshipLines: story?.visualPlan.relationshipLines ?? [],
      keySquares: story?.visualPlan.keySquares ?? [],
      ghostSquares: story?.visualPlan.ghostSquares ?? [],
      dangerSquares: story?.visualPlan.dangerSquares ?? [],
    },
    debug: {
      confidence: story?.score.confidence ?? 0.4,
      selectedReason: story?.evidenceRefs?.[0] ?? "No selected story",
      candidateCount: 0,
      suppressedReasons: [],
      deltaSummary: [],
      detectorScores: [],
    },
    metadata: {
      fenBefore: evidence.fenBefore,
      fenAfter: evidence.fenAfter,
      moveSan: evidence.expectedMoveSan ?? "",
      moveUci: evidence.expectedMoveUci ?? "",
      createdAt: new Date().toISOString(),
      compilerVersion: TEACHING_CUE_COMPILER_VERSION,
    },
  };
}

export function compilePositionContextCue(input: {
  evidence: TeachingEvidence;
  selectedStory: TeachingStoryCandidate | null;
}): TeachingCue {
  const cue = baseCue(input.evidence, input.selectedStory, "context_only");
  if (!input.selectedStory) return cue;

  const template = renderTeachingTemplate(input.selectedStory.conceptId, {
    moveSan: input.evidence.expectedMoveSan,
    targetSquare: input.selectedStory.relevantSquares[0],
  });

  return {
    ...cue,
    conceptId: input.selectedStory.conceptId,
    selectedStoryId: input.selectedStory.id,
    storyScore: input.selectedStory.score.total,
    themesShown: [input.selectedStory.kind, input.selectedStory.conceptId],
    confidence: input.selectedStory.score.confidence,
    userFacing: {
      title: template.title,
      snippet: template.snippet,
      next: undefined,
    },
    debug: {
      ...cue.debug,
      confidence: input.selectedStory.score.confidence,
      selectedReason: input.selectedStory.evidenceRefs[0] ?? cue.debug.selectedReason,
    },
  };
}

export function compileTeachingCue(input: {
  evidence: TeachingEvidence;
  selectedStory: TeachingStoryCandidate | null;
  canRecommendMove: boolean;
}): TeachingCue {
  if (!input.selectedStory) {
    return baseCue(input.evidence, null, "context_only");
  }

  if (!input.canRecommendMove) {
    return compilePositionContextCue({ evidence: input.evidence, selectedStory: input.selectedStory });
  }

  const cue = baseCue(input.evidence, input.selectedStory, input.selectedStory.kind === "strong_alternative" ? "alternative_feedback" : "move_teaching");
  const template = renderTeachingTemplate(input.selectedStory.conceptId, {
    moveSan: input.evidence.expectedMoveSan,
    targetSquare: input.selectedStory.relevantSquares[0],
  });

  return {
    ...cue,
    conceptId: input.selectedStory.conceptId,
    selectedStoryId: input.selectedStory.id,
    storyScore: input.selectedStory.score.total,
    themesShown: [input.selectedStory.kind, input.selectedStory.conceptId],
    confidence: input.selectedStory.score.confidence,
    userFacing: {
      badge: "Blundr Brain Validated",
      title: template.title,
      snippet: template.snippet,
      next: input.evidence.expectedMoveSan ? `Play ${input.evidence.expectedMoveSan}.` : undefined,
    },
    debug: {
      ...cue.debug,
      confidence: input.selectedStory.score.confidence,
      selectedReason: input.selectedStory.evidenceRefs[0] ?? cue.debug.selectedReason,
    },
  };
}
