import type { CoachButton } from "./coachTypes";
import { resolveCoachTeachingIntent } from "./teachingIntent";
import type { CoachEvidencePacket, CoachInteraction } from "../coachBrain/coachEvidenceTypes";
import { extractAdvancedFeatures } from "../features/advancedFeatureExtractor";
import { recognizeStrategicPlans } from "../plans/planRecognitionEngine";
import { mapFeaturesToOpportunities } from "../opportunity/featureOpportunityMapper";
import { rankTeachingOpportunities } from "../opportunity/multiLayerOpportunityRanker";
import type { CoachTeachingIntent, TeachingOpportunity } from "../opportunity/opportunityTypes";
import { renderProceduralExplanation } from "../explanation/proceduralExplanationEngine";
import { buildMappingDebug } from "../opportunity/mappingDebug";
import { summarizeOpportunityDebug } from "../opportunity/opportunityDebug";

export interface IntentFirstCoachDecision {
  shouldShow: boolean;
  intent: CoachTeachingIntent;
  selectedOpportunity?: TeachingOpportunity;
  title: string;
  body: string;
  buttons: CoachButton[];
  givesAnswer: boolean;
  revealRisk: "none" | "low" | "medium" | "high";
  reviewWorthy: boolean;
  utteranceFamily: string;
  templateId?: string;
  safetyWarnings: string[];
  suppressedReason?: string;
  debug: Record<string, unknown>;
}

