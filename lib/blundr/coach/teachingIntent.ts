import type { CoachInteraction, CoachEvidencePacket } from "../coachBrain/coachEvidenceTypes";
import type { CoachTeachingIntent } from "../opportunity/opportunityTypes";

export function resolveCoachTeachingIntent(input: {
  packet: CoachEvidencePacket;
  interaction: CoachInteraction;
  hasVisualRecipe: boolean;
}): CoachTeachingIntent {
  if (input.interaction === "hide") return "silent";
  if (input.packet.trainingMode === "restricted" && input.packet.viewMode === "plain" && (input.interaction === "answer" || input.interaction === "show_move")) return "reveal_answer";
  if (input.packet.trainingMode === "restricted" && input.packet.viewMode === "plain" && input.interaction === "hint") return "recall_hint";
  if (input.packet.trainingMode === "restricted" && input.packet.viewMode === "plain") return "recall_prompt";
  if (input.packet.trainingMode === "restricted" && input.packet.viewMode === "assisted" && input.hasVisualRecipe) return "explain_visual_recipe";
  if (input.packet.trainingMode === "restricted" && input.packet.expectedMoveUci) return "explain_training_move";
  if (input.packet.trainingMode === "continuation" && input.interaction === "show_move" && input.packet.exactMoveAllowed) return "show_trusted_move";
  if (input.packet.trainingMode === "continuation" && input.interaction === "analyze_idea") return "analyze_candidate_idea";
  if (input.packet.trainingMode === "continuation" && (input.interaction === "show_plan" || input.packet.boardFacts.safePlanObjects.length)) return "show_continued_plan";
  if (input.packet.trainingMode === "continuation" && input.packet.selectedCandidateMoveUci && input.packet.exactMoveAllowed) return "show_continued_plan";
  return input.packet.boardFacts.safePlanObjects.length ? "position_context" : "silent";
}
