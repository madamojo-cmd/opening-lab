export const CRAWL_BUNDLE_SOURCE = "stage2-lichess-stepdown" as const;

export const UCI_LIKE_REGEX = /^[a-h][1-8][a-h][1-8][qrbn]?$/;

export interface ValidationIssue {
  code: string;
  message: string;
  path?: string;
}

export interface CanonicalOpeningNode {
  openingId: string;
  nodeKey: string;
  ply: number;
  fen?: string;
  fen4?: string;
  movePathUci?: string[];
  movePathSan?: string[];
  parentNodeKey?: string | null;
  sourceGroup?: "first8" | "other13" | "merged" | string;
  [key: string]: unknown;
}

export interface CanonicalCandidateMove {
  openingId: string;
  nodeKey: string;
  moveUci: string;
  moveSan?: string;
  rank?: number;
  games?: number;
  white?: number;
  draws?: number;
  black?: number;
  childNodeKey?: string | null;
  sourceGroup?: "first8" | "other13" | "merged" | string;
  [key: string]: unknown;
}

export interface CanonicalCrawlBundle {
  version: string;
  generatedAt?: string;
  source: typeof CRAWL_BUNDLE_SOURCE;
  openingIds: string[];
  nodes: CanonicalOpeningNode[];
  candidateMoves: CanonicalCandidateMove[];
  [key: string]: unknown;
}

export interface CrawlBundleValidationResult {
  ok: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  summary: {
    openingCount: number;
    nodeCount: number;
    candidateMoveCount: number;
    duplicateNodeCount: number;
    duplicateCandidateCount: number;
    missingOpeningReferenceCount: number;
  };
}
