export const TRAINING_RUNTIME_SCHEMA_VERSION = "3.99.v1" as const;
export const TRAINING_RUNTIME_PACKAGE_ID =
  "blundr-opening-runtime-3.99.v2" as const;
export const TRAINING_RUNTIME_BUILDER_VERSION =
  "blundr-training-runtime-builder-3.99.v2" as const;
export const TRAINING_RUNTIME_SOURCE = "lichess" as const;
export const TRAINING_RUNTIME_PROFILE =
  "all_blitz_rapid_classical_1200_plus" as const;
export const TRAINING_RUNTIME_MIN_TOTAL_GAMES = 500;
export const TRAINING_RUNTIME_MAX_MOVES_PER_PARENT = 8;
export const TRAINING_RUNTIME_MAX_PLY = 12;
export const TRAINING_RUNTIME_OPENING_COUNT = 21;
export const TRAINING_RUNTIME_BUILD_GIT_SHA =
  "2502653f43221050be76c46690b6a2abe4ce41cc" as const;
export const TRAINING_RUNTIME_PACKAGE_ROOT =
  "data/blundr/training-runtime/blundr-opening-runtime-3.99.v2" as const;
export const TRAINING_RUNTIME_SOURCE_FILES = {
  openingNodes: {
    fileName: "opening-nodes.v2.jsonl",
    rows: 7_498,
    sha256: "a5e6cbe34e28a5930ed466d23274c7a30b836897e8aa640b4af7c6e22c623603",
  },
  candidateMoves: {
    fileName: "candidate-moves.v2.jsonl",
    rows: 171_647,
    sha256: "aada94cbe547e6f3c12add4fa46f8b03acf936ceef5cc5eb000b46c8427adda0",
  },
} as const;
export const TRAINING_RUNTIME_FILES = {
  manifest: "manifest.json",
  nodes: "opening-book.nodes.runtime.v1.jsonl",
  candidates: "opening-book.candidates.runtime.v1.jsonl",
  openingIndex: "opening-index.runtime.v1.json",
  openingAvailability: "opening-availability.runtime.v1.json",
  checksums: "checksums.sha256",
  validationReport: "validation-report.json",
} as const;

export type RuntimeOpeningNode = {
  nodeId: string;
  openingId: string;
  playKey: string;
  playSequenceUci: string;
  ply: number;
  sideToMove: "white" | "black";
  canonicalFen?: string;
  positionKey?: string;
  displayName?: string;
  learnerPerspective?: "white" | "black";
  source?: string;
  profileId?: string;
  totalGames?: number;
  [key: string]: unknown;
};
export type RuntimeCandidateMove = {
  nodeId?: string;
  openingId: string;
  playKeyBefore: string;
  moveUci: string;
  moveSan?: string;
  totalGames?: number;
  playPct?: number;
  averageRating?: number | null;
  learnerToMove?: boolean;
  isBookCandidate?: boolean;
  blundrUse?: string;
  profileId?: string;
  source?: string;
  profiles?: string;
  sources?: string;
  rank?: number;
  ply?: number;
  [key: string]: unknown;
};
export type RuntimeRejection = {
  rowNumber: number;
  source: "opening-node" | "candidate-move";
  reason: string;
  row: unknown;
};
export type TrainingRuntimeManifest = {
  schemaVersion: typeof TRAINING_RUNTIME_SCHEMA_VERSION;
  packageId: string;
  source: typeof TRAINING_RUNTIME_SOURCE;
  sourceFiles: {
    openingNodes: RuntimeSourceFileIdentity;
    candidateMoves: RuntimeSourceFileIdentity;
  };
  openingCount: number;
  maxPly: number;
  builtAt: string;
  builderVersion: string;
  gitSha: string;
  runtimeProfile: string;
  minimumTotalGames: number;
  maximumMovesPerParent: number;
  roundingPolicy: string;
  files: Record<string, string>;
  acceptedCounts: { nodes: number; candidates: number };
  rejectedCount: number;
  transpositionGroupCount: number;
};

export type RuntimeSourceFileIdentity = {
  fileName: string;
  rows: number;
  sha256: string;
};

export type TrainingRuntimeOpeningIndex = {
  schemaVersion: typeof TRAINING_RUNTIME_SCHEMA_VERSION;
  packageId: string;
  openings: Array<{
    openingId: string;
    displayName: string;
    learnerPerspective: "white" | "black";
    rootPlayKey: "startpos";
    nodeCount: number;
    candidateCount: number;
    maximumStoredPly: number;
  }>;
};

export type TrainingRuntimeOpeningAvailability = {
  schemaVersion: typeof TRAINING_RUNTIME_SCHEMA_VERSION;
  packageId: string;
  openings: Array<{
    openingId: string;
    available: true;
    reason: "runtime_verified";
  }>;
};

export type TrainingRuntimeValidationReport = {
  schemaVersion: typeof TRAINING_RUNTIME_SCHEMA_VERSION;
  packageId: string;
  valid: true;
  sourceRows: { openingNodes: number; candidateMoves: number };
  runtimeRows: { nodes: number; candidates: number };
  openingCount: number;
  maximumStoredPly: number;
  generatedTerminalNodeCount: number;
  checks: string[];
};
