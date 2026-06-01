import { testAttackMap } from "./__tests__/attackMap.test";
import { testColorComplex } from "./__tests__/colorComplex.test";
import { testDirectionUtils } from "./__tests__/directionUtils.test";
import { testFenBoardParser } from "./__tests__/fenBoardParser.test";
import { testKingZone } from "./__tests__/kingZone.test";
import { testLegalMoveUtils } from "./__tests__/legalMoveUtils.test";
import { testMaterialUtils } from "./__tests__/materialUtils.test";
import { testMobilityMap } from "./__tests__/mobilityMap.test";
import { testPawnGeometry } from "./__tests__/pawnGeometry.test";
import { testRayGeometry } from "./__tests__/rayGeometry.test";
import { testSquareUtils } from "./__tests__/squareUtils.test";

export function testGeometry(): void {
  testSquareUtils();
  testDirectionUtils();
  testFenBoardParser();
  testLegalMoveUtils();
  testAttackMap();
  testMobilityMap();
  testRayGeometry();
  testColorComplex();
  testMaterialUtils();
  testPawnGeometry();
  testKingZone();
}
