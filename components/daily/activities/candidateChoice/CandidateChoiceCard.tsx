"use client";
import { useState } from "react";
import type { CandidateChoicePresentation } from "@/lib/blundr/daily/activities/candidateChoice/candidateChoiceTypes";
import { CandidateChoiceOptions } from "./CandidateChoiceOptions";
import { CandidateChoiceFeedback } from "./CandidateChoiceFeedback";
export function CandidateChoiceCard({
  presentation,
  onSubmit,
  onReveal,
}: {
  presentation: CandidateChoicePresentation;
  onSubmit?: (id: string) => void;
  onReveal?: () => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <article
      data-activity-id={presentation.activityId}
      className="rounded-3xl bg-[#f4f0e8] p-4 text-stone-900"
    >
      <h2 className="text-lg font-black">Candidate choice</h2>
      <p className="mt-2 text-sm">{presentation.prompt}</p>
      <CandidateChoiceOptions
        options={presentation.options ?? []}
        selectedId={selected}
        onSelect={setSelected}
        disabled={
          presentation.state === "completed" ||
          presentation.state === "revealed"
        }
      />
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          disabled={!selected}
          onClick={() => selected && onSubmit?.(selected)}
          className="min-h-11 rounded-2xl bg-green-700 px-4 py-3 font-black text-white"
        >
          Submit
        </button>
        <button
          type="button"
          onClick={onReveal}
          className="min-h-11 rounded-2xl border border-stone-300 px-4 py-3 font-bold"
        >
          Reveal
        </button>
      </div>
      {presentation.feedback ? (
        <div className="mt-3">
          <CandidateChoiceFeedback {...presentation.feedback} />
        </div>
      ) : null}
    </article>
  );
}
