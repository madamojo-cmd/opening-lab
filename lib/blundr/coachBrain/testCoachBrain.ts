import { testAttackMapRaycast } from "./__tests__/attackMapRaycast.test";
import { testBoardClaimValidator } from "./__tests__/boardClaimValidator.test";
import { testCoachActionResolver } from "./__tests__/coachActionResolver.test";
import { testEvidenceConditionedCopyBuilder } from "./__tests__/evidenceConditionedCopyBuilder.test";
import { testMoveFactExtractor } from "./__tests__/moveFactExtractor.test";
import { testMaiaStatus } from "./__tests__/maiaStatus.test";
import { testPortionAndThemePolicy } from "./__tests__/portionAndThemePolicy.test";

export function testCoachBrain(): void {
  testMoveFactExtractor();
  testBoardClaimValidator();
  testEvidenceConditionedCopyBuilder();
  testCoachActionResolver();
  testPortionAndThemePolicy();
  testAttackMapRaycast();
  testMaiaStatus();
}
