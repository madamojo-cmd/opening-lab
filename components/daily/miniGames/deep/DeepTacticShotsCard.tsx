"use client";
import type { DeepMiniGamePublicState } from "@/lib/blundr/daily/miniGames/deep";
import { DeepTacticSequence } from "./DeepTacticSequence";
export function DeepTacticShotsCard({
  state,
}: {
  state: DeepMiniGamePublicState;
}) {
  return (
    <article className="overflow-hidden rounded-[1.75rem] border border-stone-200/80 bg-white/92 p-4 shadow-[0_18px_44px_rgba(38,31,20,0.10)]">
      <div className="flex items-start justify-between gap-4">
        <div className="max-w-[32rem]">
          <div className="text-xs font-black uppercase tracking-[0.18em] text-green-700">
            Deep minigame
          </div>
          <h2 className="mt-2 text-lg font-semibold tracking-tight text-stone-950">
            Deep Tactic Shots
          </h2>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            Find the verified sequence.
          </p>
        </div>
        <div className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-violet-700">
          Practice only
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_230px]">
        <div className="rounded-[1.25rem] border border-stone-200 bg-stone-50/90 p-4">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-500">
            Scenario objective
          </div>
          <div className="mt-2 text-sm font-semibold text-stone-900">
            Find the forcing sequence.
          </div>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            Your progress is saved as you go, and the move count stays visible
            while you work.
          </p>
        </div>
        <DeepTacticSequence moves={state.moves} />
      </div>
    </article>
  );
}
