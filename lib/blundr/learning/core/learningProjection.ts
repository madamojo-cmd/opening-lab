import {
  BLUNDR_FSRS_ALGORITHM_VERSION,
  BLUNDR_FSRS_DESIRED_RETENTION,
  gradeBlundrRecall,
  type StoredBlundrFsrsCard,
} from "./blundrFsrs";

export type LearningEvidenceSource =
  | "train"
  | "daily"
  | "review"
  | "imported_game"
  | "system";

/** The JSON contract submitted to the service-only PR-01 projector RPC. */
export function buildLearningProjection(input: {
  source: LearningEvidenceSource;
  firstAttempt: boolean;
  exposureId: string | null;
  correct: boolean;
  occurredAt: string;
  previousFsrs: StoredBlundrFsrsCard | null;
  previousMastery: {
    recallAttemptCount: number;
    correctRecallCount: number;
    lapseCount: number;
  } | null;
}):
  | { evidenceKind: "imported_observation"; firstAttempt: false }
  | { evidenceKind: "system_observation"; firstAttempt: false }
  | {
      evidenceKind: "recall_attempt";
      firstAttempt: boolean;
      fsrs: ReturnType<typeof gradeBlundrRecall> & {
        algorithmVersion: typeof BLUNDR_FSRS_ALGORITHM_VERSION;
        desiredRetention: typeof BLUNDR_FSRS_DESIRED_RETENTION;
      };
      mastery: {
        recallAttemptCount: number;
        correctRecallCount: number;
        lapseCount: number;
        state: "learning" | "weak";
      };
    } {
  // Provider imports are facts about games, not evidence that a learner failed
  // a recall prompt. They intentionally do not receive an FSRS grade.
  if (input.source === "imported_game")
    return { evidenceKind: "imported_observation", firstAttempt: false };
  if (!input.firstAttempt)
    return { evidenceKind: "system_observation", firstAttempt: false };
  if (input.firstAttempt && !input.exposureId)
    throw new Error("first_recall_requires_exposure");
  const fsrs = gradeBlundrRecall({
    previous: input.previousFsrs,
    correct: input.correct,
    occurredAt: input.occurredAt,
  });
  const previous = input.previousMastery ?? {
    recallAttemptCount: 0,
    correctRecallCount: 0,
    lapseCount: 0,
  };
  const mastery = {
    recallAttemptCount: previous.recallAttemptCount + 1,
    correctRecallCount: previous.correctRecallCount + Number(input.correct),
    lapseCount: previous.lapseCount + Number(!input.correct),
    state: input.correct ? ("learning" as const) : ("weak" as const),
  };
  return {
    evidenceKind: "recall_attempt",
    firstAttempt: input.firstAttempt,
    fsrs: {
      ...fsrs,
      algorithmVersion: BLUNDR_FSRS_ALGORITHM_VERSION,
      desiredRetention: BLUNDR_FSRS_DESIRED_RETENTION,
    },
    mastery,
  };
}
