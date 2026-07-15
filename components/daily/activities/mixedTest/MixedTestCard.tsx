"use client";
import type { MixedTestState } from "@/lib/blundr/daily/activities/mixedTest";
import { MixedTestProgress } from "./MixedTestProgress";
import { MixedTestSummary } from "./MixedTestSummary";
export function MixedTestCard({ state }: { state: MixedTestState }) {
  return (
    <article className="rounded-3xl bg-[#f4f0e8] p-4 text-stone-900">
      <h2 className="text-lg font-black">Mixed Test</h2>
      <MixedTestProgress
        current={state.currentIndex}
        total={state.items.length}
      />
      {state.state === "completed" ? (
        <MixedTestSummary score={state.score} total={state.items.length} />
      ) : (
        <p className="mt-3 text-sm">
          Work through the reserved item without hints.
        </p>
      )}
    </article>
  );
}
