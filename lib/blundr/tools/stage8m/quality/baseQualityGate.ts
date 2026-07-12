export interface QualityGateInput {
  proofComplete: boolean;
  explanationSpecific: boolean;
  legalFen: boolean;
  legalMove: boolean;
  proof: Record<string, unknown>;
}

export interface QualityGate {
  passes(input: QualityGateInput): boolean;
}

export function createBaseQualityGate(): QualityGate {
  return {
    passes(input: QualityGateInput) {
      return Boolean(
        input.legalFen &&
        input.legalMove &&
        input.proofComplete &&
        input.explanationSpecific &&
        Object.keys(input.proof).length >= 3,
      );
    },
  };
}
