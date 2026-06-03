export interface VisualRecipe {
  frameKey: string;
  targetUci: string | null;
  intents: Array<{
    id: string;
    type: string;
    targetUci: string;
    from?: string;
    to?: string;
    squares?: string[];
    evidenceClaimIds: string[];
  }>;
}

export interface VisibleActionPolicy {
  showHint: boolean;
  showMore: boolean;
  revealMove: boolean;
  continueFromHere: boolean;
  disabledReasons: Record<string, string>;
}

export interface VisibleTeachingSurface {
  frameKey: string;
  owner: "compiled_coach_surface" | "safe_fallback_surface" | "terminal_surface" | "transition_surface";
  targetUci: string | null;
  displayMode: "assisted" | "plain" | "terminal" | "blocked";
  coachCard: {
    title: string;
    body: string;
    showMore?: {
      title: string;
      body: string;
    };
  } | null;
  plainHint: string | null;
  revealAction: {
    kind: "none" | "reveal_move";
    targetUci: string | null;
    label?: string;
  } | null;
  visualRecipe: VisualRecipe | null;
  actionPolicy: VisibleActionPolicy;
  safety: {
    allowed: boolean;
    criticalIssues: string[];
    blockedReasons: string[];
  };
  debug: Record<string, unknown>;
}
