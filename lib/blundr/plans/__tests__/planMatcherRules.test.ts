import assert from "node:assert/strict";

import { extractAdvancedFeatures } from "../../features/advancedFeatureExtractor";
import { OPENING_PLAN_REGISTRY } from "../openingPlanRegistry";
import { buildPlanFromRegistry, registryEntryCanMatch } from "../planMatcherRules";

export function testPlanMatcherRules(): void {
  const features = extractAdvancedFeatures("r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3");
  const entry = OPENING_PLAN_REGISTRY.find((candidate) => candidate.conceptId === "develop_with_pressure")!;
  assert.equal(registryEntryCanMatch(entry, features).allowed, true);
  assert.equal(buildPlanFromRegistry(entry, features, { uci: "f1c4", san: "Bc4" }).type, "bishop_diagonal_pressure");
}
