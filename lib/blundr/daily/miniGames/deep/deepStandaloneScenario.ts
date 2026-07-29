import type { DeepMiniGameScenario } from "./deepMiniGameTypes";
import { validateDeepMiniGameScenario } from "./deepMiniGameValidator";
import { selectEngineCertifiedDeepScenario } from "./engineCertifiedCatalog";
import type { DeepMiniGameId } from "./deepMiniGameTypes";

export function getDeepStandaloneScenario(
  id: DeepMiniGameId,
  selectionSeed: string,
): DeepMiniGameScenario | null {
  const scenario = selectEngineCertifiedDeepScenario(id, selectionSeed);
  if (!scenario) return null;
  return validateDeepMiniGameScenario(scenario).ok ? scenario : null;
}