export function decideIntentFirstCoach(input: {
  packet: CoachEvidencePacket;
  interaction: CoachInteraction;
  conceptId?: string;
  openingId?: string;
  visualRecipeId?: string;
  recentBodies?: string[];
}): IntentFirstCoachDecision {
  const packet = input.packet;
  if (packet.stale || packet.evidenceStatus === "stale") return quiet("stale_frame_or_fen");
  const intent = resolveCoachTeachingIntent({ packet, interaction: input.interaction, hasVisualRecipe: Boolean(input.visualRecipeId ?? packet.visualRecipeFacts?.patternId) });
  if (intent === "silent") {
    if (packet.trainingMode === "continuation" && packet.selectedCandidateMoveUci && packet.exactMoveAllowed) {
      return {
        shouldShow: true,
        intent: "show_continued_plan",
        selectedOpportunity: undefined,
        title: "Suggested continuation",
        body: packet.selectedCandidateMoveSan
          ? `One safe continuation is ${packet.selectedCandidateMoveSan}.`
          : "One safe continuation is available.",
        buttons: buttonsFor(packet, "show_continued_plan"),
        givesAnswer: false,
        revealRisk: "none",
        reviewWorthy: false,
        utteranceFamily: "continuation_candidate_fallback",
        templateId: undefined,
        safetyWarnings: [],
        suppressedReason: undefined,
        debug: {
          candidateCoachFallbackUsed: true,
          candidateCoachFallbackReason: "silent_intent_with_trusted_continuation_candidate",
          selectedOpportunityId: null,
          selectedOpportunityLayer: null,
          selectedOpportunityScore: null,
          selectedTemplateId: null,
          selectedTemplateCategory: null,
          selectedPlanId: null,
          selectedPlanType: null,
        },
      };
    }
    return quiet("silent_intent");
  }

  const features = extractAdvancedFeatures(packet.fenBefore);
  const plans = recognizeStrategicPlans({
    fen: packet.fenBefore,
    features,
    openingId: input.openingId,
    conceptId: input.conceptId ?? packet.visualRecipeFacts?.conceptId ?? packet.trainingFacts?.conceptId,
    moveUci: packet.expectedMoveUci ?? packet.selectedCandidateMoveUci,
    moveSan: packet.expectedMoveSan ?? packet.selectedCandidateMoveSan,
  });
  const opportunities = mapFeaturesToOpportunities({
    features,
    plans,
    expectedMoveUci: packet.expectedMoveUci ?? packet.selectedCandidateMoveUci,
    expectedMoveSan: packet.expectedMoveSan ?? packet.selectedCandidateMoveSan,
    visualRecipeId: input.visualRecipeId ?? packet.visualRecipeFacts?.patternId,
    conceptId: input.conceptId ?? packet.visualRecipeFacts?.conceptId ?? packet.trainingFacts?.conceptId,
    trainerView: packet.viewMode,
    interaction: input.interaction,
  }).map((opportunity): TeachingOpportunity => ({
    ...opportunity,
    intent: (intent === "recall_hint" && opportunity.intent === "recall_prompt" ? "recall_hint" : intent === "reveal_answer" ? "reveal_answer" : intent) as CoachTeachingIntent,
  }));
  const selected = rankTeachingOpportunities(opportunities);
  if (!selected) {
    if (packet.trainingMode === "continuation" && packet.selectedCandidateMoveUci && packet.exactMoveAllowed) {
      const candidateTitle = "Suggested continuation";
      const candidateBody = packet.selectedCandidateMoveSan
        ? `One safe continuation is ${packet.selectedCandidateMoveSan}.`
        : "One safe continuation is available.";
      return {
        shouldShow: true,
        intent: "show_continued_plan",
        selectedOpportunity: undefined,
        title: candidateTitle,
        body: candidateBody,
        buttons: buttonsFor(packet, "show_continued_plan"),
        givesAnswer: false,
        revealRisk: "none",
        reviewWorthy: false,
        utteranceFamily: "continuation_candidate_fallback",
        templateId: undefined,
        safetyWarnings: [],
        suppressedReason: undefined,
        debug: {
          candidateCoachFallbackUsed: true,
          candidateCoachFallbackReason: "no_renderable_opportunity_for_trusted_continuation_candidate",
          selectedOpportunityId: null,
          selectedOpportunityLayer: null,
          selectedOpportunityScore: null,
          selectedTemplateId: null,
          selectedTemplateCategory: null,
          selectedPlanId: null,
          selectedPlanType: null,
        },
      };
    }
    return quiet("no_renderable_opportunity");
  }

  const explanation = renderProceduralExplanation({
    opportunity: selected,
    features,
    plans,
    plainLeakPolicy: packet.viewMode === "plain" && intent !== "reveal_answer",
  });
  if (explanation.safetyStatus !== "passed" || !explanation.body) {
    if (packet.trainingMode === "continuation" && packet.selectedCandidateMoveUci && packet.exactMoveAllowed) {
      return {
        shouldShow: true,
        intent: "show_continued_plan",
        selectedOpportunity: selected,
        title: "Suggested continuation",
        body: packet.selectedCandidateMoveSan
          ? `One safe continuation is ${packet.selectedCandidateMoveSan}.`
          : "One safe continuation is available.",
        buttons: buttonsFor(packet, "show_continued_plan"),
        givesAnswer: false,
        revealRisk: "none",
        reviewWorthy: false,
        utteranceFamily: "continuation_candidate_fallback",
        templateId: explanation.templateId,
        safetyWarnings: explanation.blockedReasons,
        suppressedReason: undefined,
        debug: {
          ...summarizeOpportunityDebug(selected),
          candidateCoachFallbackUsed: true,
          candidateCoachFallbackReason: "template_blocked_for_trusted_continuation_candidate",
          selectedOpportunityId: selected.id,
          selectedOpportunityLayer: selected.layer,
          selectedOpportunityScore: selected.totalScore,
          selectedTemplateId: explanation.templateId,
          selectedTemplateCategory: explanation.utteranceFamily,
          selectedPlanId: selected.planId,
          selectedPlanType: selected.planId ?? null,
        },
      };
    }
    return quiet("template_safety_blocked", explanation.blockedReasons);
  }

  const givesAnswer = intent === "reveal_answer" || intent === "show_trusted_move";
  return {
    shouldShow: true,
    intent,
    selectedOpportunity: selected,
    title: explanation.title,
    body: explanation.body,
    buttons: buttonsFor(packet, intent),
    givesAnswer,
    revealRisk: givesAnswer ? "high" : packet.viewMode === "plain" ? "low" : "none",
    reviewWorthy: packet.viewMode === "plain" && (givesAnswer || input.interaction === "hint"),
    utteranceFamily: explanation.utteranceFamily,
    templateId: explanation.templateId,
    safetyWarnings: [],
    debug: {
      ...summarizeOpportunityDebug(selected),
      ...buildMappingDebug({
        featureClaimIds: features.featureClaims.map((claim) => claim.id),
        planIds: plans.plans.map((plan) => plan.id),
        opportunity: selected,
        templateId: explanation.templateId,
        blockedReasons: explanation.blockedReasons,
      }),
      advancedFeatureClaimTypes: features.featureClaims.map((claim) => claim.type),
      recognizedPlanTypes: plans.plans.map((plan) => plan.type),
      explanationRenderMs: 0,
    },
  };
}

function buttonsFor(packet: CoachEvidencePacket, intent: CoachTeachingIntent): CoachButton[] {
  if (intent === "explain_visual_recipe" || intent === "explain_training_move") return ["why", "replay", "hide"];
  if (intent === "recall_prompt" || intent === "recall_hint" || intent === "reveal_answer") return ["hint", "answer"];
  if (packet.trainingMode === "continuation") return packet.exactMoveAllowed ? ["show_plan", "analyze_idea", "show_move", "hide"] : ["show_plan", "analyze_idea", "hide"];
  return ["hide"];
}

function quiet(reason: string, warnings: string[] = []): IntentFirstCoachDecision {
  return {
    shouldShow: false,
    intent: "silent",
    title: "Coach",
    body: "",
    buttons: [],
    givesAnswer: false,
    revealRisk: "none",
    reviewWorthy: false,
    utteranceFamily: "silent",
    safetyWarnings: warnings,
    suppressedReason: reason,
    debug: { suppressedReason: reason, safetyWarnings: warnings },
  };
}
