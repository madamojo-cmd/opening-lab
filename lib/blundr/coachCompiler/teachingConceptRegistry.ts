/**
 * teachingConceptRegistry.ts
 * v2.7.42 - Deterministic mapping from evidence claims to teaching concepts.
 * This is the single source of truth for what concepts we can talk about.
 */

export type TeachingConcept = {
  id: string;
  label: string;
  priority: number;
};

export const TEACHING_CONCEPTS: Record<string, TeachingConcept> = {
  target_development: {
    id: "target_development",
    label: "Development",
    priority: 10,
  },
  is_central_pawn_advance: {
    id: "is_central_pawn_advance",
    label: "Central Control",
    priority: 9,
  },
  controls_center: {
    id: "controls_center",
    label: "Central Control",
    priority: 8,
  },
  improves_king_safety: {
    id: "improves_king_safety",
    label: "King Safety",
    priority: 10,
  },
  is_castling: {
    id: "is_castling",
    label: "King Safety + Rook Connection",
    priority: 11,
  },
  is_capture: {
    id: "is_capture",
    label: "Capture",
    priority: 7,
  },
  gives_check: {
    id: "gives_check",
    label: "Check",
    priority: 6,
  },
  is_checkmate: {
    id: "is_checkmate",
    label: "Checkmate",
    priority: 20, // Highest - but must be evidence backed
  },
  pressures_f7: {
    id: "pressures_f7",
    label: "Pressure on f7",
    priority: 8,
  },
};

export function getConceptsFromEvidence(evidenceClaimIds: string[]): TeachingConcept[] {
  return evidenceClaimIds
    .map(id => TEACHING_CONCEPTS[id])
    .filter(Boolean)
    .sort((a, b) => b.priority - a.priority);
}
