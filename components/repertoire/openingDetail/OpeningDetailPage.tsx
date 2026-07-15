"use client";

import type { MasteryMapReadModel } from "@/lib/blundr/masteryMap";
import { OpeningHeroCard } from "./OpeningHeroCard";
import { OpeningIntelligenceStrip } from "./OpeningIntelligenceStrip";
import { OpeningMasteryMap } from "./OpeningMasteryMap";
import { OpeningGameIntelligence } from "./OpeningGameIntelligence";
import { WeakBranchCards } from "./WeakBranchCards";
import { OpeningProgressTimeline } from "./OpeningProgressTimeline";
import { OpeningDetailEmptyState } from "./OpeningDetailEmptyState";
import { OpeningDetailStaleState } from "./OpeningDetailStaleState";
import { OpeningDetailPartialState } from "./OpeningDetailPartialState";
import { OpeningDetailErrorState } from "./OpeningDetailErrorState";

export function OpeningDetailPage({ model }: { model: MasteryMapReadModel }) {
  return (
    <main className="min-h-screen bg-[#f7f7f4] p-4 text-stone-900 sm:p-8">
      <div className="mx-auto max-w-6xl space-y-5">
        <OpeningHeroCard model={model} />
        <OpeningIntelligenceStrip model={model} />
        {model.state === "empty" ? <OpeningDetailEmptyState /> : null}
        {model.state === "stale" ? <OpeningDetailStaleState /> : null}
        {model.state === "partial" ? <OpeningDetailPartialState /> : null}
        {model.state === "error" ? <OpeningDetailErrorState /> : null}
        {model.state === "ready" ? (
          <>
            <OpeningMasteryMap nodes={model.nodes} />
            <WeakBranchCards branches={model.weakBranches} />
            <OpeningGameIntelligence
              matchedGameCount={model.importedGameMatchCount}
              freshness={model.state}
            />
            <OpeningProgressTimeline model={model} />
          </>
        ) : null}
      </div>
    </main>
  );
}
