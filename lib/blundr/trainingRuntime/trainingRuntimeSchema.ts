export const TRAINING_RUNTIME_SCHEMA_VERSION = "training-runtime-v1" as const;
export type RuntimeOpeningNode = {
  nodeId: string;
  openingId: string;
  playKey: string;
  playSequenceUci: string;
  ply: number;
  sideToMove: "white" | "black";
  source?: string;
  profileId?: string;
  totalGames?: number;
  [key: string]: unknown;
};
export type RuntimeCandidateMove = {
  openingId: string;
  playKeyBefore: string;
  moveUci: string;
  totalGames?: number;
  playPct?: number;
  profiles?: string;
  sources?: string;
  rank?: number;
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
  sourceVersion: string;
  generatedAt: string;
  checksums: Record<string, string>;
  acceptedCounts: { nodes: number; candidates: number };
  rejectedCount: number;
  transpositionGroupCount: number;
};
