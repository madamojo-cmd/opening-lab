import type { FeatureConfidence, FeatureRisk } from "./advancedFeatureTypes";

export function riskForConfidence(confidence: FeatureConfidence, tactical = false): FeatureRisk {
  if (tactical) return "debug_only";
  if (confidence === "high") return "safe_to_mention";
  if (confidence === "medium") return "safe_to_mention";
  return "debug_only";
}

export function canMention(confidence: FeatureConfidence, tactical = false): boolean {
  return riskForConfidence(confidence, tactical) === "safe_to_mention";
}
