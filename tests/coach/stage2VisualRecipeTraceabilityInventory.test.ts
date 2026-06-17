import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export function testStage2VisualRecipeTraceabilityInventory(): void {
  const docPath = resolve("docs/architecture/STAGE2_VISUAL_RECIPE_TRACEABILITY_INVENTORY.md");
  const text = readFileSync(docPath, "utf8");

  assert.match(text, /visual result/i);
  assert.match(text, /approved_recipe/i);
  assert.match(text, /generated_recipe/i);
  assert.match(text, /fallback_current_surface/i);
  assert.match(text, /none/i);
  assert.match(text, /TrainerFrameResolution/i);
  assert.match(text, /FeatureTrace/i);
  assert.match(text, /Copy Everything/i);
}

testStage2VisualRecipeTraceabilityInventory();
console.log("stage2VisualRecipeTraceabilityInventory ok");
