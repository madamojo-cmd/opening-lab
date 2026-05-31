import assert from "node:assert/strict";
import { extractPositionFeatures } from "../positionFeatureExtractor";

export function testPositionFeatureExtractor(): void {
  const features = extractPositionFeatures("rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1");
  assert.equal(features.centerState === "open" || features.centerState === "tense" || features.centerState === "fluid" || features.centerState === "closed", true);
  assert.equal(Array.isArray(features.leastActivePieces), true);
  assert.equal(features.tacticalAlert === "none" || features.tacticalAlert === "confirmed_simple_check", true);
}
