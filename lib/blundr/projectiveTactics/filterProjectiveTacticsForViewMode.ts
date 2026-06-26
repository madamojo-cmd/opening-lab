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

export function resolveProjectiveTacticDisplay(input: {
  enabled: boolean;
  viewMode: "assisted" | "plain" | string;
  visuals: ProjectiveTacticVisual[];
  showLines: boolean;
  showLabels: boolean;
}): {
  visuals: ProjectiveTacticVisual[];
  showLines: boolean;
  showLabels: boolean;
  shouldRender: boolean;
} {
  const visuals = filterProjectiveTacticsForViewMode(input);
  const showLines = input.enabled && input.showLines && visuals.length > 0;
  const showLabels = input.enabled && input.showLabels && visuals.length > 0;
  return {
    visuals,
    showLines,
    showLabels,
    shouldRender: visuals.length > 0 && (showLines || showLabels),
  };
}
