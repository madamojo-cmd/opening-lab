import type {
  ActivityBuildOk,
  ActivityLifecycleState,
  AnswerSafeActivityPresentation,
} from "@/lib/blundr/daily/core/dailyActivityConformance";
export function answerSafePresentation(input: {
  build: Pick<
    ActivityBuildOk<unknown>,
    "activityId" | "cardFingerprint" | "positionKey"
  >;
  positionFen: string;
  prompt: string;
  state?: ActivityLifecycleState;
  options?: readonly { id: string; label: string }[];
  feedback?: AnswerSafeActivityPresentation["feedback"];
}): AnswerSafeActivityPresentation {
  return {
    schemaVersion: "2026-07-13.v1",
    activityId: input.build.activityId,
    cardFingerprint: input.build.cardFingerprint,
    positionKey: input.build.positionKey,
    positionFen: input.positionFen,
    prompt: input.prompt,
    state: input.state ?? "ready",
    options: input.options,
    feedback: input.feedback ?? null,
  };
}
