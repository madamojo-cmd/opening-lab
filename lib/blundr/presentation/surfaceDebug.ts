import type { VisibleTeachingSurface } from "./types";

export function buildSurfaceDebug(input: {
  surface: VisibleTeachingSurface;
}): VisibleTeachingSurface["debug"] {
  const targetVisualUcis = input.surface.visuals.map((visual) => visual.targetUci);
  return {
    sourceSafeFrame: true,
    hiddenVisualCount: input.surface.visuals.filter((visual) => !visual.visible).length,
    actionKinds: input.surface.actions.map((surfaceAction) => surfaceAction.kind),
    targetVisualUcis,
  };
}
