import { testContinuationGolden } from "./__tests__/continuationGolden.test";
import { testFeatureMappingGolden } from "./__tests__/featureMappingGolden.test";
import { testImbalanceGolden } from "./__tests__/imbalanceGolden.test";
import { testItalianBc4Golden } from "./__tests__/italianBc4Golden.test";
import { testItalianC3Golden } from "./__tests__/italianC3Golden.test";
import { testItalianCastlingGolden } from "./__tests__/italianCastlingGolden.test";
import { testItalianRe1Golden } from "./__tests__/italianRe1Golden.test";
import { testKingSafetyGolden } from "./__tests__/kingSafetyGolden.test";
import { testPawnStructureGolden } from "./__tests__/pawnStructureGolden.test";
import { testPieceQualityGolden } from "./__tests__/pieceQualityGolden.test";
import { testPlainViewGolden } from "./__tests__/plainViewGolden.test";

export function testGoldenCoach(): void {
  testItalianCastlingGolden();
  testItalianBc4Golden();
  testItalianC3Golden();
  testItalianRe1Golden();
  testPawnStructureGolden();
  testKingSafetyGolden();
  testPieceQualityGolden();
  testImbalanceGolden();
  testPlainViewGolden();
  testContinuationGolden();
  testFeatureMappingGolden();
}
