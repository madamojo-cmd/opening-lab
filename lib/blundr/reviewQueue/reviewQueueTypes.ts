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
  positionKey: string;
  openingId: string | null;
  playKey: string | null;
  category: string;
  score: number;
  confidence: number;
  explanation: string;
  recommendedDailyIntervention: string;
  lifecycleState: ReviewQueueLifecycleState;
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

