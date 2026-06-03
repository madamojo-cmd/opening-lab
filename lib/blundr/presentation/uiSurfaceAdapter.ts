import type { VisibleTeachingSurface } from "./types";

export interface CoachUiModel {
  title: string;
  body: string;
  bullets: string[];
  mode: string;
  targetUci: string | null;
  targetSan: string | null;
  pieceType: string | null;
  actions: Array<{
    kind: string;
    label: string;
    enabled: boolean;
    visible: boolean;
    targetUci: string | null;
    targetSan: string | null;
  }>;
  safety: {
    allowed: boolean;
    criticalIssues: string[];
    warnings: string[];
  };
  debug: {
    source: "VisibleTeachingSurface";
    safetyAllowed: boolean;
    criticalIssues: string[];
    targetVisualUcis: Array<string | null>;
  };
}

export interface BoardVisualUiModel {
  visualRecipes: Array<{
    id: string;
    type: string;
    targetUci: string | null;
    from?: string | null;
    to?: string | null;
    squares?: string[];
    visible: boolean;
  }>;
  debug: {
    source: "VisibleTeachingSurface";
    targetVisualUcis: Array<string | null>;
  };
}

export function adaptVisibleSurfaceToCoachUi(surface: VisibleTeachingSurface): CoachUiModel {
  return {
    title: surface.copy.title,
    body: surface.copy.body,
    bullets: surface.copy.bullets,
    mode: surface.mode,
    targetUci: surface.targetUci,
    targetSan: surface.targetSan,
    pieceType: surface.pieceType,
    actions: surface.actions
      .filter((action) => action.visible)
      .map((action) => ({
        kind: action.kind,
        label: action.label,
        enabled: action.enabled,
        visible: action.visible,
        targetUci: action.targetUci,
        targetSan: action.targetSan,
      })),
    safety: {
      allowed: surface.safety.allowed,
      criticalIssues: surface.safety.criticalIssues,
      warnings: surface.safety.warnings,
    },
    debug: {
      source: "VisibleTeachingSurface",
      safetyAllowed: surface.safety.allowed,
      criticalIssues: surface.safety.criticalIssues,
      targetVisualUcis: surface.debug.targetVisualUcis,
    },
  };
}

export function adaptVisibleSurfaceToBoardVisuals(surface: VisibleTeachingSurface): BoardVisualUiModel {
  return {
    visualRecipes: surface.visuals
      .filter((visual) => visual.visible)
      .map((visual) => ({
        id: visual.id,
        type: visual.type,
        targetUci: visual.targetUci,
        from: visual.from,
        to: visual.to,
        squares: visual.squares,
        visible: visual.visible,
      })),
    debug: {
      source: "VisibleTeachingSurface",
      targetVisualUcis: surface.debug.targetVisualUcis,
    },
  };
}
