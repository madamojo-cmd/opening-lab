import assert from "node:assert/strict";

import { extractAdvancedFeatures } from "../../features/advancedFeatureExtractor";
import type { TeachingOpportunity } from "../../opportunity/opportunityTypes";
import { renderTemplate, resolveTemplateVariables } from "../templateVariableResolver";

export function testTemplateVariableResolver(): void {
  const features = extractAdvancedFeatures("r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3");
  const opportunity = { id: "x", layer: "expected_move", intent: "explain_training_move", moveUci: "f1c4", moveSan: "Bc4" } as TeachingOpportunity;
  const vars = resolveTemplateVariables({ opportunity, features });
  assert.equal(vars.moveSan, "Bc4");
  assert.equal(renderTemplate("Play {moveSan}.", vars).text, "Play Bc4.");
  assert.deepEqual(renderTemplate("{missing}", vars).missing, ["missing"]);
}
