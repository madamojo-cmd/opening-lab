import type { AdvancedFeaturePacket } from "../features/advancedFeatureTypes";
import type { OpeningPlanRegistryEntry, RecognizedPlan } from "./planTypes";

export function featureTypes(packet: AdvancedFeaturePacket): Set<string> {
  return new Set(packet.featureClaims.filter((claim) => claim.canMention).map((claim) => claim.type));
}

export function registryEntryCanMatch(entry: OpeningPlanRegistryEntry, packet: AdvancedFeaturePacket): { allowed: boolean; reason?: string } {
  const types = featureTypes(packet);
  if (entry.planType === "central_break_preparation" && entry.movePatterns.some((move) => ["c2c3", "c3", "d2d3", "d3"].includes(move))) {
    return { allowed: true };
  }
  if (entry.requiredFeatureClaimTypes.length && !entry.requiredFeatureClaimTypes.some((type) => types.has(type))) {
    return { allowed: false, reason: `missing_required_feature:${entry.requiredFeatureClaimTypes.join("|")}` };
  }
  if (entry.blockedIfFeatureClaimTypes?.some((type) => types.has(type))) return { allowed: false, reason: "blocked_feature_present" };
  return { allowed: true };
}

export function buildPlanFromRegistry(entry: OpeningPlanRegistryEntry, packet: AdvancedFeaturePacket, move?: { uci?: string; san?: string }): RecognizedPlan {
  const relatedClaims = packet.featureClaims.filter((claim) => [...entry.requiredFeatureClaimTypes, ...entry.optionalFeatureClaimTypes].includes(claim.type));
  const relatedSquares = Array.from(new Set(relatedClaims.flatMap((claim) => [claim.square, ...(claim.squares ?? [])]).filter(Boolean) as string[]));
  const confidence = relatedClaims.some((claim) => claim.confidence === "high") ? "high" : relatedClaims.some((claim) => claim.confidence === "medium") ? "medium" : "low";
  return {
    id: `${entry.conceptId}:${entry.planType}:${move?.uci ?? move?.san ?? "context"}`,
    type: entry.planType,
    moveUci: move?.uci,
    moveSan: move?.san,
    conceptId: entry.conceptId,
    relatedSquares,
    relatedFeatures: Array.from(new Set(relatedClaims.map((claim) => claim.type))),
    confidence,
    canMention: confidence !== "low",
    canDominate: confidence === "high",
    evidence: relatedClaims.flatMap((claim) => claim.evidence),
  };
}
