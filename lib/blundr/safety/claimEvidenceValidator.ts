/**
 * claimEvidenceValidator.ts
 * v2.7.42 - Validates that strong claims are backed by evidence.
 */

const STRONG_CLAIMS = ["wins", "forces", "checkmate", "mate", "trap", "only move", "decisive", "blunder", "forced"];

export interface ClaimEvidenceInput {
  coachText: string;
  evidenceClaimIds: string[];
}

export interface ClaimEvidenceResult {
  valid: boolean;
  violations: string[];
}

export function validateClaims(input: ClaimEvidenceInput): ClaimEvidenceResult {
  const violations: string[] = [];
  const lowerText = (input.coachText || "").toLowerCase();

  for (const claim of STRONG_CLAIMS) {
    if (lowerText.includes(claim)) {
      const hasEvidence = input.evidenceClaimIds.some(id =>
        id.includes(claim) || id.includes("mate") || id.includes("check")
      );
      if (!hasEvidence) {
        violations.push(`unverified_strong_claim:${claim}`);
      }
    }
  }

  return {
    valid: violations.length === 0,
    violations,
  };
}
