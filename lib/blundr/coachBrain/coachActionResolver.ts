import type { CoachEvidencePacket, CoachInteraction } from "./coachEvidenceTypes";

export function resolveCoachAction(packet: CoachEvidencePacket, interaction: CoachInteraction): {
  interaction: CoachInteraction;
  hintLevel: number;
  allowExactMove: boolean;
} {
  if (interaction === "show_move" && !packet.exactMoveAllowed) {
    return { interaction: "show_plan", hintLevel: 0, allowExactMove: false };
  }
  if (interaction === "answer" && packet.viewMode === "plain") {
    return { interaction, hintLevel: 2, allowExactMove: packet.exactMoveAllowed };
  }
  if (interaction === "hint") {
    return { interaction, hintLevel: packet.viewMode === "plain" ? 1 : 0, allowExactMove: false };
  }
  if (interaction === "analyze_idea") {
    return { interaction, hintLevel: 0, allowExactMove: false };
  }
  return { interaction, hintLevel: 0, allowExactMove: packet.exactMoveAllowed };
}
