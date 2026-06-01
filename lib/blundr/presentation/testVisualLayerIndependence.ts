import { testCoachHideDoesNotSuppressVisuals } from "./__tests__/coachHideDoesNotSuppressVisuals.test";
import { testPresentationVisualIndependence } from "./__tests__/presentationVisualIndependence.test";

export function testVisualLayerIndependence(): void {
  testPresentationVisualIndependence();
  testCoachHideDoesNotSuppressVisuals();
}
