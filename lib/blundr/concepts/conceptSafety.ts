import type { CoachEvidenceClaim } from "../brain/types";
import type { TeachingConcept } from "./TeachingConcept";
import { isClaimStrengthAtLeast } from "./TeachingConcept";

const STRONG_TOKENS = [
  "best",
  "strongest",
  "forced",
  "only move",
  "wins",
  "winning",
  "mate",
  "checkmate",
  "trap",
  "refutes",
  "blunder",
];

function normalizePieceType(pieceType: string | null | undefined): string {
  const v = String(pieceType ?? "").toLowerCase();
  if (v === "n") return "knight";
  if (v === "b") return "bishop";
  if (v === "r") return "rook";
  if (v === "q") return "queen";
  if (v === "k") return "king";
  if (v === "p") return "pawn";
  return v;
}

export function conceptRequiresStrongEvidence(concept: TeachingConcept): boolean {
  if (concept.requiredEvidence.minStrength === "verified") return true;
  if (concept.safety.overclaimRisk === "high") return true;
  const text = `${concept.label} ${concept.summary}`.toLowerCase();
  return STRONG_TOKENS.some((token) => text.includes(token));
}

export function conceptCanUseClaim(concept: TeachingConcept, claim: CoachEvidenceClaim): boolean {
  if (!concept.requiredEvidence.claimTypes.includes(claim.type)) {
    return false;
  }

  if (!isClaimStrengthAtLeast(claim, concept.requiredEvidence.minStrength)) {
    return false;
  }

  const requiredPieceTypes = concept.requiredEvidence.requiredPieceTypes ?? [];
  if (requiredPieceTypes.length > 0) {
    const claimPiece = normalizePieceType(claim.pieceType);
    if (!requiredPieceTypes.some((piece) => normalizePieceType(piece) === claimPiece)) {
      return false;
    }
  }

  return true;
}

export function conceptPlainTemplateLeaksTarget(input: {
  concept: TeachingConcept;
  targetSan?: string | null;
  targetUci?: string | null;
  from?: string | null;
  to?: string | null;
  pieceType?: string | null;
}): boolean {
  const template = input.concept.plainHintTemplate.template;
  const lowered = template.toLowerCase();

  const candidates = [
    input.targetSan,
    input.targetUci,
    input.from,
    input.to,
    input.pieceType,
    "{targetsan}",
    "{targetuci}",
    "{from}",
    "{to}",
    "{piece}",
  ]
    .map((token) => String(token ?? "").trim().toLowerCase())
    .filter((token) => token.length > 0);

  const tokenLeak = candidates.some((token) => lowered.includes(token));
  if (tokenLeak) return true;

  if (input.concept.plainHintTemplate.leakRisk === "high") {
    const forbiddenMatch = input.concept.plainHintTemplate.forbiddenTokens
      .map((token) => token.toLowerCase())
      .some((token) => lowered.includes(token));
    if (forbiddenMatch) return true;
  }

  return false;
}

export function explainConceptSuppression(input: {
  concept: TeachingConcept;
  reason: string;
}): string {
  return `${input.concept.id} suppressed: ${input.reason}`;
}
