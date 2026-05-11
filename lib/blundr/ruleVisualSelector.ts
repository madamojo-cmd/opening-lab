import {
  recommendationPending,
  type BlundrFeaturePacket,
  type BlundrVisualModelOutput,
  type FeaturePacketInput,
} from "./featurePacketBuilder";
import { salienceVisualSelector } from "./salience/salienceVisualSelector";

export function ruleVisualSelector(packet: BlundrFeaturePacket | FeaturePacketInput): BlundrVisualModelOutput {
  try {
    return salienceVisualSelector(packet);
  } catch (error) {
    const reason = error instanceof Error ? error.message : "rule selector failed";
    const fallback = recommendationPending(packet, reason);
    return {
      ...fallback,
      debug: {
        ...(fallback.debug ?? {}),
        fallbackUsed: true,
        selector: "ruleVisualSelector",
      },
    };
  }
}
