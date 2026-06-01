import assert from "node:assert/strict";

import { extractAdvancedFeatures } from "../../features/advancedFeatureExtractor";

export function testPieceQualityGolden(): void {
  const packet = extractAdvancedFeatures("r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3");
  assert.equal(packet.pieceQuality.activeBishops.some((bishop) => bishop.square === "c4"), true);
}
