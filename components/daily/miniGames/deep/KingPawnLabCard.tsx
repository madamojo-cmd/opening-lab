"use client";
import type { DeepMiniGamePublicState } from "@/lib/blundr/daily/miniGames/deep";
import { KingPawnObjectiveBanner } from "./KingPawnObjectiveBanner";
export function KingPawnLabCard({
  state,
  objective,
}: {
  state: DeepMiniGamePublicState;
  objective: "win" | "draw" | "hold";
}) {
  return (
    <article className="rounded-3xl bg-[#f4f0e8] p-4">
      <h2 className="text-lg font-black">King &amp; Pawn Lab</h2>
      <KingPawnObjectiveBanner result={objective} />
      <p className="mt-3 text-sm">
        Verified line progress: {state.userMoveIndex}
      </p>
    </article>
  );
}
