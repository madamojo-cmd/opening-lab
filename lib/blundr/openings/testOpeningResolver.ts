import { testBranchResolver } from "./__tests__/branchResolver.test";
import { testExpectedMoveResolver } from "./__tests__/expectedMoveResolver.test";
import { testGuidedCoveragePolicy } from "./__tests__/guidedCoveragePolicy.test";
import { testOpeningFamilyPlanFallback } from "./__tests__/openingFamilyPlanFallback.test";
import { testOpeningTree } from "./__tests__/openingTree.test";
import { testTranspositionMatcher } from "./__tests__/transpositionMatcher.test";

export function testOpeningResolver(): void {
  testOpeningTree();
  testExpectedMoveResolver();
  testGuidedCoveragePolicy();
  testBranchResolver();
  testTranspositionMatcher();
  testOpeningFamilyPlanFallback();
}
