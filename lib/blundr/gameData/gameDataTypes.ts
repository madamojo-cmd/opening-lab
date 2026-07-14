import type {
  EvidenceRecord,
  LearningFinding,
  OpeningAccessDecision,
  ProviderKind,
} from "@/lib/blundr/contracts";

export type ImportJobStatus =
  | "queued"
  | "leased"
  | "running"
  | "completed"
  | "partially_completed"
  | "retryable_error"
  | "permanent_error"
  | "cancelled"
  | "dead_letter";

export type ProviderErrorCode =
  | "invalid_username"
  | "account_not_found"
  | "rate_limited"
  | "provider_unavailable"
  | "network_timeout"
  | "malformed_provider_payload"
  | "invalid_game"
  | "cancelled"
  | "lease_lost"
  | "unknown";

export type ProviderAccountRecord = {
  id: string;
  userId: string;
  provider: ProviderKind;
  username: string;
  externalPlayerId: string | null;
  verificationState:
    | "pending"
    | "verified"
    | "retryable_error"
    | "permanent_error";
  connectedAt: string;
  lastSuccessfulSyncAt: string | null;
  nextEligibleSyncAt: string | null;
  sanitizedErrorCode: ProviderErrorCode | null;
  createdAt: string;
  updatedAt: string;
};

export type ImportCursor = {
  provider: ProviderKind;
  cursor: string | null;
  requestedFrom: string;
  requestedTo: string;
  updatedAt: string;
};

export type GameImportJob = {
  id: string;
  userId: string;
  provider: ProviderKind;
  status: ImportJobStatus;
  cursor: ImportCursor;
  attemptCount: number;
  leaseOwner: string | null;
  leaseExpiresAt: string | null;
  correlationId: string;
  counts: ImportMetrics;
  errorCode: ProviderErrorCode | null;
  createdAt: string;
  updatedAt: string;
};

export type ImportMetrics = {
  fetched: number;
  accepted: number;
  duplicate: number;
  excluded: number;
  matched: number;
  gated: number;
  analyzed: number;
  findings: number;
};

export type ProviderGameRecord = {
  provider: ProviderKind;
  providerGameId: string | null;
  providerFingerprint: string | null;
  fallbackFingerprint: string;
  username: string;
  whitePlayer: string;
  blackPlayer: string;
  playedAt: string;
  result: "1-0" | "0-1" | "1/2-1/2" | "*";
  timeControl: string | null;
  rated: boolean | null;
  variant: string;
  pgn: string;
  normalizedMoves: readonly string[];
  playerColor: "white" | "black";
  classificationState: "pending" | "processed" | "excluded";
  processingVersion: string;
  classifierVersion: string;
};

export type ReplayedPly = {
  ply: number;
  fenBefore: string;
  moveUci: string;
  moveSan: string;
  sideToMove: "white" | "black";
  isPlayerMove: boolean;
};

export type OpeningSegmentRecord = {
  segmentId: string;
  gameFingerprint: string;
  openingId: string;
  repertoireSide: "white" | "black";
  firstMatchedPly: number;
  lastMatchedPly: number;
  divergencePly: number | null;
  runtimeVersion: string;
  accessState: OpeningAccessDecision;
};

export type ExtractedFinding = LearningFinding & {
  gameFingerprint: string;
  segmentId: string;
  fingerprint: string;
  evidence: EvidenceRecord;
  status: "active" | "gated_pending";
};

export type ProviderResponse<T> = {
  status: number;
  headers?: Headers;
  value?: T;
  retryAfterMs?: number;
};

export type ProviderFetch = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

export type ProviderGamePage = {
  games: readonly ProviderGameRecord[];
  nextCursor: string | null;
  notModified?: boolean;
};

export type ProviderRequestBounds = {
  from: Date;
  to: Date;
  maxGames: number;
  signal?: AbortSignal;
};

export function emptyImportMetrics(): ImportMetrics {
  return {
    fetched: 0,
    accepted: 0,
    duplicate: 0,
    excluded: 0,
    matched: 0,
    gated: 0,
    analyzed: 0,
    findings: 0,
  };
}
