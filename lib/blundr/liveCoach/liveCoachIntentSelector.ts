import type { CoachOpportunity, LiveCoachIntent } from "./liveCoachTypes";

export function selectIntentForOpportunity(opportunity: CoachOpportunity): LiveCoachIntent {
  if (opportunity === "predictable_human_mistake") return "warn";
  if (opportunity === "hard_to_find_good_move") return "compare_instincts";
  if (opportunity === "natural_good_move") return "reinforce";
  if (opportunity === "pattern_transfer") return "connect_pattern";
  if (opportunity === "plan_transition") return "explain_plan";
  if (opportunity === "center_decision") return "ask_question";
  if (opportunity === "king_safety_urgent") return "warn";
  if (opportunity === "least_active_piece") return "nudge";
  if (opportunity === "premature_attack_warning") return "warn";
  if (opportunity === "opponent_human_response") return "explain_plan";
  if (opportunity === "supported_continuation") return "explain_plan";
  return "stay_silent";
}
