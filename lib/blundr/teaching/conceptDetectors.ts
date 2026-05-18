import type { TeachingEvidence } from "./evidenceCollector";
import type { TeachingConceptId } from "./teachingCueTypes";

export type DetectorConcept = {
  conceptId: TeachingConceptId;
  confidence: number;
  relevantSquares: string[];
  relevantPieces: string[];
  reason: string;
  claimSafety: "safe" | "cautious" | "speculative";
  suggestedVisuals: {
    primary?: { from: string; to: string; kind: "move" | "attack" | "defense" | "pressure" | "danger" };
    keySquares: string[];
    dangerSquares: string[];
  };
  requiresMoveRecommendation: boolean;
};

function makeConcept(partial: Omit<DetectorConcept, "suggestedVisuals"> & { suggestedVisuals?: DetectorConcept["suggestedVisuals"] }): DetectorConcept {
  return {
    ...partial,
    suggestedVisuals: partial.suggestedVisuals ?? { keySquares: [], dangerSquares: [] },
  };
}

export function detectConcepts(evidence: TeachingEvidence): DetectorConcept[] {
  const out: DetectorConcept[] = [];
  const delta = evidence.moveDelta;
  const moveFrom = delta?.from ?? evidence.expectedMoveUci?.slice(0, 2) ?? "";
  const moveTo = delta?.to ?? evidence.expectedMoveUci?.slice(2, 4) ?? "";

  const attackedLoose = evidence.tacticalThemes.find((t) => t.id === "attacked_loose_piece");
  const loose = evidence.tacticalThemes.find((t) => t.id === "loose_piece");
  const hanging = evidence.tacticalThemes.find((t) => t.id === "hanging_piece");

  if (delta?.isCapture && (loose || hanging)) {
    out.push(
      makeConcept({
        conceptId: "win_loose_piece",
        confidence: 0.82,
        relevantSquares: [moveTo].filter(Boolean),
        relevantPieces: [moveTo].filter(Boolean),
        reason: "Capture claims a loose/hanging target immediately.",
        claimSafety: "safe",
        suggestedVisuals: { primary: moveFrom && moveTo ? { from: moveFrom, to: moveTo, kind: "attack" } : undefined, keySquares: [moveTo], dangerSquares: [moveTo] },
        requiresMoveRecommendation: true,
      }),
    );
  }

  if (!delta?.isCapture && attackedLoose) {
    out.push(
      makeConcept({
        conceptId: "attack_loose_piece",
        confidence: attackedLoose.confidence,
        relevantSquares: attackedLoose.relevantSquares,
        relevantPieces: attackedLoose.relevantPieces,
        reason: attackedLoose.reason,
        claimSafety: "cautious",
        suggestedVisuals: { primary: moveFrom && moveTo ? { from: moveFrom, to: moveTo, kind: "pressure" } : undefined, keySquares: attackedLoose.relevantSquares, dangerSquares: attackedLoose.relevantSquares },
        requiresMoveRecommendation: true,
      }),
    );
  }

  if ((loose || hanging) && !delta?.isCapture && !attackedLoose) {
    const theme = loose ?? hanging;
    out.push(
      makeConcept({
        conceptId: "hanging_piece_warning",
        confidence: theme?.confidence ?? 0.62,
        relevantSquares: theme?.relevantSquares ?? [],
        relevantPieces: theme?.relevantPieces ?? [],
        reason: "A loose piece exists but immediate win is not confirmed.",
        claimSafety: "safe",
        suggestedVisuals: { keySquares: theme?.relevantSquares ?? [], dangerSquares: theme?.relevantSquares ?? [] },
        requiresMoveRecommendation: false,
      }),
    );
  }

  if (evidence.safetyWarnings.some((w) => /king/i.test(w))) {
    out.push(
      makeConcept({
        conceptId: "king_safety_first",
        confidence: 0.78,
        relevantSquares: [evidence.boardBefore.kingSquares[evidence.sideToMove]].filter((s): s is string => Boolean(s)),
        relevantPieces: [evidence.boardBefore.kingSquares[evidence.sideToMove]].filter((s): s is string => Boolean(s)),
        reason: "King safety warning is active.",
        claimSafety: "safe",
        suggestedVisuals: { keySquares: [evidence.boardBefore.kingSquares[evidence.sideToMove]].filter((s): s is string => Boolean(s)), dangerSquares: [] },
        requiresMoveRecommendation: false,
      }),
    );
  }

  if (evidence.strategicThemes.some((t) => t.id === "center_tension")) {
    out.push(
      makeConcept({
        conceptId: "center_tension",
        confidence: 0.68,
        relevantSquares: ["d4", "e4", "d5", "e5"],
        relevantPieces: [],
        reason: "Central pawn structure remains contested.",
        claimSafety: "safe",
        suggestedVisuals: { keySquares: ["d4", "e4"], dangerSquares: [] },
        requiresMoveRecommendation: false,
      }),
    );
  }

  if (evidence.strategicThemes.some((t) => t.id === "center_control")) {
    out.push(
      makeConcept({
        conceptId: "center_control",
        confidence: 0.72,
        relevantSquares: ["d4", "e4", "d5", "e5"],
        relevantPieces: [moveTo].filter(Boolean),
        reason: "Move affects central control.",
        claimSafety: "safe",
        suggestedVisuals: { primary: moveFrom && moveTo ? { from: moveFrom, to: moveTo, kind: "move" } : undefined, keySquares: [moveTo].filter(Boolean), dangerSquares: [] },
        requiresMoveRecommendation: true,
      }),
    );
  }

  if (evidence.strategicThemes.some((t) => t.id === "development_lag")) {
    out.push(
      makeConcept({
        conceptId: "development_lag",
        confidence: 0.79,
        relevantSquares: evidence.strategicThemes.find((t) => t.id === "development_lag")?.relevantSquares ?? [],
        relevantPieces: evidence.strategicThemes.find((t) => t.id === "development_lag")?.relevantPieces ?? [],
        reason: "At least one minor piece remains undeveloped.",
        claimSafety: "safe",
        suggestedVisuals: { keySquares: evidence.strategicThemes.find((t) => t.id === "development_lag")?.relevantSquares ?? [], dangerSquares: [] },
        requiresMoveRecommendation: false,
      }),
    );
  }

  if (evidence.strategicThemes.some((t) => t.id === "open_file")) {
    out.push(
      makeConcept({
        conceptId: "open_file_context",
        confidence: 0.66,
        relevantSquares: evidence.strategicThemes.find((t) => t.id === "open_file")?.relevantSquares ?? [],
        relevantPieces: [],
        reason: "Open file can be used by heavy pieces.",
        claimSafety: "safe",
        suggestedVisuals: { keySquares: evidence.strategicThemes.find((t) => t.id === "open_file")?.relevantSquares ?? [], dangerSquares: [] },
        requiresMoveRecommendation: false,
      }),
    );
  }

  if (evidence.phase === "endgame") {
    out.push(
      makeConcept({
        conceptId: "king_activity",
        confidence: 0.72,
        relevantSquares: [evidence.boardBefore.kingSquares[evidence.sideToMove]].filter((s): s is string => Boolean(s)),
        relevantPieces: [evidence.boardBefore.kingSquares[evidence.sideToMove]].filter((s): s is string => Boolean(s)),
        reason: "Endgame activity is central.",
        claimSafety: "safe",
        suggestedVisuals: { keySquares: [evidence.boardBefore.kingSquares[evidence.sideToMove]].filter((s): s is string => Boolean(s)), dangerSquares: [] },
        requiresMoveRecommendation: false,
      }),
    );
  }

  if (evidence.boardBefore.pawnStructure.passedPawns[evidence.sideToMove].length > 0) {
    out.push(
      makeConcept({
        conceptId: "passed_pawn",
        confidence: 0.7,
        relevantSquares: evidence.boardBefore.pawnStructure.passedPawns[evidence.sideToMove].slice(0, 2),
        relevantPieces: evidence.boardBefore.pawnStructure.passedPawns[evidence.sideToMove].slice(0, 2),
        reason: "Passed pawn can become a plan anchor.",
        claimSafety: "safe",
        suggestedVisuals: { keySquares: evidence.boardBefore.pawnStructure.passedPawns[evidence.sideToMove].slice(0, 2), dangerSquares: [] },
        requiresMoveRecommendation: false,
      }),
    );
  }

  if (!out.length) {
    out.push(
      makeConcept({
        conceptId: "context_only",
        confidence: 0.45,
        relevantSquares: [moveTo].filter(Boolean),
        relevantPieces: [],
        reason: "No stronger conservative concept was found.",
        claimSafety: "safe",
        suggestedVisuals: { keySquares: [moveTo].filter(Boolean), dangerSquares: [] },
        requiresMoveRecommendation: false,
      }),
    );
  }

  return out;
}
