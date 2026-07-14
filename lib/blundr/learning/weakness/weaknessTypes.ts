import type {
  LearningFinding,
  LearningFindingCategory,
  OpeningAccessDecision,
  WeaknessExplanation,
  WeaknessProjection,
} from "@/lib/blundr/contracts";

export type WeaknessEvidence = {
  findingId: string;
  category: LearningFindingCategory;
  confidence: number;
  severity: LearningFinding["severity"];
  observedAt: string;
  deleted: boolean;
};
export type WeaknessRecord = WeaknessProjection & {
  userId: string;
  evidence: WeaknessEvidence[];
};
export type WeaknessProjectionInput = {
  userId: string;
  findings: readonly LearningFinding[];
  accessByPosition: ReadonlyMap<string, { decision: OpeningAccessDecision }>;
};
export type WeaknessConfidenceInput = {
  independentMisses: number;
  ambiguousEvidence: number;
  sourceCount: number;
};
export type WeaknessScoreInput = {
  confidence: number;
  severity: LearningFinding["severity"];
  recencyDays: number;
  masteryConfidence: number;
};
export type { WeaknessExplanation };
