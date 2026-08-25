"use client";
import type { DeepMiniGamePublicState } from "@/lib/blundr/daily/miniGames/deep";
import { KnightRouteProgress } from "./KnightRouteProgress";
export function KnightGymnasiumCard({
  state,
  targetCount,
}: {
  state: DeepMiniGamePublicState;
  targetCount: number;
}) {
  return (
    <article className="overflow-hidden rounded-[1.75rem] border border-stone-200/80 bg-white/92 p-4 shadow-[0_18px_44px_rgba(38,31,20,0.10)]">
      <div className="text-xs font-black uppercase tracking-[0.18em] text-green-700">
        Deep minigame
      </div>
      <h2 className="mt-2 text-lg font-semibold tracking-tight text-stone-950">
        Knight Gymnasium
      </h2>
      <p className="mt-2 text-sm leading-6 text-stone-600">
        Keep the route clean while your progress advances.
      </p>
      <KnightRouteProgress moves={state.userMoveIndex} total={targetCount} />
    </article>
  );
}
