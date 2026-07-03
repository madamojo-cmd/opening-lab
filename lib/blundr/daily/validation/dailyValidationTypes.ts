import type { DailyConceptId } from "../concepts/dailyConceptTypes";
import type { DailyBlundrDifficulty } from "../dailyBlundrTypes";

export type DailyValidationSeverity = "info" | "warning" | "error";

export type DailyValidationCategory =
  | "fen"
  | "concept"
  | "card"
  | "mini_game"
  | "training_target"
  | "novelty"
  | "difficulty"
  | "coverage"
  | "registry";

export type DailyValidationIssue = {
  id: string;
  severity: DailyValidationSeverity;
  category: DailyValidationCategory;
  code: string;
  message: string;
  path?: string;
  itemId?: string;
  conceptId?: string;
  fen?: string;
  suggestion?: string;
};

export type DailyValidationResult = {
  valid: boolean;
  issues: DailyValidationIssue[];
};

export type DailyValidationIssueCounts = Record<DailyValidationSeverity, number>;

export type DailyCoverageBucket = {
  key: string;
  label: string;
  count: number;
  percentage?: number;
};

export type DailyValidationSurface = "recall" | "mini_game" | "training_target" | "future_content_bank";

export type DailyValidationContentItem = {
  id: string;
  kind?: string | null;
  difficulty?: DailyBlundrDifficulty | string | null;
  conceptIds?: readonly DailyConceptId[] | null;
  primaryConceptId?: DailyConceptId | null;
  conceptMasteryKeys?: readonly string[] | null;
  noveltyKey?: string | null;
  formationHash?: string | null;
  fen?: string | null;
  source?: string | null;
  currentMastery?: number | null;
  masteryConfidence?: number | null;
};

export type DailyValidationSummary = {
  issueCount: number;
  errorCount: number;
  warningCount: number;
  infoCount: number;
};

export type DailyValidationIssueSummary = DailyValidationSummary & {
  byCategory: Record<DailyValidationCategory, number>;
  topErrors: DailyValidationIssue[];
  topWarnings: DailyValidationIssue[];
};

export type DailyCoverageReport = {
  generatedAt: string;
  valid: boolean;
  summary: {
    issueCount: number;
    errorCount: number;
    warningCount: number;
    conceptCount: number;
    miniGameCount: number;
    trainingTargetCount: number;
  };
  conceptCoverage: DailyCoverageBucket[];
  difficultyCoverage: DailyCoverageBucket[];
  surfaceCoverage: DailyCoverageBucket[];
  noveltyCoverage: DailyCoverageBucket[];
  issues: DailyValidationIssue[];
};

export type DailyValidationReportInput = {
  generatedAt?: string;
  items: readonly DailyValidationContentItem[];
  issues?: readonly DailyValidationIssue[];
};
