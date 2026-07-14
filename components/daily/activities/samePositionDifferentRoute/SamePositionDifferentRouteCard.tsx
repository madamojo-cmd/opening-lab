"use client";
import type { TranspositionPresentation } from "@/lib/blundr/daily/activities/samePositionDifferentRoute/transpositionActivityTypes";
import { TranspositionPrompt } from "./TranspositionPrompt";
import { TranspositionFeedback } from "./TranspositionFeedback";
export function SamePositionDifferentRouteCard({
  presentation,
  onMove,
}: {
  presentation: TranspositionPresentation;
  onMove?: () => void;
}) {
  return (
    <article
      data-activity-id={presentation.activityId}
      className="rounded-3xl bg-[#f4f0e8] p-4"
    >
      <h2 className="text-lg font-black">Same position, different route</h2>
      <TranspositionPrompt />
      <button
        type="button"
        aria-label="Play the trained move"
        onClick={() => onMove?.()}
        className="mt-4 min-h-11 rounded-2xl bg-green-700 px-4 py-3 font-black text-white"
      >
        Play move
      </button>
      {presentation.feedback ? (
        <div className="mt-3">
          <TranspositionFeedback message={presentation.feedback.message} />
        </div>
      ) : null}
    </article>
  );
}
