import {
  BLUNDR_CONTRACT_VERSION,
  createDeterministicIdentity,
  hasSolutionBearingFields,
} from "@/lib/blundr/contracts";

export type ActivityLifecycleState =
  | "ready"
  | "in_progress"
  | "submitted"
  | "feedback"
  | "completed"
  | "revealed"
  | "invalid_content";

export type ActivityRejectionReason =
  | "locked_access"
  | "stale_access"
  | "missing_approved_content"
  | "illegal_move"
  | "ambiguous_accepted_set"
  | "unstable_engine_result"
  | "missing_route_equality"
  | "unsupported_objective"
  | "deleted_evidence"
  | "schema_version_mismatch"
  | "invalid_content";

export type ActivityEvidence = {
  source:
    | "approved_content"
    | "runtime"
    | "imported_game"
    | "continuation"
    | "engine"
    | "maia";
  sourceId: string;
  version: string;
  confidence: number;
  verified: boolean;
  observedAt: string;
};

export type ActivityRejection = {
  ok: false;
  reason: ActivityRejectionReason;
  message: string;
};

export type ActivityBuildOk<TSolution> = {
  ok: true;
  activityId: string;
  schemaVersion: typeof BLUNDR_CONTRACT_VERSION;
  generatorVersion: string;
  validatorVersion: string;
  cardFingerprint: string;
  positionKey: string;
  openingId: string;
  side: "white" | "black";
  evidence: readonly ActivityEvidence[];
  solution: TSolution;
};

export type ActivityBuildResult<TSolution> =
  | ActivityBuildOk<TSolution>
  | ActivityRejection;

export type AnswerSafeActivityPresentation = {
  schemaVersion: typeof BLUNDR_CONTRACT_VERSION;
  activityId: string;
  cardFingerprint: string;
  positionKey: string;
  positionFen: string;
  prompt: string;
  state: ActivityLifecycleState;
  options?: readonly { id: string; label: string }[];
  feedback: null | {
    kind: "correct" | "incorrect" | "revealed";
    message: string;
  };
};

export function rejection(
  reason: ActivityRejectionReason,
  message: string,
): ActivityRejection {
  return { ok: false, reason, message };
}

export function buildActivityIdentity(
  activityId: string,
  positionKey: string,
  sourceId: string,
): string {
  return createDeterministicIdentity("daily-activity", [
    activityId,
    positionKey,
    sourceId,
  ]);
}

export function validateAnswerSafePresentation(
  presentation: unknown,
): string[] {
  return hasSolutionBearingFields(presentation)
    ? ["solution_field_exposed"]
    : [];
}

export function isActiveAccess(
  access:
    | { decision: string; checkedAt: string; expiresAt: string | null }
    | null
    | undefined,
  now = Date.now(),
): boolean {
  return Boolean(
    access &&
      access.decision === "active" &&
      Date.parse(access.checkedAt) <= now &&
      (!access.expiresAt || Date.parse(access.expiresAt) > now),
  );
}

export type ActivityAttemptState = {
  state: ActivityLifecycleState;
  firstAttempt: "correct" | "incorrect" | "reveal" | null;
  firstAttemptRecordedAt: string | null;
  retryCount: number;
  feedback: string | null;
};

export function createActivityAttemptState(): ActivityAttemptState {
  return {
    state: "ready",
    firstAttempt: null,
    firstAttemptRecordedAt: null,
    retryCount: 0,
    feedback: null,
  };
}

export function recordActivityAttempt(
  state: ActivityAttemptState,
  input: {
    outcome: "correct" | "incorrect" | "reveal" | "retry";
    now: string;
    feedback: string;
  },
): ActivityAttemptState {
  if (input.outcome === "retry")
    return { ...state, state: "in_progress", retryCount: state.retryCount + 1 };
  if (state.firstAttempt !== null) return state;
  if (input.outcome === "reveal")
    return {
      ...state,
      state: "revealed",
      firstAttempt: "reveal",
      firstAttemptRecordedAt: input.now,
      feedback: input.feedback,
    };
  return {
    ...state,
    state: "completed",
    firstAttempt: input.outcome,
    firstAttemptRecordedAt: input.now,
    feedback: input.feedback,
  };
}
