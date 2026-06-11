import type { ValidationIssue } from "./crawlBundleSchema";

export const COPY_BUNDLE_SOURCE = "stage2-copy-content-package" as const;

export type CopyDifficulty = "beginner" | "intermediate" | "advanced";
export type CopySurface = "assisted" | "plain_hint" | "plain_show_more" | "review";
export type CopyStatus = "draft" | "approved" | "disabled";

export interface CopyEntry {
  entryId: string;
  openingId?: string;
  lineId?: string;
  nodeKey?: string;
  moveUci?: string;
  conceptId?: string;
  difficulty?: CopyDifficulty;
  surface?: CopySurface;
  title?: string;
  body?: string;
  hint?: string;
  visualRecipeRefs?: string[];
  evidenceIds?: string[];
  status?: CopyStatus;
  [key: string]: unknown;
}

export interface CopyBundle {
  version: string;
  generatedAt?: string;
  locale: string;
  source: typeof COPY_BUNDLE_SOURCE;
  entries: CopyEntry[];
  [key: string]: unknown;
}

export interface CopyBundleValidationResult {
  ok: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  summary: {
    entryCount: number;
    approvedCount: number;
    draftCount: number;
    disabledCount: number;
    placeholderIssueCount: number;
    internalLabelIssueCount: number;
  };
}

export type { ValidationIssue };
