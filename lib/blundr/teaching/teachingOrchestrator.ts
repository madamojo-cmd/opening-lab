import { collectTeachingEvidence, type CollectTeachingEvidenceInput, type TeachingEvidence } from "./evidenceCollector";
import { compilePositionContextCue, compileTeachingCue } from "./teachingCueCompiler";
import { deriveTeachingPermission, type TeachingPermission } from "./teachingPermissions";
import { selectBestTeachingStory, generateTeachingStoryCandidates } from "./storyRanker";
import type { TeachingStoryCandidate, TeachingStorySelectionResult } from "./storyTypes";
import { classifyTeachingTrust, type TeachingTrustClassification } from "./trustClassifier";
import { routeTeachingVisuals, type TeachingVisualOverlayDecision } from "./visualOverlayRouter";
import type { TeachingCue } from "./teachingCueTypes";

export type TeachingOrchestrationResult = {
  evidence: TeachingEvidence;
  storyCandidates: TeachingStoryCandidate[];
  selectedStory: TeachingStoryCandidate | null;
  selection: TeachingStorySelectionResult;
  classification: TeachingTrustClassification;
  permission: TeachingPermission;
  cue: TeachingCue;
  visualDecision: TeachingVisualOverlayDecision;
  userLabel: string;
  debug: {
    evidenceSummary: string[];
    selectedStoryId?: string;
    selectedStoryKind?: string;
    selectedStoryScore?: number;
    rejectedStories: Array<{ id: string; kind: string; total: number; reasons: string[] }>;
    trustTier: string;
    permissionFlags: Record<string, boolean | string>;
    suppressionReasons: string[];
    visualBudget: TeachingVisualOverlayDecision["visualBudgetUsed"];
    bookSupport: TeachingEvidence["bookSupport"];
    safetyWarnings: string[];
  };
  learningMetadata: {
    cueMode: TeachingCue["cueMode"];
    teachingPermissionTier: string;
    primaryFocus?: string;
    selectedStoryId?: string;
    selectedStoryKind?: string;
    storyScoreTotal?: number;
    themesShown?: string[];
    answerVisualsShown: boolean;
    contextVisualsShown: boolean;
    planVisualsShown: boolean;
    conceptId: string;
    confidence: number;
    compilerVersion: string;
    suppressionReasons: string[];
    bookSupportSummary: string;
    alternativeClassification?: string;
    visualBudgetUsed: TeachingVisualOverlayDecision["visualBudgetUsed"];
  };
};

export function orchestrateTeaching(input: CollectTeachingEvidenceInput & {
  trainerView: "assisted" | "plain";
  showAnswer: boolean;
  isUserTurn: boolean;
  trainingMode: "restricted" | "continuation";
}): TeachingOrchestrationResult {
  const evidence = collectTeachingEvidence(input);
  const bootstrapPermission = {
    canRecommendMove: evidence.validationUserStatus === "verified",
    canShowAnswerOverlays: evidence.validationUserStatus === "verified",
  };

  const candidates = generateTeachingStoryCandidates(evidence);
  const selection = selectBestTeachingStory(candidates, evidence, bootstrapPermission);
  const selectedStory = selection.selected;

  const classification = classifyTeachingTrust(evidence, selectedStory);
  const permission = deriveTeachingPermission(classification, {
    trainerView: input.trainerView,
    showAnswer: input.showAnswer,
  });

  const cue = permission.canRecommendMove
    ? compileTeachingCue({ evidence, selectedStory, canRecommendMove: permission.canRecommendMove })
    : compilePositionContextCue({ evidence, selectedStory });

  const visualDecision = routeTeachingVisuals({
    cue,
    permission,
    selectedStory,
    trainerView: input.trainerView,
    showAnswer: input.showAnswer,
  });

  cue.teachingPermissionTier = classification.tier;
  cue.primaryFocus = classification.primaryFocus;
  cue.answerVisualsShown = visualDecision.answerVisualsShown;
  cue.contextVisualsShown = visualDecision.contextVisualsShown;

  const evidenceSummary = [
    `Phase: ${evidence.phase}`,
    `Validation: ${evidence.validationUserStatus}`,
    `Book support: ${evidence.bookSupport.userLabel}`,
    ...(evidence.safetyWarnings.length ? evidence.safetyWarnings : ["No major safety warning."]),
  ];

  return {
    evidence,
    storyCandidates: candidates,
    selectedStory,
    selection,
    classification,
    permission,
    cue,
    visualDecision,
    userLabel: permission.userLabel,
    debug: {
      evidenceSummary,
      selectedStoryId: selectedStory?.id,
      selectedStoryKind: selectedStory?.kind,
      selectedStoryScore: selectedStory?.score.total,
      rejectedStories: selection.rejectedTop.map((story) => ({
        id: story.id,
        kind: story.kind,
        total: story.score.total,
        reasons: story.rejectionReasons,
      })),
      trustTier: classification.tier,
      permissionFlags: {
        userLabel: permission.userLabel,
        canRecommendMove: permission.canRecommendMove,
        canShowMoveArrow: permission.canShowMoveArrow,
        canShowPatternCue: permission.canShowPatternCue,
        canShowContextCue: permission.canShowContextCue,
        canShowAnswerOverlays: permission.canShowAnswerOverlays,
        canShowContextOverlays: permission.canShowContextOverlays,
      },
      suppressionReasons: visualDecision.suppressedReasons,
      visualBudget: visualDecision.visualBudgetUsed,
      bookSupport: evidence.bookSupport,
      safetyWarnings: evidence.safetyWarnings,
    },
    learningMetadata: {
      cueMode: cue.cueMode,
      teachingPermissionTier: classification.tier,
      primaryFocus: classification.primaryFocus,
      selectedStoryId: selectedStory?.id,
      selectedStoryKind: selectedStory?.kind,
      storyScoreTotal: selectedStory?.score.total,
      themesShown: cue.themesShown,
      answerVisualsShown: visualDecision.answerVisualsShown,
      contextVisualsShown: visualDecision.contextVisualsShown,
      planVisualsShown: visualDecision.planVisualsShown,
      conceptId: cue.conceptId,
      confidence: cue.confidence ?? 0,
      compilerVersion: cue.metadata.compilerVersion,
      suppressionReasons: visualDecision.suppressedReasons,
      bookSupportSummary: evidence.bookSupport.userLabel,
      alternativeClassification: classification.tier === "strong_alternative" ? "strong_alternative" : undefined,
      visualBudgetUsed: visualDecision.visualBudgetUsed,
    },
  };
}
