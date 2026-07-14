/** Versioned cross-layer contracts. Keep server-only answers out of these browser-safe types. */

export const BLUNDR_CONTRACT_VERSION = "2026-07-13.v1" as const;
export const BLUNDR_CONTENT_VERSION = "stage2-approved-content-v1" as const;
export const BLUNDR_RUNTIME_VERSION = "stage2-21-opening-stepdown-runtime-v1" as const;
export const BLUNDR_CLASSIFIER_VERSION = "weakness-classifier-v1" as const;

export type EventId = string & { readonly __brand: "EventId" };
export type AttemptId = string & { readonly __brand: "AttemptId" };
export type SessionId = string & { readonly __brand: "SessionId" };
export type DeckFingerprint = string & { readonly __brand: "DeckFingerprint" };
export type CardFingerprint = string & { readonly __brand: "CardFingerprint" };

export type PositionIdentity = {
  positionKey: string;
  canonicalFen: string;
  openingId: string | null;
  expectedMoveUci: string | null;
  repertoireSide: "white" | "black" | "unknown";
  moveOrderKey: string | null;
  runtimePackageVersion: string;
};

export type IdentityInput = {
  canonicalFen: string;
  openingId?: string | null;
  expectedMoveUci?: string | null;
  repertoireSide?: PositionIdentity["repertoireSide"];
  moveOrderKey?: string | null;
  runtimePackageVersion?: string;
};

function text(value: unknown): string {
  return String(value ?? "").trim();
}

