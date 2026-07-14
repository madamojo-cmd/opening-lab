import type {
  LearningEventV2,
  OpeningAccessSnapshot,
} from "@/lib/blundr/contracts";
import { isFailClosedAccess } from "@/lib/blundr/contracts";
import type {
  MasteryReductionResult,
  NodeMasteryState,
} from "./nodeMasteryTypes";

const emptyState = (event: LearningEventV2): NodeMasteryState => ({
  positionKey: event.position?.positionKey ?? "unknown",
  userId: event.userId,
  attempts: 0,
  firstAttemptAt: null,
  firstAttemptResult: null,
  confidence: 0,
  updatedAt: event.occurredAt,
  access: "unknown",
});

export function reduceNodeMastery(
  previous: NodeMasteryState | null,
  event: LearningEventV2,
  access: OpeningAccessSnapshot | null,
): MasteryReductionResult {
  if (!event.position || isFailClosedAccess(access))
    return { state: previous ?? emptyState(event), changed: false };
  const state = previous ?? {
    ...emptyState(event),
    positionKey: event.position.positionKey,
    access: access.decision,
  };
  const isAttempt =
    event.taxonomy === "move_correct" ||
    event.taxonomy === "move_incorrect" ||
    event.taxonomy === "daily_answered";
  if (!isAttempt || event.deletedAt !== null)
    return {
      state: { ...state, updatedAt: event.occurredAt, access: access.decision },
      changed: false,
    };
  const correct =
    event.taxonomy === "move_correct" ||
    (event.taxonomy === "daily_answered" && event.finding === null);
  const firstAttemptResult =
    state.firstAttemptResult ?? (correct ? "correct" : "incorrect");
  const firstAttemptAt = state.firstAttemptAt ?? event.occurredAt;
  const attempts = state.attempts + 1;
  const confidence = Math.min(
    1,
    Math.max(state.confidence, Math.min(0.95, 0.2 + attempts * 0.15)),
  );
  return {
    changed: true,
    state: {
      ...state,
      attempts,
      firstAttemptAt,
      firstAttemptResult,
      confidence,
      updatedAt: event.occurredAt,
      access: access.decision,
    },
  };
}
