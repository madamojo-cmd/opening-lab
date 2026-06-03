export type TeachingSurfaceMode =
  | "assisted"
  | "plain_before_show_more"
  | "plain_after_show_more"
  | "branch_complete"
  | "opponent_replying"
  | "terminal"
  | "blocked";

export type SurfaceActionKind =
  | "show_more"
  | "hide_more"
  | "reveal_target"
  | "continue_from_here"
  | "none";

export interface VisibleSurfaceCopy {
  title: string;
  body: string;
  bullets: string[];
  leakRisk: "none" | "low" | "medium" | "high";
  source: "plain" | "assisted" | "show_more" | "fallback";
}

export interface SurfaceVisualRecipe {
  id: string;
  type:
    | "move_arrow"
    | "source_highlight"
    | "destination_highlight"
    | "pressure_arrow"
    | "king_safety_aura"
    | "pawn_break_marker"
    | "concept_square_highlight";
  targetUci: string | null;
  from?: string | null;
  to?: string | null;
  squares?: string[];
  evidenceClaimIds: string[];
  visible: boolean;
  leakRisk: "none" | "low" | "medium" | "high";
}

export interface SurfaceAction {
  kind: SurfaceActionKind;
  label: string;
  targetUci: string | null;
  targetSan: string | null;
  enabled: boolean;
  visible: boolean;
}

export interface VisibleTeachingSurface {
  frameKey: string;
  mode: TeachingSurfaceMode;
  targetUci: string | null;
  targetSan: string | null;
  pieceType: string | null;

  copy: VisibleSurfaceCopy;
  visuals: SurfaceVisualRecipe[];
  actions: SurfaceAction[];

  safety: {
    allowed: boolean;
    criticalIssues: string[];
    warnings: string[];
    originalFrameBlocked: boolean;
  };

  provenance: {
    frameKey: string;
    graphTargetUci: string | null;
    compilerVersion?: string;
    surfaceVersion: string;
  };

  debug: {
    sourceSafeFrame: boolean;
    hiddenVisualCount: number;
    actionKinds: SurfaceActionKind[];
    targetVisualUcis: Array<string | null>;
  };
}
