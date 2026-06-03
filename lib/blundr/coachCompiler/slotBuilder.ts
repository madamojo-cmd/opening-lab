import type { EvidenceGraph } from "../brain/types";
import type { ActivatedTeachingConcept } from "../concepts/TeachingConcept";
import type { CurrentInstructionFrame } from "../runtime/currentInstructionFrame";
import type { CoachTemplateSlots } from "./types";
import { getSafeMoveVerb } from "./copyPolicy";

function normalizePieceLabel(pieceType: string | null): string | null {
  const piece = String(pieceType ?? "").toLowerCase();
  if (piece === "p" || piece === "pawn") return "pawn";
  if (piece === "n" || piece === "knight") return "knight";
  if (piece === "b" || piece === "bishop") return "bishop";
  if (piece === "r" || piece === "rook") return "rook";
  if (piece === "q" || piece === "queen") return "queen";
  if (piece === "k" || piece === "king") return "king";
  return piece || null;
}

export function buildCoachTemplateSlots(input: {
  frame: CurrentInstructionFrame;
  graph: EvidenceGraph;
  activatedConcepts: ActivatedTeachingConcept[];
}): CoachTemplateSlots {
  const target = input.frame.target;
  const claimTypes = input.graph.claims.map((claim) => claim.type);

  return {
    targetUci: target?.uci ?? null,
    targetSan: target?.san ?? null,
    pieceType: normalizePieceLabel(target?.pieceType ?? null),
    pieceLabel: normalizePieceLabel(target?.pieceType ?? null),
    from: target?.from ?? null,
    to: target?.to ?? null,
    moveVerb: getSafeMoveVerb({ pieceType: normalizePieceLabel(target?.pieceType ?? null), evidenceClaimTypes: claimTypes }),
    conceptLabels: input.activatedConcepts.map((concept) => concept.concept.label),
    evidenceSummaries: input.graph.claims.slice(0, 4).map((claim) => claim.textSafeSummary),
    openingName: input.graph.openingContext.openingName,
    lineName: input.graph.openingContext.lineName,
  };
}
