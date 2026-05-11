import {
  buildFeaturePacket,
  recommendationPending,
  verifyVisualOutput,
  type BlundrFeaturePacket,
  type BlundrVisualModelOutput,
  type FeaturePacketInput,
} from "../featurePacketBuilder";
import { rankTeachingCandidates } from "./salienceScorer";
import { renderVisualRecipe } from "./visualRecipes";

function isPacket(value: BlundrFeaturePacket | FeaturePacketInput): value is BlundrFeaturePacket {
  return Boolean((value as BlundrFeaturePacket).derived?.candidateMoves);
}

export function salienceVisualSelector(packetLike: BlundrFeaturePacket | FeaturePacketInput): BlundrVisualModelOutput {
  try {
    const packet = isPacket(packetLike) ? packetLike : buildFeaturePacket(packetLike);
    const ranked = rankTeachingCandidates(packet);
    const candidate = ranked[0];

    if (!candidate) {
      return recommendationPending(packet, "no ranked teaching candidate");
    }

    const output = renderVisualRecipe(candidate, packet);
    return verifyVisualOutput(output, packet, { mode: "runtime" });
  } catch (error) {
    const reason = error instanceof Error ? error.message : "salience selector failed";
    return recommendationPending(packetLike, reason);
  }
}
