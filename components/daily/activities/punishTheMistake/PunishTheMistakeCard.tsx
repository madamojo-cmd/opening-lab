"use client";
import type { PunishmentPresentation } from "@/lib/blundr/daily/activities/punishTheMistake/punishmentTypes";
import { PunishmentSequencePlayer } from "./PunishmentSequencePlayer";
import { PunishmentFeedback } from "./PunishmentFeedback";
export function PunishTheMistakeCard({
  presentation,
  onMove,
}: {
  presentation: PunishmentPresentation;
  onMove?: () => void;
}) {
  return (
    <article
      data-activity-id={presentation.activityId}
      className="rounded-3xl bg-[#f4f0e8] p-4"
    >
      <h2 className="text-lg font-black">Punish the mistake</h2>
      <p className="my-3 text-sm">
        Find the practical response to the opponent&apos;s mistake.
      </p>
      <PunishmentSequencePlayer
        onMove={onMove}
        disabled={
          presentation.state === "completed" ||
          presentation.state === "revealed"
        }
      />
      {presentation.feedback ? (
        <div className="mt-3">
          <PunishmentFeedback message={presentation.feedback.message} />
        </div>
      ) : null}
    </article>
  );
}
