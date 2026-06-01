import { testCoachHideSurface } from "./__tests__/coachHideSurface.test";
import { testCoachSurfacePolicy } from "./__tests__/coachSurfacePolicy.test";
import { testLegacyCueSuppression } from "./__tests__/legacyCueSuppression.test";
import { testMoveImpactPresenter } from "./__tests__/moveImpactPresenter.test";

export function testCoachSurface(): void {
  testCoachSurfacePolicy();
  testMoveImpactPresenter();
  testCoachHideSurface();
  testLegacyCueSuppression();
}
