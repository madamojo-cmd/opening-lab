import type { AdvancedFeaturePacket } from "../features/advancedFeatureTypes";
import type { RecognizedPlan } from "./planTypes";

export function inferPlansFromFeatures(packet: AdvancedFeaturePacket): RecognizedPlan[] {
  const plans: RecognizedPlan[] = [];
  const claimTypes = new Set(packet.featureClaims.map((claim) => claim.type));
  if (claimTypes.has("center_tension")) {
    plans.push({
      id: "feature:center_tension",
      type: "maintain_center_tension",
      relatedSquares: ["d4", "e4", "d5", "e5"],
      relatedFeatures: ["center_tension"],
      confidence: "high",
      canMention: true,
      canDominate: false,
      evidence: ["center_tension_feature"],
    });
  }
  if (claimTypes.has("pawn_lever_support")) {
    plans.push({
      id: "feature:pawn_lever_support",
      type: "central_break_preparation",
      relatedSquares: ["c3", "d4"],
      relatedFeatures: ["pawn_lever_support"],
      confidence: "high",
      canMention: true,
      canDominate: true,
      evidence: ["pawn_lever_support_feature"],
    });
  }
  if (claimTypes.has("active_bishop")) {
    plans.push({
      id: "feature:active_bishop",
      type: "bishop_diagonal_pressure",
      relatedSquares: packet.pieceQuality.activeBishops.flatMap((bishop) => [bishop.square, ...bishop.targets]).slice(0, 4),
      relatedFeatures: ["active_bishop"],
      confidence: "high",
      canMention: true,
      canDominate: true,
      evidence: ["active_bishop_feature"],
    });
  }
  return plans;
}
