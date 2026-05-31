import { testCoachHideDoesNotSuppressVisuals } from "./__tests__/coachHideDoesNotSuppressVisuals.test";
import { testPhaseActionGating } from "./__tests__/phaseActionGating.test";
import { testPresentationLegacySuppression } from "./__tests__/presentationLegacySuppression.test";
import { testPresentationVisualIndependence } from "./__tests__/presentationVisualIndependence.test";
import { testTrainerPresentationFrame } from "./__tests__/trainerPresentationFrame.test";

export function testPresentationFrame(): void {
  testTrainerPresentationFrame();
  testPhaseActionGating();
  testPresentationVisualIndependence();
  testPresentationLegacySuppression();
  testCoachHideDoesNotSuppressVisuals();
}
