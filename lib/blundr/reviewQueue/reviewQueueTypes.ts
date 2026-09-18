export type ReviewQueueLifecycleState =
  | "active"
  | "remediating"
  | "resolved"
  | "legacy_unclassified";

export type ReviewQueueSyncState =
  | "ready"
  | "empty"
  | "stale"
  | "partial"
  | "unavailable";

export type ReviewQueueItem = {
  /** Durable server-owned identity for the queued mistake. */
  mistakeId: string;
  positionKey: string;
  openingId: string | null;
  playKey: string | null;
  repertoireSide: "white" | "black" | "unknown";
  category: string;
  score: number;
  confidence: number;
  explanation: string;
  recommendedDailyIntervention: string;
  lifecycleState: ReviewQueueLifecycleState;
  missCount: number;
  lastMissedAt: string | null;
  updatedAt: string;
};

export type ReviewQueuePage = {
  syncState: ReviewQueueSyncState;
  generatedAt: string;
  lastSyncAt: string | null;
  page: number;
  limit: number;
  nextPage: number | null;
  items: ReviewQueueItem[];
  warnings: string[];
};

export type ReviewQueueError =
  | "authentication_required"
  | "invalid_request"
  | "feature_disabled"
  | "persistence_unavailable"
  | "query_failed";
