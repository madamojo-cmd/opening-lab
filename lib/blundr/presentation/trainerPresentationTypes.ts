import type { CoachTeachingIntent } from "../opportunity/opportunityTypes";

export interface TrainerPresentationFrame {
  frameId: number;
  normalizedFen: string;
  visual: {
    shouldRender: boolean;
    source: "visual_recipe" | "continuation_candidate" | "guided_target_fallback" | "legacy" | "legacy_fallback" | "none";
    lines: unknown[];
    squareStyles?: Record<string, unknown>;
    highlights?: unknown[];
    recipeId?: string;
    primitiveIds: string[];
    blockedReason?: string;
    lifecycle: {
      trainerFrameId?: number;
      overlayFrameId?: number;
      frameMatches: boolean;
      fenMatches: boolean;
      adapterAllowed: boolean;
      playbackReady: boolean;
    };
  };
  coach: {
    shouldRender: boolean;
    owner: "intent_first_coach" | "legacy_fallback" | "branch_transition_surface" | "none";
    intent?: CoachTeachingIntent;
    title?: string;
    body?: string;
    buttons?: string[];
    suppressedReason?: string;
    utteranceFamily?: string;
    templateId?: string;
  };
  legacy: {
    allowTrainingCard: boolean;
    allowAnswerCard: boolean;
    allowMoveImpact: boolean;
    allowNextMoveText: boolean;
    legacySuppressedReason?: string;
  };
  debug: {
    visualLayerSource: string;
    visualLayerBlockedReason?: string;
    coachSurfaceOwner: string;
    coachBlockedReason?: string;
    selectedOpportunityId?: string;
    selectedOpportunityLayer?: string;
    selectedOpportunityScore?: number;
    selectedTemplateId?: string;
    copySafetyStatus?: string;
  };
}
