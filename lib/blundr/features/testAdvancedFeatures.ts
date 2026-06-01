import { testAdvancedFeatureExtractor } from "./__tests__/advancedFeatureExtractor.test";
import { testImbalanceExtractor } from "./__tests__/imbalanceExtractor.test";
import { testKingSafetyExtractor } from "./__tests__/kingSafetyExtractor.test";
import { testPawnStructureExtractor } from "./__tests__/pawnStructureExtractor.test";
import { testPieceQualityExtractor } from "./__tests__/pieceQualityExtractor.test";
import { testTacticalMotifExtractor } from "./__tests__/tacticalMotifExtractor.test";

export function testAdvancedFeatures(): void {
  testPawnStructureExtractor();
  testKingSafetyExtractor();
  testPieceQualityExtractor();
  testImbalanceExtractor();
  testTacticalMotifExtractor();
  testAdvancedFeatureExtractor();
}
