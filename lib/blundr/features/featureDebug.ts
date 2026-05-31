import type { AdvancedFeaturePacket } from "./advancedFeatureTypes";

export function summarizeFeatureDebug(packet: AdvancedFeaturePacket): Record<string, unknown> {
  return {
    normalizedFen: packet.normalizedFen,
    confidence: packet.confidence,
    claimTypes: packet.featureClaims.map((claim) => claim.type),
    blockedFeatureClaims: packet.blockedFeatureClaims,
    timings: packet.timings,
  };
}
