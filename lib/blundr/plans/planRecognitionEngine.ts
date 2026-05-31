import { extractAdvancedFeatures } from "../features/advancedFeatureExtractor";
import type { AdvancedFeaturePacket } from "../features/advancedFeatureTypes";
import { inferPlansFromFeatures } from "./planFeatureMapper";
import { buildPlanFromRegistry, registryEntryCanMatch } from "./planMatcherRules";
import { findRegistryEntries } from "./openingPlanRegistry";
import type { BlockedPlan, StrategicPlanPacket } from "./planTypes";

export function recognizeStrategicPlans(input: {
  fen: string;
  features?: AdvancedFeaturePacket;
  openingId?: string;
  conceptId?: string;
  moveUci?: string;
  moveSan?: string;
}): StrategicPlanPacket {
  const started = Date.now();
  const features = input.features ?? extractAdvancedFeatures(input.fen);
  const plans = [...inferPlansFromFeatures(features)];
  const blockedPlans: BlockedPlan[] = [];
  for (const entry of findRegistryEntries({ openingId: input.openingId, conceptId: input.conceptId, moveUci: input.moveUci, moveSan: input.moveSan })) {
    const match = registryEntryCanMatch(entry, features);
    if (!match.allowed) {
      blockedPlans.push({ type: entry.planType, reason: match.reason ?? "registry_match_blocked" });
      continue;
    }
    plans.push(buildPlanFromRegistry(entry, features, { uci: input.moveUci, san: input.moveSan }));
  }
  const unique = new Map(plans.map((plan) => [plan.id, plan]));
  return {
    fen: input.fen,
    normalizedFen: features.normalizedFen,
    plans: Array.from(unique.values()),
    blockedPlans,
    timings: { totalMs: Date.now() - started },
    generatedAt: Date.now(),
  };
}
