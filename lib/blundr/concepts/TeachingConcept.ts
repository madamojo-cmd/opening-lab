import type { CoachEvidenceClaim } from "../brain/types";

export type ConceptFamily =
  | "opening_principle"
  | "development"
  | "center"
  | "king_safety"
  | "tactics"
  | "piece_activity"
  | "pawn_structure"
  | "space"
  | "initiative"
  | "defense"
  | "endgame"
  | "opening_specific"
  | "mistake_pattern"
  | "continuation"
  | "visual_pattern"
  | "safety_fallback";

export type ConceptEloBand =
  | "beginner"
  | "novice"
  | "intermediate"
  | "advanced"
  | "expert";

export interface TeachingConcept {
  id: string;
  label: string;
  family: ConceptFamily;
  eloBands: ConceptEloBand[];
  summary: string;

  requiredEvidence: {
    claimTypes: string[];
    minStrength: "verified" | "probable";
    requiredPieceTypes?: string[];
    requiredMoveFlags?: string[];
  };

  optionalEvidence?: {
    claimTypes?: string[];
    themeTags?: string[];
  };

  forbiddenWithoutEvidence: string[];

  plainHintTemplate: {
    leakRisk: "none" | "low" | "medium" | "high";
    template: string;
    forbiddenTokens: string[];
  };

  assistedTemplate: {
    template: string;
    requiredSlots: string[];
  };

  showMoreTemplate: {
    template: string;
    requiredSlots: string[];
  };

  visualPreferences: {
    preferArrow?: boolean;
    preferSourceHighlight?: boolean;
    preferDestinationHighlight?: boolean;
    preferPressureArrow?: boolean;
    preferKingSafetyAura?: boolean;
    preferPawnBreakMarker?: boolean;
  };

  safety: {
    allowInPlainBeforeShowMore: boolean;
    requiresBoardTruth: boolean;
    requiresEngineEvidence: boolean;
    overclaimRisk: "low" | "medium" | "high";
  };
}

export interface ActivatedTeachingConcept {
  conceptId: string;
  concept: TeachingConcept;
  evidenceClaimIds: string[];
  strength: "verified" | "probable" | "blocked";
  activationReason: string;
  suppressedReasons: string[];
  displayEligibility: {
    plainHint: boolean;
    assisted: boolean;
    showMore: boolean;
    visual: boolean;
  };
}

export type ActivationMode = "assisted" | "plain" | "show_more";

export interface ConceptClaimMatchResult {
  matched: boolean;
  matchedClaimIds: string[];
  strongestStrength: "verified" | "probable" | "blocked";
}

export function isClaimStrengthAtLeast(
  claim: CoachEvidenceClaim,
  minStrength: "verified" | "probable",
): boolean {
  if (claim.strength === "blocked") return false;
  if (minStrength === "probable") {
    return claim.strength === "verified" || claim.strength === "probable" || claim.strength === "template_safe";
  }
  return claim.strength === "verified";
}
