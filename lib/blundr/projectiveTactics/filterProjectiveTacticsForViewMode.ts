import type { ProjectiveTacticVisual } from "./projectiveTacticTypes";

export function filterProjectiveTacticsForViewMode(input: {
  enabled: boolean;
  viewMode: "assisted" | "plain" | string;
  visuals: ProjectiveTacticVisual[];
}): ProjectiveTacticVisual[] {
  if (!input.enabled) return [];
  if (input.viewMode !== "assisted") return [];
  return input.visuals.filter((visual) => visual.confidence === "high");
}