function stableHash(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function createPositionIdentity(input: IdentityInput): PositionIdentity {
  const identity: PositionIdentity = {
    positionKey: "",
    canonicalFen: text(input.canonicalFen),
    openingId: text(input.openingId) || null,
    expectedMoveUci: text(input.expectedMoveUci) || null,
    repertoireSide: input.repertoireSide ?? "unknown",
    moveOrderKey: text(input.moveOrderKey) || null,
    runtimePackageVersion: text(input.runtimePackageVersion) || BLUNDR_RUNTIME_VERSION,
  };
  const masteryKey = [identity.canonicalFen, identity.openingId ?? "", identity.repertoireSide].join("|");
  identity.positionKey = `pos-${stableHash(masteryKey)}`;
  return identity;
}

export function createDeterministicIdentity(prefix: string, parts: readonly unknown[]): string {
  return `${prefix}-${stableHash(parts.map((part) => text(part)).join("\u001f"))}`;
}

export type LearningEventTaxonomy =
  | "position_seen"
  | "move_attempted"
  | "move_correct"
  | "move_incorrect"
  | "cue_revealed"
  | "continuation_completed"
  | "daily_answered"
  | "daily_revealed"
  | "daily_retried"
  | "finding_recorded";

export type LearningFindingCategory =
  | "opening_move"
  | "move_order"
  | "tactical_miss"
  | "piece_placement"
  | "king_safety"
  | "pawn_structure"
  | "time_pressure"
  | "unknown";

export type EvidenceRecord = {
  source: "train" | "daily" | "review" | "imported_game" | "system";
  sourceId: string;
  observedAt: string;
  firstAttempt: boolean;
  metadata?: Readonly<Record<string, string | number | boolean | null>>;
};

export type LearningFinding = {
  findingId: string;
  position: PositionIdentity;
  category: LearningFindingCategory;
  confidence: number;
  severity: "low" | "medium" | "high";
  source: EvidenceRecord;
  explanation: string;
  recommendedDailyIntervention: "review_position" | "recall_move" | "none";
};

export type LearningEventV2 = {
  schemaVersion: typeof BLUNDR_CONTRACT_VERSION;
  eventId: EventId;
  attemptId: AttemptId | null;
  sessionId: SessionId;
  userId: string;
  occurredAt: string;
  taxonomy: LearningEventTaxonomy;
  position: PositionIdentity | null;
  finding: LearningFinding | null;
  firstAttempt: boolean;
  idempotencyKey: string;
  source: EvidenceRecord["source"];
  contentVersion: string;
  classifierVersion: string;
  deletedAt: string | null;
};

export type OpeningAccessDecision = "active" | "gated_pending" | "revoked" | "unknown";

export type OpeningAccessSnapshot = {
  openingId: string;
  repertoireSide: "white" | "black";
  decision: OpeningAccessDecision;
  checkedAt: string;
  authorityVersion: string;
  expiresAt: string | null;
};

export type DailyActivityLifecycle = "eligibility" | "build" | "validate" | "advance" | "reveal";
export type DailyReducerResult = "accepted" | "rejected" | "revealed" | "retry_recorded" | "already_committed" | "conflict";

export type DailyActivityDefinition = {
  activityId: string;
  version: string;
  lifecycle: readonly DailyActivityLifecycle[];
  build: (input: unknown) => unknown;
  validate: (input: unknown) => unknown;
  advance: (input: unknown) => unknown;
  reveal: (input: unknown) => unknown;
};

export type DailyCardIdentity = {
  deckFingerprint: DeckFingerprint;
  cardFingerprint: CardFingerprint;
  positionKey: string;
  activityId: string;
};

export type DailyResumableStateEnvelope<TState = unknown> = {
  schemaVersion: typeof BLUNDR_CONTRACT_VERSION;
  sessionId: SessionId;
  dateKey: string;
  state: TState;
  stateFingerprint: string;
  updatedAt: string;
};

export type DailyPresentationModel = {
  schemaVersion: typeof BLUNDR_CONTRACT_VERSION;
  card: DailyCardIdentity;
  title: string;
  prompt: string;
  positionFen: string;
  openingLabel: string | null;
  feedback: null | { kind: "correct" | "incorrect" | "revealed"; message: string };
  state: "unanswered" | "committed" | "revealed" | "retry";
};

export type ProviderKind = "chesscom" | "lichess";
export type ProviderErrorKind = "retryable" | "permanent" | "sanitized_unknown";
export type ProviderAccount = { provider: ProviderKind; externalUserId: string; username: string; connectedAt: string };
export type NormalizedExternalGame = { provider: ProviderKind; externalGameId: string; playedAt: string; moves: readonly string[]; deletedAt: string | null };
export type ImportCursor = { provider: ProviderKind; cursor: string | null; updatedAt: string };
export type ImportJob = { jobId: string; provider: ProviderKind; status: "queued" | "running" | "completed" | "failed"; cursor: string | null; error: ProviderErrorKind | null };

export type NodeMasteryReadModel = { positionKey: string; attempts: number; firstAttemptAt: string | null; firstAttemptResult: "correct" | "incorrect" | "revealed" | null; confidence: number; updatedAt: string };
export type WeaknessProjection = { positionKey: string; category: LearningFindingCategory; score: number; confidence: number; explanation: string; recommendedDailyIntervention: LearningFinding["recommendedDailyIntervention"]; access: OpeningAccessDecision };
export type WeaknessExplanation = Pick<WeaknessProjection, "positionKey" | "explanation" | "recommendedDailyIntervention">;
export type RuntimeContentManifest = { packageId: string; version: string; checksum: string; generatedAt: string; acceptedCount: number; rejectedCount: number };
export type RejectionReport = { source: string; rowNumber: number; reason: string };
export type TelemetryEventName = "learning_event_recorded" | "daily_card_reserved" | "daily_attempt_committed" | "opening_access_denied";

export type FeatureFlagName = "learning_core_v2" | "weakness_engine" | "opening_access_v2" | "daily_core_v2" | "provider_ingestion" | "mixed_test";
export const FEATURE_FLAGS: Readonly<Record<FeatureFlagName, boolean>> = {
  learning_core_v2: false,
  weakness_engine: false,
  opening_access_v2: false,
  daily_core_v2: false,
  provider_ingestion: false,
  mixed_test: false,
};

export function isFailClosedAccess(snapshot: OpeningAccessSnapshot | null | undefined, now = Date.now()): boolean {
  if (!snapshot || snapshot.decision !== "active") return true;
  if (!snapshot.checkedAt || (snapshot.expiresAt && Date.parse(snapshot.expiresAt) <= now)) return true;
  return false;
}

export function serializeContract<T extends { schemaVersion: string }>(value: T): string {
  return JSON.stringify(value);
}

export function parseVersionedContract<T extends { schemaVersion: string }>(raw: string, expectedVersion = BLUNDR_CONTRACT_VERSION): T {
  const parsed: unknown = JSON.parse(raw);
  if (!parsed || typeof parsed !== "object" || (parsed as { schemaVersion?: unknown }).schemaVersion !== expectedVersion) {
    throw new Error(`unsupported_contract_version:${expectedVersion}`);
  }
  return parsed as T;
}

export function hasSolutionBearingFields(value: unknown): boolean {
  if (value === null || typeof value !== "object") return false;
  if (Array.isArray(value)) return value.some(hasSolutionBearingFields);
  return Object.entries(value as Record<string, unknown>).some(([key, child]) =>
    ["acceptedMoves", "correctCandidateIndex", "correctSquares", "expectedMoveUci", "expectedMoveSan", "solution", "targetAnswer", "correctSquareKeys"].includes(key) || hasSolutionBearingFields(child),
  );
}
