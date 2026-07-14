"use client";
import type { ContinuationPresentation } from "@/lib/blundr/daily/activities/continuationChallenge/continuationChallengeTypes";
import { ContinuationObjectiveBanner } from "./ContinuationObjectiveBanner";
import { ContinuationBoardControls } from "./ContinuationBoardControls";
import { ContinuationChallengeFeedback } from "./ContinuationChallengeFeedback";
export function ContinuationChallengeCard({
  presentation,
  objective,
  onMove,
}: {
  presentation: ContinuationPresentation;
  objective: string;
  onMove?: () => void;
}) {
  return (
    <article
      data-activity-id={presentation.activityId}
      className="rounded-3xl bg-[#f4f0e8] p-4"
    >
      <h2 className="text-lg font-black">Practical continuation</h2>
      <ContinuationObjectiveBanner objective={objective} />
      <ContinuationBoardControls
        onMove={onMove}
        disabled={
          presentation.state === "completed" ||
          presentation.state === "revealed"
        }
      />
      {presentation.feedback ? (
        <div className="mt-3">
          <ContinuationChallengeFeedback
            message={presentation.feedback.message}
          />
        </div>
      ) : null}
    </article>
  );
}
