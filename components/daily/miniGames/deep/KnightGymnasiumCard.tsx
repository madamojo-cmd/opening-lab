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
    <article className="rounded-3xl bg-[#f4f0e8] p-4">
      <h2 className="text-lg font-black">Knight Gymnasium</h2>
      <KnightRouteProgress moves={state.userMoveIndex} total={targetCount} />
    </article>
  );
}
