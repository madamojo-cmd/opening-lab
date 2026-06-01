import type { CoachOpportunityScore, PositionEvidencePacket } from "./liveCoachTypes";

export function shouldLiveCoachStaySilent(input: {
  evidence: PositionEvidencePacket;
  selected?: CoachOpportunityScore | null;
  userRequestedHelp?: boolean;
  repeatedConcept?: boolean;
}): { silent: boolean; reason?: string } {
  if (input.evidence.stale) return { silent: true, reason: "stale_frame_or_fen" };
  if (input.selected?.opportunity === "silence") return { silent: true, reason: "no_clear_opportunity" };
  if ((input.selected?.confidenceScore ?? 0) < 0.45) return { silent: true, reason: "low_confidence" };
  if (input.repeatedConcept) return { silent: true, reason: "repetition_control" };
  if (!input.userRequestedHelp && (input.selected?.pedagogicalValue ?? 0) < 0.55) return { silent: true, reason: "low_value_unsolicited" };
  return { silent: false };
}
