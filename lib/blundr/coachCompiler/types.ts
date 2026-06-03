export interface TeachingConcept {
  id: string;
  label: string;
  family:
    | "development"
    | "center"
    | "king_safety"
    | "tactics"
    | "pawn_structure"
    | "piece_activity"
    | "initiative"
    | "prophylaxis"
    | "opening_theory"
    | "calculation"
    | "endgame_transition"
    | "human_mistake"
    | "defense"
    | "attack"
    | "conversion";
  eloBand: "beginner" | "intermediate" | "club" | "advanced_club";
  requiredEvidence: string[];
  optionalEvidence: string[];
  forbiddenWithoutEvidence: string[];
}

export interface VisualIntent {
  id: string;
  frameKey: string;
  targetUci: string;
  type:
    | "move_arrow"
    | "source_highlight"
    | "destination_highlight"
    | "pressure_arrow"
    | "weak_square_highlight"
    | "king_safety_zone"
    | "file_control"
    | "diagonal_control"
    | "future_plan_ghost";
  from?: string;
  to?: string;
  squares?: string[];
  evidenceClaimIds: string[];
  displayModes: ("assisted" | "plain")[];
  leakRisk: "none" | "low" | "high";
}

export interface RevealAction {
  kind: "none" | "reveal_move";
  targetUci: string | null;
  label?: string;
}

export interface CompiledCoachFrame {
  frameKey: string;
  targetUci: string;
  targetSan?: string;
  targetPieceType: string;
  primaryConcept: TeachingConcept | null;
  secondaryConcepts: TeachingConcept[];
  evidenceUsed: string[];
  plain: {
    hint: string;
    showMoreAvailable: boolean;
    leakRisk: "none" | "low" | "blocked";
  };
  assisted: {
    title: string;
    body: string;
  };
  showMore: {
    title: string;
    body: string;
  };
  visualIntents: VisualIntent[];
  revealAction: RevealAction;
  safety: {
    allowed: boolean;
    blockedReasons: string[];
    warningReasons: string[];
  };
  provenance: string[];
  debug: Record<string, unknown>;
}

export interface GroundedPhrasingInput {
  targetUci: string;
  approvedClaimIds: string[];
  allowedTerms: string[];
  forbiddenTerms: string[];
  draftPlainHint: string;
  draftAssisted: string;
  draftShowMore: string;
}

export interface GroundedPhrasingOutput {
  plainHint: string;
  assisted: string;
  showMore: string;
  usedClaimIds: string[];
  introducedUnsupportedClaim: boolean;
}
