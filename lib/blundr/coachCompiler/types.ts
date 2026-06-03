import type { ActivatedTeachingConcept } from "../concepts/TeachingConcept";

export interface CoachTemplateSlots {
  targetUci: string | null;
  targetSan: string | null;
  pieceType: string | null;
  pieceLabel: string | null;
  from: string | null;
  to: string | null;
  moveVerb: string;
  conceptLabels: string[];
  evidenceSummaries: string[];
  openingName?: string | null;
  lineName?: string | null;
}

export interface CompiledCoachTextBlock {
  title: string;
  body: string;
  bullets: string[];
  evidenceClaimIds: string[];
  leakRisk: "none" | "low" | "medium" | "high";
}

export interface CompiledCoachVisualIntent {
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
  displayModes: Array<"assisted" | "show_more">;
  leakRisk: "none" | "low" | "medium" | "high";
}

export interface CompiledRevealAction {
  kind: "reveal_target" | "continue_from_here" | "none";
  label: string;
  targetUci: string | null;
  targetSan: string | null;
}

export interface CompiledCoachFrame {
  frameKey: string;
  targetUci: string | null;
  targetSan: string | null;
  pieceType: string | null;
  from: string | null;
  to: string | null;

  plain: CompiledCoachTextBlock;
  assisted: CompiledCoachTextBlock;
  showMore: CompiledCoachTextBlock;

  activatedConceptIds: string[];
  evidenceClaimIds: string[];

  visualIntents: CompiledCoachVisualIntent[];
  revealAction: CompiledRevealAction;

  safetyPrecheck: {
    criticalIssues: string[];
    warnings: string[];
  };

  provenance: {
    frameKey: string;
    graphTargetUci: string | null;
    compilerVersion: string;
  };

  debug: {
    nullTargetReason?: string;
    suppressedConceptIds: string[];
    slotKeys: string[];
  };
}

export interface CompileCoachFrameInput {
  frame: import("../runtime/currentInstructionFrame").CurrentInstructionFrame;
  graph: import("../brain/types").EvidenceGraph;
  activatedConcepts: ActivatedTeachingConcept[];
  suppressedConceptIds?: string[];
}
