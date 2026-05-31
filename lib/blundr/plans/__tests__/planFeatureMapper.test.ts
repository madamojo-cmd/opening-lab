import assert from "node:assert/strict";

import { extractAdvancedFeatures } from "../../features/advancedFeatureExtractor";
import { inferPlansFromFeatures } from "../planFeatureMapper";

export function testPlanFeatureMapper(): void {
  const plans = inferPlansFromFeatures(extractAdvancedFeatures("r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3"));
  assert.equal(plans.some((plan) => plan.type === "bishop_diagonal_pressure"), true);
}
